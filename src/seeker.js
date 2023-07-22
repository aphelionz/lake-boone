const EventEmitter = require('events')

const { Octokit } = require('@octokit/rest')

let metricsInterval, seekInterval
let octokit
let cursor = 0

let metrics = {
  uniqueEvents: 0,
  prEvents: 0,
  suitablePRs: 0,
  missIncludedLangs: 0,
  missNonHireable: 0,
  candidatesFound: 0
}

function validate(data) {
  if (!Array.isArray(data)) {
    throw new Error('Invalid response data')
  }

  return Promise.resolve(data)
}

// The main data pipeline
// 1. Get new events from GitHub
// 2. Find events that are pull request merges
// 3. Find pull requests that are suitable for further considerations
// 4. Format the pull requests for the UI
// 5. Extract candidates from the pull requests
// 6. Emit the candidates
function seek (options, octokit) {
    const defaultParams = octokit.activity.listPublicEvents.endpoint.DEFAULTS || {}
    defaultParams.url = `/events?per_page=100&${ new Date().getTime() }`

    // TODO: response data validation
    octokit.request(defaultParams)
      .then(res => validate(res.data))
      .then(eventStream => getUniqueEvents(eventStream, options))
      .then(events => getPrMergeEvents(events, options))
      .then(prMergeEvents => getSuitablePRs(prMergeEvents, options))
      .then(pullRequests => filterLanguages(pullRequests, options))
      .then(pullRequests => formatSuitablePRs(pullRequests, options))
      .then((data) => extractCandidate(data, options))
      .catch(console.error)

    return seek
}


// Uses a cursor to only get new events since the last request
let cursor = 0
function getUniqueEvents (ghEvents) {
  const uniqueEvents = ghEvents.filter(d => parseInt(d.id, 10) > cursor)
  cursor = ghEvents.map(e => parseInt(e.id, 10)).sort()[ghEvents.length - 1]
  metrics.uniqueEvents += uniqueEvents.length
  return Promise.resolve(uniqueEvents)
}

function getPREvents (newEvents) {
  const prEvents = newEvents
    // Get merged pull requests
    .filter(d => d.type === 'PullRequestEvent')

  metrics.prEvents += prEvents.length
  return Promise.resolve(prEvents)
}

function getSuitablePRs (prEvents, { commentThreshold, changeSetThreshold }) {
  const suitablePRs = prEvents
    .filter(p => p.payload.action === 'closed')
    .map(p => p.payload.pull_request)
    .filter(pr => pr.merged)
    .filter(pr => pr.review_comments >= commentThreshold)
    // Make sure the PRs arent too big
    .filter(pr => (pr.additions + pr.deletions) <= changeSetThreshold)
    // We can add better bot detections it becomes an issue
    .filter(pr => pr.user.login.indexOf('bot') === -1)

  metrics.suitablePRs += suitablePRs.length
  return Promise.resolve(suitablePRs)
}

async function formatSuitablePRs (suitablePRs) {
  const formattedPRs = suitablePRs.map(pr => ({
    prHtmlUrl: pr.html_url,
    languagesUrl: pr.url.replace(/pulls(.*)$/g, 'languages'),
    username: pr.user.login
  }))

  return Promise.resolve(formattedPRs)
}

function start (auth, {
  commentThreshold = 3,
  changeSetThreshold = 5432,
  showNonHireable = false,
  targetLanguages
} = {}) {
  // 5000 authenticated requests/hour (rounded up) or 60 for non-auth :(
  const interval = auth ? 1000 : 60000

  if (!octokit) {
    octokit = new Octokit({
      // log: console,
      auth,
      userAgent: 'lakeboone v0.1.0',
      request: {}
    })
  }

  seekInterval = setInterval(() => seek(options, octokit), interval)

  metricsInterval = setInterval(async function sendMetrics () {
    const rateLimit = await octokit.rest.rateLimit.get()
    const { limit, used, remaining } = rateLimit.data.resources.core
    const event = new CustomEvent("GitHub:ratelimit", {
      detail: {...metrics, limit, used, remaining}
    });
    document.dispatchEvent(event);

    return sendMetrics
  }, 1000)
}

function stop () {
  clearInterval(metricsInterval)
  clearInterval(seekInterval)
  metrics = {
    uniqueEvents: 0,
    prEvents: 0,
    suitablePRs: 0,
    missIncludedLangs: 0,
    missNonHireable: 0,
    candidatesFound: 0
  }
  cursor = 0
}

async function extractCandidate (results, { targetLanguages, showNonHireable }) {
  for (let i = 0; i < results.length; i++) {
    const { languagesUrl, prHtmlUrl, username } = results[i]

    const repoRequest = await octokit.request(`GET ${languagesUrl}`)
    const repoLanguages = Object.keys(repoRequest.data).map(l => l.toLowerCase())
    // TODO: Introduce Set
    const includedLangs = []

    for (const lang of targetLanguages) {
      // The dominant language in the repo should be first or second in the list
      // TODO: Should be the languages in the PR, not the repo.
      if (repoLanguages[0] === lang || repoLanguages[1] === lang) includedLangs.push(lang)
    }
    if (includedLangs.length === 0) {
      metrics.missIncludedLangs++
      continue
    }

    const candidate = (await octokit.users.getByUsername({ username })).data

    if (!candidate.hireable && !showNonHireable) {
      metrics.missNonHireable++
      continue
    }

    const event = new CustomEvent("GitHub:candidate-found", {
      detail: {...candidate, includedLangs, prHtmlUrl}
    });
    document.dispatchEvent(event);

    metrics.candidatesFound++
  }
}

module.exports = {
  start,
  stop
}

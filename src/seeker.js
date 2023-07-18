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

function getNewEvents (ghEvents) {
  const uniqueEvents = ghEvents.filter(d => parseInt(d.id, 10) > cursor)
  // Update cursor to greatest known ID
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

  const defaultParams = octokit.activity.listPublicEvents.endpoint.DEFAULTS

  seekInterval = setInterval((function seek () {
    defaultParams.url = `/events?per_page=100&${ new Date().getTime() }`

    octokit.request(defaultParams)
      .then(res => res.data)
      .then(getNewEvents)
      .then(getPREvents)
      .then(prEvents => getSuitablePRs(prEvents, { commentThreshold, changeSetThreshold }))
      .then(formatSuitablePRs)
      .then((data) => extractCandidate(data, { targetLanguages, showNonHireable }))
      .catch(console.error)

    return seek
  })(), interval) // IIFE executes automatically

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

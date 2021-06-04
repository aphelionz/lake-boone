const { Octokit } = require('@octokit/rest')
const EventEmitter = require('events')
const events = new EventEmitter()

let seekInterval
let octokit
let cursor = 0

function getNewEvents (ghEvents) {
  const uniqueEvents = ghEvents.filter(d => parseInt(d.id, 10) > cursor)
  events.emit('_debug.uniqueEvents', uniqueEvents.length)

  // Update cursor to greatest known ID
  cursor = ghEvents.map(e => parseInt(e.id, 10)).sort()[ghEvents.length - 1]
  return Promise.resolve(uniqueEvents)
}

function getSuitablePRs (newEvents, { commentThreshold, changeSetThreshold }) {
  const suitablePRs = newEvents
    // Get merged pull requests
    .filter(d => d.type === 'PullRequestEvent')
    .filter(p => p.payload.action === 'closed')
    .map(p => p.payload.pull_request)
    .filter(pr => pr.merged)
    .filter(pr => pr.review_comments >= commentThreshold)
    // Make sure the PRs arent too big
    .filter(pr => (pr.additions + pr.deletions) <= changeSetThreshold)
    // We can add better bot detections it becomes an issue
    .filter(pr => pr.user.login.indexOf('bot') === -1)

  events.emit('_debug.suitablePRs', suitablePRs.length)
  return Promise.resolve(suitablePRs)
}

async function formatSuitablePRs (suitablePRs) {
  const formattedPRs = suitablePRs.map(pr => ({
    prHtmlUrl: pr.html_url,
    languagesUrl: pr.url.replace(/pulls(.*)$/g, 'languages'),
    username: pr.user.login
  }))
  events.emit('_debug.filteredEvents', formattedPRs.length)
  return Promise.resolve(formattedPRs)
}

function start (auth, {
  commentThreshold = 3,
  changeSetThreshold = 5432,
  showNonHireable = false,
  targetLanguages
} = {}) {
  // 5000 authenticated requests/hour (rounded up) or 60 for non-auth :(
  // TODO: Look into getting this from Octokit somehow? GH headers don't provide.
  const interval = auth ? 1000 : 60000
  if (!octokit) { octokit = new Octokit({ auth }) }

  seekInterval = setInterval((function seek () {
    octokit.activity.listPublicEvents({ per_page: 100 })
      .then(res => res.data)
      .then(getNewEvents)
      .then(newEvents => getSuitablePRs(newEvents, { commentThreshold, changeSetThreshold }))
      .then(formatSuitablePRs)
      .then((data) => secondFilter(data, { targetLanguages, showNonHireable }))
      .catch(console.error)

    return seek
  }()), interval) // IIFE executes automatically
}

function stop () { clearInterval(seekInterval) }

async function secondFilter (results, { targetLanguages, showNonHireable }) {
  for (let i = 0; i < results.length; i++) {
    const { languagesUrl, prHtmlUrl, username } = results[i]

    const repoRequest = await octokit.request(`GET ${languagesUrl}`)
    const repoLanguages = Object.keys(repoRequest.data).map(l => l.toLowerCase())
    const includedLangs = []
    for (const lang of targetLanguages) {
      // The dominant language in the repo should be first or second in the list
      // TODO: Should be the languages in the PR, not the repo.
      if (repoLanguages[0] === lang || repoLanguages[1] === lang) includedLangs.push(lang)
    }
    if (includedLangs.length === 0) continue

    const candidate = (await octokit.users.getByUsername({ username })).data
    if (candidate.hireable || showNonHireable) {
      events.emit('candidateFound', {
        includedLangs,
        prHtmlUrl,
        ...candidate
      })
    }
  }
}

module.exports = {
  events,
  start,
  stop
}

const { Octokit } = require('@octokit/rest')
const EventEmitter = require('events')

const events = new EventEmitter()
let seekInterval
let octokit
let cursor = 0

// Authenticated GitHub requests can be made 5000 times per
// hour, which means one request can be made every 714.3ms
// However, the public events feed isn't that busy so we just
// round up to 1000ms or 1 second.
//
// Non-authenticated users can only make 60 requests per hour :(
// TODO: Look into getting this from Octokit or the GH headers?
function start (auth, {
  commentThreshold = 3,
  changeSetThreshold = 5432,
  showNonHireable = false,
  targetLanguages
} = {}) {
  const interval = auth ? 1000 : 60000
  octokit = new Octokit({ auth })
  seekInterval = setInterval((function seek () {
    octokit.activity.listPublicEvents({ per_page: 100 })
      .then(res => {
        return firstFilter(res.data, { commentThreshold, changeSetThreshold })
      })
      .then((data) => secondFilter(data, { targetLanguages, showNonHireable }))
      .catch(console.error)

    return seek
  }()), interval)
}

function stop () { clearInterval(seekInterval) }

function firstFilter (ghEvents, { commentThreshold, changeSetThreshold }) {
  const uniqueEvents = ghEvents.filter(d => parseInt(d.id, 10) > cursor)
  events.emit('_debug.uniqueEvents', uniqueEvents.length)

  const suitablePRs = uniqueEvents
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

  const filteredEvents = suitablePRs.map(pr => ({
    prHtmlUrl: pr.html_url,
    languagesUrl: pr.url.replace(/pulls(.*)$/g, 'languages'),
    username: pr.user.login
  }))
  events.emit('_debug.filteredEvents', filteredEvents.length)

  cursor = ghEvents.map(e => parseInt(e.id, 10)).sort()[ghEvents.length - 1]
  return Promise.resolve(filteredEvents)
}

async function secondFilter (results, { targetLanguages, showNonHireable }) {
  for (let i = 0; i < results.length; i++) {
    const { languagesUrl, prHtmlUrl, username } = results[i]

    const repoRequest = await octokit.request(`GET ${languagesUrl}`)
    const repoLanguages = Object.keys(repoRequest.data).map(l => l.toLowerCase())
    const includedLangs = []
    for (const lang of targetLanguages) {
      // The dominant language in the repo should be first or second in the list
      if (repoLanguages[0] === lang || repoLanguages[1] === lang) includedLangs.push(lang)
    }
    if (includedLangs.length === 0) continue

    // TODO: Refactor to "output" function of some sort
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

const { Octokit } = require("@octokit/rest");

// Initialization
const auth = process.env.GH_TOKEN || null
const parsedThreshold = parseInt(process.env.COMMENT_THRESHOLD, 10)
const commentThreshold = parsedThreshold ? parsedThreshold : 3
const showNonHireable = process.env.SHOW_NON_HIREABLE ? true : false
const changeSetThreshold = process.env.CHANGESET_THRESHOLD || 5432
const targetLanguages = process.env.LANGUAGES.split(',').map(l => l.toLowerCase())
if (targetLanguages.length === 0)
  throw new Error("Please specify at least one programming language using LANGUAGES")

const octokit = new Octokit({ auth });


// The primary seek function
// TODO: This is a blunt instrument and produces a lot of duplicate results.
// A smarter seek would ensure that each GH event is only processed once
async function seek() {
  const per_page = 100
  const eventRequest = await octokit.activity.listPublicEvents({ per_page })

  // This works well as the _first_ slice here because it's the harshest filter.
  const results = eventRequest.data
    .filter(d => d.type === "PullRequestEvent")
    .filter(p => p.payload.action === 'closed')
    .map(p => p.payload.pull_request)
    .filter(pr => pr.merged)
    .filter(pr => pr.review_comments >= commentThreshold)
    // Make sure the PRs arent too big
    .filter(pr => (pr.additions + pr.deletions) <= changeSetThreshold)
    // We can add better bot detections it becomes an issue
    .filter(pr => pr.user.login.indexOf('bot') === -1)
    .map(pr => ({
      prHtmlUrl: pr.html_url,
      languagesUrl: pr.url.replace(/pulls(.*)$/g, "languages"),
      username: pr.user.login
    }))


  // FIXME: I hate having to switch idioms here. Would be nice to just continue
  // down the filter + map chain, but oh well: async / await!
  // Perhaps utilize the graphQL api at _this_ point?
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
    const userData = (await octokit.users.getByUsername({ username })).data
    if (userData.hireable) {
      console.log(`${includedLangs} ✅ ${username} created ${prHtmlUrl} and may be job seeking`)
      if (userData.company)
        console.log(`  🏢 ${username} currently works at: ${userData.company}`)
      if (userData.twitter_username)
        console.log(`  🐦 ${username} can be found on Twitter: ${userData.twitter_username}`)
      if (userData.email)
        console.log(`  📧 ${username} can be reached via: ${userData.email}`)
      if (userData.location)
        console.log(`  📍 ${username} is located in: ${userData.location}`)
      if (userData.blog)
        console.log(`  🕸️  ${username} wants you to click: ${userData.blog}`)
    } else {
      if(showNonHireable)
        console.log(`${includedLangs} 🕵️  ${username} created ${prHtmlUrl}`)
    }
  }
}

const seekInterval = setInterval(seek, 2000)

// Exit cleanly on SIGINT
process.on('SIGINT', function(e) {
  console.log("Cleanly shutting down")
  // TODO: emit stats
  clearInterval(seekInterval)
  process.exit()
});

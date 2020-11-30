const { Octokit } = require("@octokit/rest");

// Environment variable stuff
// TODO: Validation
const auth = process.env.GH_TOKEN || null
const parsedThreshold = parseInt(process.env.COMMENT_THRESHOLD, 10)
const commentThreshold = parsedThreshold ? parsedThreshold : 3
// TODO: in the list of GH languages
const targetLanguages = process.env.LANGUAGES.split(',').map(l => l.toLowerCase())
if (targetLanguages.length === 0)
  throw new Error("Please specify at least one programming language using LANGUAGES")

const octokit = new Octokit({ auth });

// Listen to the GitHub public events firehose
// We're looking for merged pull requests with a number
// of review comments above the threshold
// We can add better bot detections if there's an issue
// TODO: This is a blunt instrument and produces a lot of duplicate
// results. A smarter seek would ensure that each GH event is only
// processed once
async function seek(language) {
  const per_page = 100
  const data = (await octokit.activity.listPublicEvents({ per_page })).data

  // This works well as the _first_ slice here because
  // it's the most specific and harsh filter.
  const results = data
    .filter(d => d.type === "PullRequestEvent")
    .filter(p => p.payload.action === 'closed')
    .map(p => p.payload.pull_request)
    .filter(pr => pr.merged)
    .filter(pr => pr.review_comments >= commentThreshold)
    .filter(pr => pr.user.login.indexOf('bot') === -1)
    .map(pr => ({
      prHtmlUrl: pr.html_url,
      languagesUrl: pr.url.replace(/pulls(.*)$/g, "languages"),
      username: pr.user.login
    }))

  // SPLIT people - hireable, not hireable
  for (let i = 0; i < results.length; i++) {
    const { languagesUrl, prHtmlUrl, username } = results[i]

    // The dominant language in the repo should be first or second in the list
    const repoRequest = await octokit.request(`GET ${languagesUrl}`)
    const repoLanguages = Object.keys(repoRequest.data).map(l => l.toLowerCase())
    const includedLangs = []
    for (const lang of targetLanguages) {
      if (repoLanguages[0] === lang || repoLanguages[1] === lang) includedLangs.push(lang)
    }
    if (includedLangs.length === 0) continue

    const userData = (await octokit.users.getByUsername({ username })).data
    if (userData.hireable) {
      console.log(`${includedLangs} ✅ ${username} created ${prHtmlUrl} and may be looking for a job`)
      if (userData.twitter_username)
        console.log(`  🐦 ${username} can be found on twitter: ${userData.twitter_username}`)
    } else {
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

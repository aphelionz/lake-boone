const fs = require('fs')

const { Octokit } = require('@octokit/rest')
const { RequestError } = require('@octokit/request-error')
const { throttling } = require('@octokit/plugin-throttling')

const CerebroOctokit = Octokit.plugin(throttling)

const octokit = new CerebroOctokit({
  auth: `token ${process.env.GH_TOKEN}`,
  throttle: {
    onRateLimit: (retryAfter, options) => {
      octokit.log.warn(
        `Request quota exhausted for request ${options.method} ${options.url}`
      )

      console.log(`Retrying after ${retryAfter / 60} minutes!`)
      return true
    },
    onAbuseLimit: (retryAfter, options) => {
      // does not retry, only logs a warning
      octokit.log.warn(
        `Abuse detected for request ${options.method} ${options.url}`
      )
    }
  }
})

async function seek (langs = new Set(), repos = new Set(), strikes = 0, maxStrikes = 10) {
  console.log(`${langs.size} languages and ${repos.size} repos. ${'X'.repeat(strikes)}`)

  const watermark = langs.size

  try {
    const res = await octokit.activity.listPublicEvents({ per_page: 100 })
    process.stdout.write('|')

    const repoNames = res.data
      .filter(e => e.repo.name)
      .map(e => e.repo.name)

    for (const name of repoNames) {
      if (repos.has(name)) {
        process.stdout.write('.')
        continue
      }

      const [owner, repo] = name.split('/')
      try {
        const languages = await octokit.rest.repos.listLanguages({ owner, repo })
        process.stdout.write('-')
        Object.keys(languages.data).forEach(lang => langs.add(lang))
      } catch (e) {
        process.stdout.write('X')
      }
    }
    repoNames.forEach(name => repos.add(name))
    process.stdout.write('|\n')
  } catch (e) {
    if (e instanceof RequestError) {
      process.stdout.write('X')
    }
  }

  strikes++
  if (watermark !== langs.size) strikes = 0
  console.log(watermark, langs.size, strikes, maxStrikes)
  if (strikes === maxStrikes) {
    console.log(Array.from(langs).join('\n'))
    fs.writeFile('./data/languages.txt', Array.from(langs).join('\n'), process.exit)
  }

  seek(langs, repos, strikes, maxStrikes)
}

seek()

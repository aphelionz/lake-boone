// Uses a cursor to only get new events since the last request
let cursor = 0
export function getUniqueEvents (ghEvents, options, metrics) {
  const uniqueEvents = ghEvents.filter(d => parseInt(d.id, 10) > cursor)
  cursor = ghEvents.map(e => parseInt(e.id, 10)).sort()[ghEvents.length - 1]
  metrics.uniqueEvents += uniqueEvents.length
  return Promise.resolve({uniqueEvents, metrics})
}

export function getPrMergeEvents (uniqueEvents, options, metrics) {
  const prMergeEvents = uniqueEvents
    // Get merged pull requests
    .filter(event => event.type === 'PullRequestEvent')
    .filter(event => event.payload.action === 'closed')
    .filter(pr => pr.payload.pull_request.merged)

  metrics.prEvents += prMergeEvents.length

  return Promise.resolve({prMergeEvents, metrics})
}

export function getSuitablePRs (prMergeEvents, { commentThreshold, changeSetThreshold }, metrics) {
  // Merged PRs only
  const suitablePRs = prMergeEvents.map(p => p.payload.pull_request)

  for (const pr of suitablePRs) {
    // Make sure we're over our comment threshold
    if (pr.review_comments < commentThreshold) {
      pr.DELETE_ME = true
      metrics.missCommentCount += 1
      continue
    }

    // Make sure the PRs arent too big
    if (pr.additions + pr.deletions > changeSetThreshold) {
      pr.DELETE_ME = true
      metrics.missChangesetSize += 1
      continue
    }

    // We can add better bot detections it becomes an issue
    if (pr.user.login.indexOf('bot') !== -1) {
      pr.DELETE_ME = true
      metrics.missBot += 1
      continue
    }

    metrics.suitablePRs += 1
  }

  const filteredPRs = suitablePRs.filter(pr => !pr.DELETE_ME)
  return Promise.resolve({ filteredPRs, metrics })
}

export async function formatSuitablePRs (suitablePRs, options, metrics) {
  const formattedPRs = suitablePRs.map(pr => ({
    prHtmlUrl: pr.html_url,
    username: pr.user.login
  }))

  return Promise.resolve({ formattedPRs, metrics })
}

export async function filterLanguages (pullRequests, octokit, { targetLanguages, showNonHireable }, metrics) {
  for (let i = 0; i < pullRequests.length; i++) {
    const languagesUrl = pullRequests[i].url.replace(/pulls(.*)$/g, 'languages')

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
      pullRequests[i].DELETE_ME = true
      metrics.missIncludedLangs++
      continue
    }
  }

  const filteredPRs = pullRequests.filter(pr => !pr.DELETE_ME)
  return Promise.resolve({ filteredPRs, metrics })
}

// This requires an Octokit request, so we'll save this for later on
// in the pipeline when there are fewer data to process
export async function extractCandidate (formattedPRs, { targetLanguages, showNonHireable }, metrics) {
  for (let i = 0; i < formattedPRs.length; i++) {
    const { languagesUrl, prHtmlUrl, username } = results[i]

    const candidate = (await octokit.users.getByUsername({ username })).data

    if (!candidate.hireable && !showNonHireable) {
      metrics.missNonHireable++
      continue
    }

    metrics.candidates.push({...candidate, prHtmlUrl})
    metrics.candidatesFound++
  }

  return Promise.resolve(metrics)
}

/* global fetch */

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import seeker from '../src/seeker.js'

import GitHubLogin from '../components/GitHubLogin'
import CandidateList from '../components/CandidateList'

const CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID

function startSeeker(e) {
  // TODO: UI-ify
  const COMMENT_THRESHOLD = 3
  const SHOW_NON_HIREABLE = true
  const CHANGESET_THRESHOLD = 4321
  const targetLanguages = "javascript,rust,typescript,solidity,c++"
    .split(',').map(l => l.toLowerCase())

  seeker.start(
    e.detail.authToken,
    {
      parsedThreshold: parseInt(COMMENT_THRESHOLD, 10),
      showNonHireable: SHOW_NON_HIREABLE,
      changeSetThreshold: CHANGESET_THRESHOLD,
      targetLanguages
    }
  )

  seeker.events.on('candidate-found', console.log)
  // seeker.events.on('metrics', metrics => setMetrics({...metrics}))
}

function HomePage (props) {
  const [started, setStarted] = useState(false)
  const [metrics, setMetrics] = useState({
    uniqueEvents: 0,
    prEvents: 0,
    suitablePRs: 0,
    missIncludedLangs: 0,
    missNonHireable: 0,
    candidatesFound: 0,
    limit: 0,
    remaining: 0,
    used: 0
  })

  const router = useRouter()
  useEffect(() => {
    if (router.query.code) {
      storeProps(props)
      router.push('/')
    }

    if (process.browser && !started) {
      document.addEventListener('GitHub:authToken', startSeeker)
      setStarted(true)
    }

    return function cleanup() {
      document.removeEventListener('GitHub:authToken', startSeeker)
      if (started) seeker.stop()
    }
  })

  return (
    <div>
      <GitHubLogin clientId={ CLIENT_ID } />
      <h1>Lake Boone</h1>

      <h2>Stats</h2>
      <ul>
        <li>Unique Events: { metrics.uniqueEvents }</li>
        <li>PR Events: { metrics.prEvents }</li>
        <li>Suitable PRs: { metrics.suitablePRs }</li>
        <li>Miss (not in included langs): { metrics.missIncludedLangs }</li>
        <li>Miss (non-hireable): { metrics.missNonHireable }</li>
        <li>Candidates Found: { metrics.candidatesFound }</li>
        <li>Rate limit: { metrics.used } / { metrics.limit } ({metrics.remaining} remaining)</li>
      </ul>

      <h2>Candidates</h2>
      <CandidateList />
    </div>
  )
}

export default HomePage

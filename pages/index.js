import { useState } from 'react'

import seeker from '../src/seeker.js'
import Seeker from '../components/Seeker'
import GitHubLogin from '../components/GitHubLogin'

function HomePage (props) {
  const [languages, setLanguages] = useState('JavaScript, Rust, Solidity')

  return (
    <div>
      <GitHubLogin clientId={ process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID } />
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

import { useEffect, useState } from 'react'
import seeker from '../src/seeker.js'

import CandidateList from '../components/CandidateList'

export default function Seeker (props) {
  const [candidates, setCandidates] = useState([])
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

  function startSeeker (e) {
    if (started) return

    seeker.start(
      e.detail.authToken,
      {
        commentThreshold: parseInt(props.commentThreshold, 10),
        showNonHireable: props.showNonHireable,
        changeSetThreshold: props.changeSetThreshold,
        targetLanguages: props.targetLanguages.split(',').map(l => l.toLowerCase())
      }
    )

    seeker.events.on('candidate-found', candidate => {
      candidates.push(candidate)
      setCandidates(candidates)
    })
    seeker.events.on('metrics', metrics => setMetrics({ ...metrics }))
    setStarted(true)
  }

  useEffect(() => {
    document.addEventListener('GitHub:authToken', startSeeker)

    return function cleanup () {
      document.removeEventListener('GitHub:authToken', startSeeker)
      if (started) {
        seeker.stop()
        setStarted(false)
      }
    }
  }, [started])

  return (
    <>
      <h2>Candidates</h2>
      <CandidateList candidates={candidates} />

      <h2>Stats</h2>
      <ul>
        <li>Unique Events: {metrics.uniqueEvents}</li>
        <li>PR Events: {metrics.prEvents}</li>
        <li>Suitable PRs: {metrics.suitablePRs}</li>
        <li>Miss (not in included langs): {metrics.missIncludedLangs}</li>
        <li>Miss (non-hireable): {metrics.missNonHireable}</li>
        <li>Candidates Found: {metrics.candidatesFound}</li>
        <li>Rate limit: {metrics.used} / {metrics.limit} ({metrics.remaining} remaining)</li>
      </ul>
    </>
  )
}

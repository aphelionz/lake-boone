import { useEffect, useState } from 'react'
import seeker from '../src/seeker.js'

import CandidateList from '../components/CandidateList'
import Sankey from '../components/Sankey'

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

      <h2>Pipeline</h2>
      <Sankey
        uniqueEvents={metrics.uniqueEvents}
        prEvents={metrics.prEvents}
        suitablePRs={metrics.suitablePRs}
        missIncludedLangs={metrics.missIncludedLangs}
        missNonHireable={metrics.missNonHireable}
        candidatesFound={metrics.candidatesFound}
      />
    </>
  )
}

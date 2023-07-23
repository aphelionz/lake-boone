import { useContext, useEffect, useState } from 'react'
import seeker from '../src/seeker.js'

import Sankey from '../components/Sankey'
import { AuthContext } from '../components/Interface'

export default function Seeker (props) {
  const context = useContext(AuthContext)

  const isLoggedIn = context.accessToken !== null
  const showNonHireable = props.showNonHireable || false
  const targetLanguages = props.targetLanguages ?
    props.targetLanguages.split(',').map(l => l.toLowerCase()) : 'C++,Rust,Go'
  const commentThreshold = props.commentThreshold || 3
  const changeSetThreshold = props.changeSetThreshold || 5432
  const onCandidateFound = props.onCandidateFound || console.log

  const [started, setStarted] = useState(false)
  const [metrics, setMetrics] = useState({})

  useEffect(() => {
    if (started) return

    seeker.start(
      context.accessToken,
      { commentThreshold, showNonHireable, changeSetThreshold, targetLanguages }
    )

    document.addEventListener('GitHub:ratelimit', e => {
      const metrics = e.detail
      setMetrics({ ...metrics })
    })

    document.addEventListener('GitHub:candidate-found', e => {
      const candidate = e.detail
      onCandidateFound(candidate)
    })
    setStarted(true)
  }, [started])

  return (
    <>
      <h3>Pipeline</h3>
      <Sankey metrics={metrics} />
    </>
  )
}

export default function Debug (props) {
  const metrics = {}

  fetch('/api/metrics').then(res => res.json()).then(data => {
    console.log(data)
  })

  return (
    <div className='lb-debugger'>
      <div>Rate limit: {metrics.used} / {metrics.limit} ({metrics.remaining} remaining)</div>
    </div>
  )
}

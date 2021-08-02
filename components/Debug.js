export default function Debug (props) {
  const metrics = {}

  return (
    <div className='lb-debugger'>
      <div>Rate limit: {metrics.used} / {metrics.limit} ({metrics.remaining} remaining)</div>
    </div>
  )
}

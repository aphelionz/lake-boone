import { useEffect } from 'react'

export default function LoginRedirectPage(props) {
  useEffect(() => {
    window.location = '/'
  }, [])

  return (
    <div>
      <p>You are being redirected back to the app...</p>
    </div>
  )
}


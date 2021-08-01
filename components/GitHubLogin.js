import { useEffect, useState } from 'react'


function ghLogout () {
  if (process.browser) {
    document.cookie.split(";")
      .forEach(function(c) {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
  }
}

export default function GitHubLogin(props) {
  const OAUTH_LINK = 'https://github.com/login/oauth/authorize?'
  const REDIRECT_URI = 'http://127.0.0.1:3000/api/github_auth'

  const [clientId, setClientId] = useState(props.clientId)
  // TODO: Random useEffect stuff
  const [ghState, setGhState] = useState(0)
  const [authToken, setAuthToken] = useState('')

  const searchParams = new URLSearchParams()
  searchParams.append('client_id', clientId)
  searchParams.append('redirect_uri', REDIRECT_URI)
  searchParams.append('type', 'user_agent')

  useEffect(() => {
    if (process.browser) {
      try {
        const token = document.cookie
          .split(';')
          .find(row => row.startsWith('access_token='))
          .split('=')[1]
        setAuthToken(token)

        const authTokenEvent = new CustomEvent('GitHub:authToken', { detail: { authToken } })
        document.dispatchEvent(authTokenEvent)
      } catch (err) {
        console.warn(err.message)
      }
    }
  })

  let link = (<a href={OAUTH_LINK + searchParams.toString()}>Login with GH</a>)
  if (authToken) {
    link = <a href="/api/github_logout">Log out</a>
  }

  return link
}

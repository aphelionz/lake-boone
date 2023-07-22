import Link from 'next/link'
import { useContext } from 'react'

import { AuthContext } from '../components/Interface'

const OAUTH_LINK = 'https://github.com/login/oauth/authorize?'

function LoginLink (props) {
  if (props.isLoggedIn) return (<div />)

  const searchParams = new URLSearchParams()
  searchParams.append('client_id', props.context.ghClientId)
  searchParams.append('redirect_uri', props.context.redirectUri)
  searchParams.append('type', 'user_agent')

  return (
    <p>
      <Link href={OAUTH_LINK + searchParams.toString()}>Log in with GitHub</Link> to get started.
    </p>
  )
}

function LogoutLink (props) {
  if (!props.isLoggedIn) return (<div />)
  return (<Link className="logout" href="/api/github_logout">Log out</Link>)
}

export default function Header(props) {
  const context = useContext(AuthContext)
  const isLoggedIn = context && context.accessToken !== null

  return(
    <header>
      <LogoutLink isLoggedIn={isLoggedIn} />

      <h1>Lake Boone</h1>
      <h2>A Heuristics-Based, Real Time, and Ephemeral, OSINT Recruiting Tool</h2>

      <LoginLink context={context} isLoggedIn={isLoggedIn} />
    </header>
  )
}

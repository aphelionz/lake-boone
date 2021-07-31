/* global fetch */

import { useRouter } from 'next/router'
import { useEffect } from 'react'

const REDIRECT_URI = 'http://127.0.0.1:3000'
const CLIENT_ID = process.env.GITHUB_CLIENT_ID
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const ALLOW_SIGNUP = true

const OAUTH_LINK = 'https://github.com/login/oauth/authorize?'
const ACCESS_TOKEN_LINK = 'https://github.com/login/oauth/access_token?'

function getISODateFromNow (deltaString) {
  const delta = parseInt(deltaString, 10)
  const dateNow = new Date().getTime()
  const adjustedDate = new Date(dateNow + delta)
  return adjustedDate.toString()
}

// Also:
//  - console.log(props.scope)
//  - console.log(props.token_type)
function storeProps (props) {
  if (process.browser) {
    if (props.access_token && props.expires_in) {
      const date = getISODateFromNow(props.expires_in)
      document.cookie = `access_token=${props.access_token};expires=${date};samesite`
    }

    if (props.refresh_token && props.refresh_token_expires_in) {
      const date = getISODateFromNow(props.refresh_token_expires_in)
      document.cookie = `refresh_token=${props.refresh_token};expires=${date};samesite`
    }
  }
}

function HomePage (props) {
  const router = useRouter()
  if (router.query.code) {
    storeProps(props)

    useEffect(() => {
      router.push('/')
    })
  }

  const searchParams = new URLSearchParams()
  searchParams.append('client_id', CLIENT_ID)
  searchParams.append('redirect_uri', REDIRECT_URI)
  searchParams.append('allow_signup', ALLOW_SIGNUP)
  // TODO: Use window.crypto
  // searchParams.append('state', Math.random().toString())

  return (<a href={OAUTH_LINK + searchParams.toString()}>Welcome to Next.js!</a>)
}

export async function getServerSideProps (context) {
  const response = { props: {} }
  if (!context.query.code) return response

  const searchParams = new URLSearchParams()
  searchParams.append('client_id', CLIENT_ID)
  searchParams.append('client_secret', CLIENT_SECRET)
  searchParams.append('redirect_uri', REDIRECT_URI)
  searchParams.append('code', context.query.code)

  try {
    const res = await fetch(ACCESS_TOKEN_LINK + searchParams.toString(), {
      method: 'POST'
    })

    const accessParams = new URLSearchParams(await res.text())
    for (const [key, value] of accessParams) {
      response.props[key] = value
    }

    return response
  } catch (err) {
    console.error(err.message)
    return response
  }
}

export default HomePage

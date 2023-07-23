import { createOAuthAppAuth, createOAuthUserAuth } from '@octokit/auth-oauth-app'

const GITHUB_CLIENT_SECRET = global.process.env.GITHUB_CLIENT_SECRET
const NEXT_PUBLIC_GITHUB_CLIENT_ID = global.process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID

export default async function handler (req, res) {
  const response = {}

  try {
    const appAuth = createOAuthAppAuth({
      clientType: "github-app",
      clientId: NEXT_PUBLIC_GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    })

    const userAuth = await appAuth({
      type: "oauth-user",
      code: req.query.code,
      factory: createOAuthUserAuth,
    })

    const { token, expiresAt, refreshToken, refreshTokenExpiresAt } = await userAuth()

    const tokenExp = new Date(expiresAt).toString()
    const refreshExp = new Date(refreshTokenExpiresAt).toString()

    const accessCookie = `access_token=${token};expires=${tokenExp};samesite=Strict;path=/`
    // TODO: why doesnt the refreshCookie expire when it should?
    const refreshCookie = `refresh_token=${refreshToken};expires=${refreshExp};samesite=Strict;path=/`

    res.setHeader('Set-Cookie', [accessCookie, refreshCookie])
    res.redirect(307, '/login-redirect')
  } catch (err) {
    response.err = true
    response.message = err.message
    res.json(response)
  }
}

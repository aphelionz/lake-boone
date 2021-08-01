import { createOAuthAppAuth, createOAuthUserAuth } from '@octokit/auth-oauth-app'

const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID

export default async function handler (req, res) {
  const response = {}

  try {
    const appAuth = createOAuthAppAuth({
      clientType: "github-app",
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
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
    res.redirect('/')
  } catch (err) {
    response.err = true
    response.message = err.message
    res.json(response)
  }
}

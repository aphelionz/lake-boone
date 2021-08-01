export default async function handler (req, res) {
  const accessCookie = `access_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  const refreshCookie = `refresh_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`

  res.setHeader('Set-Cookie', [accessCookie, refreshCookie])
  res.redirect('/')
}

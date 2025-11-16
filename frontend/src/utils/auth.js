import oidc from '../services/oidc'

export async function isAuthenticated() {
  const user = await oidc.getUser()
  return !!(user && !user.expired)
}

export function redirectToHostedUI() {
  // Use oidc client login flow
  oidc.login()
}

export async function ensureAuthOrRedirect() {
  const user = await oidc.getUser()
  if (user && !user.expired) return true
  redirectToHostedUI()
  return false
}

import { UserManager, WebStorageStateStore } from 'oidc-client-ts'

// Support either a full authority URL (VITE_COGNITO_AUTHORITY) or a hosted UI domain (VITE_COGNITO_DOMAIN)
let authority
if (import.meta.env.VITE_COGNITO_AUTHORITY) {
  authority = import.meta.env.VITE_COGNITO_AUTHORITY
} else if (import.meta.env.VITE_COGNITO_DOMAIN) {
  // if user provided just the domain, prefix with https://
  authority = `https://${import.meta.env.VITE_COGNITO_DOMAIN}`
} else {
  authority = undefined
}

const settings = {
  authority,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT || `${window.location.origin}/callback`,
  response_type: 'code',
  scope: 'openid profile email',
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: window.sessionStorage })
}

const userManager = new UserManager(settings)

export async function login() {
  return userManager.signinRedirect()
}

export async function handleCallback() {
  // Exchanges code for tokens and stores user in the configured store
  const user = await userManager.signinRedirectCallback()
  return user
}

export async function getUser() {
  return userManager.getUser()
}

export async function getAccessToken() {
  const u = await userManager.getUser()
  return u?.access_token
}

export async function logout() {
  return userManager.signoutRedirect()
}

export default {
  userManager,
  login,
  handleCallback,
  getUser,
  getAccessToken,
  logout
}

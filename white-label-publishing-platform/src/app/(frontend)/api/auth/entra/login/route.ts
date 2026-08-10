import { NextResponse } from 'next/server'

import {
  createOpaqueToken,
  entraAuthCookieNames,
  getEntraAuthConfig,
  getEntraBaseURL,
  isSecureCookie,
} from '@/auth/entra/config'
import { createCodeChallenge } from '@/auth/entra/pkce'

export const dynamic = 'force-dynamic'

export function GET(): NextResponse {
  const authConfig = getEntraAuthConfig()

  if (!authConfig.enabled) {
    return NextResponse.json({ error: 'Entra ID SSO is not configured.' }, { status: 503 })
  }

  const state = createOpaqueToken()
  const nonce = createOpaqueToken()
  const codeVerifier = createOpaqueToken()
  const authorizeURL = new URL(`${getEntraBaseURL(authConfig.tenantId)}/oauth2/v2.0/authorize`)

  authorizeURL.searchParams.set('client_id', authConfig.clientId)
  authorizeURL.searchParams.set('response_type', 'code')
  authorizeURL.searchParams.set('redirect_uri', authConfig.redirectUri)
  authorizeURL.searchParams.set('response_mode', 'query')
  authorizeURL.searchParams.set('scope', 'openid profile email')
  authorizeURL.searchParams.set('state', state)
  authorizeURL.searchParams.set('nonce', nonce)
  authorizeURL.searchParams.set('code_challenge', createCodeChallenge(codeVerifier))
  authorizeURL.searchParams.set('code_challenge_method', 'S256')

  const response = NextResponse.redirect(authorizeURL)
  const cookieOptions = {
    httpOnly: true,
    maxAge: 10 * 60,
    path: '/',
    sameSite: 'lax' as const,
    secure: isSecureCookie(),
  }

  response.cookies.set(entraAuthCookieNames.state, state, cookieOptions)
  response.cookies.set(entraAuthCookieNames.nonce, nonce, cookieOptions)
  response.cookies.set(entraAuthCookieNames.codeVerifier, codeVerifier, cookieOptions)

  return response
}

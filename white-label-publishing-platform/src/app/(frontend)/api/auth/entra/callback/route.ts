import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

import config from '@payload-config'
import type { User } from '@/payload-types'
import { entraAuthCookieNames, getEntraAuthConfig, getEntraBaseURL } from '@/auth/entra/config'
import { getEmailFromClaims } from '@/auth/entra/claims'
import { createPayloadSessionForUser } from '@/auth/entra/session'
import { EntraAuthError, verifyEntraIDToken } from '@/auth/entra/verify'

export const dynamic = 'force-dynamic'

const adminURL = new URL('/admin', process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000')
const loginURL = new URL(
  '/admin/login',
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
)

const clearEntraCookies = (response: NextResponse): void => {
  response.cookies.delete(entraAuthCookieNames.state)
  response.cookies.delete(entraAuthCookieNames.nonce)
  response.cookies.delete(entraAuthCookieNames.codeVerifier)
}

const redirectToLoginWithError = (message: string): NextResponse => {
  const url = new URL(loginURL)
  url.searchParams.set('ssoError', message)

  const response = NextResponse.redirect(url)
  clearEntraCookies(response)

  return response
}

export async function GET(request: Request): Promise<NextResponse> {
  const authConfig = getEntraAuthConfig()

  if (!authConfig.enabled) {
    return redirectToLoginWithError('Entra ID SSO is not configured.')
  }

  const url = new URL(request.url)
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  if (error) {
    return redirectToLoginWithError(errorDescription || error)
  }

  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = new Map(
    cookieHeader.split(';').map((cookie) => {
      const [name, ...valueParts] = cookie.trim().split('=')
      return [name, decodeURIComponent(valueParts.join('='))]
    }),
  )
  const expectedState = cookies.get(entraAuthCookieNames.state)
  const nonce = cookies.get(entraAuthCookieNames.nonce)
  const codeVerifier = cookies.get(entraAuthCookieNames.codeVerifier)

  if (!code || !state || !expectedState || state !== expectedState || !nonce || !codeVerifier) {
    return redirectToLoginWithError('The Entra ID sign-in state was invalid or expired.')
  }

  try {
    const tokenResponse = await fetch(`${getEntraBaseURL(authConfig.tenantId)}/oauth2/v2.0/token`, {
      body: new URLSearchParams({
        client_id: authConfig.clientId,
        client_secret: authConfig.clientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: authConfig.redirectUri,
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })

    if (!tokenResponse.ok) {
      return redirectToLoginWithError('Entra ID rejected the authorization code.')
    }

    const tokenData = (await tokenResponse.json()) as { id_token?: string }
    if (!tokenData.id_token) {
      return redirectToLoginWithError('Entra ID did not return an ID token.')
    }

    const claims = await verifyEntraIDToken({
      authConfig,
      idToken: tokenData.id_token,
      nonce,
    })
    const email = getEmailFromClaims(claims)

    if (!email) {
      return redirectToLoginWithError('The Entra ID token did not include an email address.')
    }

    const payload = await getPayload({ config })
    const users = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1,
      pagination: false,
      where: {
        email: {
          equals: email,
        },
      },
    })
    const user = users.docs[0] as User | undefined

    if (!user) {
      return redirectToLoginWithError('No Payload admin user is bound to that Entra ID email.')
    }

    const response = NextResponse.redirect(adminURL)
    clearEntraCookies(response)
    response.headers.append(
      'set-cookie',
      await createPayloadSessionForUser({
        request,
        user,
      }),
    )

    return response
  } catch (error) {
    const message =
      error instanceof EntraAuthError
        ? error.message
        : 'The Entra ID sign-in could not be completed.'
    return redirectToLoginWithError(message)
  }
}

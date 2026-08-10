import { createRemoteJWKSet, jwtVerify } from 'jose'

import { type EntraAuthConfig, getEntraBaseURL, getEntraAuthority } from '@/auth/entra/config'
import { getEmailFromClaims, hasMfaClaim, type EntraIDTokenClaims } from '@/auth/entra/claims'

export class EntraAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EntraAuthError'
  }
}

export const verifyEntraIDToken = async ({
  authConfig,
  idToken,
  nonce,
}: {
  authConfig: EntraAuthConfig
  idToken: string
  nonce: string
}): Promise<EntraIDTokenClaims> => {
  const authority = getEntraAuthority(authConfig.tenantId)
  const jwks = createRemoteJWKSet(
    new URL(`${getEntraBaseURL(authConfig.tenantId)}/discovery/v2.0/keys`),
  )
  const { payload } = await jwtVerify(idToken, jwks, {
    audience: authConfig.clientId,
    issuer: authority,
  })

  const claims = payload as EntraIDTokenClaims

  if (claims.nonce !== nonce) {
    throw new EntraAuthError('The Entra ID sign-in nonce did not match.')
  }

  if (claims.tid && claims.tid !== authConfig.tenantId) {
    throw new EntraAuthError('The Entra ID tenant did not match this application.')
  }

  const email = getEmailFromClaims(claims)
  if (!email) {
    throw new EntraAuthError('The Entra ID token did not include an email address.')
  }

  if (authConfig.allowedEmails.length > 0 && !authConfig.allowedEmails.includes(email)) {
    throw new EntraAuthError('This Entra ID account is not allowed to access Payload admin.')
  }

  if (authConfig.validateMFAClaim && !hasMfaClaim(claims)) {
    throw new EntraAuthError('This Entra ID sign-in did not include an MFA claim.')
  }

  return claims
}

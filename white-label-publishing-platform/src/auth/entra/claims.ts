import type { JWTPayload } from 'jose'

export type EntraIDTokenClaims = JWTPayload & {
  amr?: string[]
  email?: string
  name?: string
  oid?: string
  preferred_username?: string
  tid?: string
}

export const getEmailFromClaims = (claims: EntraIDTokenClaims): string | null => {
  const email = claims.email || claims.preferred_username
  return typeof email === 'string' && email.includes('@') ? email.toLowerCase() : null
}

export const hasMfaClaim = (claims: EntraIDTokenClaims): boolean =>
  Array.isArray(claims.amr) && claims.amr.includes('mfa')

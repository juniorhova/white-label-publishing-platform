import { randomBytes } from 'crypto'

export const entraAuthCookieNames = {
  codeVerifier: 'entra_code_verifier',
  nonce: 'entra_nonce',
  state: 'entra_state',
} as const

export type EntraAuthConfig = {
  allowedEmails: string[]
  clientId: string
  clientSecret: string
  enabled: boolean
  redirectUri: string
  tenantId: string
  validateMFAClaim: boolean
}

export const getConfiguredEmails = (value?: string): string[] =>
  (value || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)

export const getEntraAuthority = (tenantId: string): string =>
  `https://login.microsoftonline.com/${tenantId}/v2.0`

export const getEntraBaseURL = (tenantId: string): string =>
  `https://login.microsoftonline.com/${tenantId}`

export const getEntraAuthConfig = (): EntraAuthConfig => {
  const tenantId = process.env.ENTRA_TENANT_ID || ''
  const clientId = process.env.ENTRA_CLIENT_ID || ''
  const clientSecret = process.env.ENTRA_CLIENT_SECRET || ''
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const configuredRedirectUri = process.env.ENTRA_REDIRECT_URI || ''

  return {
    allowedEmails: getConfiguredEmails(process.env.ENTRA_ALLOWED_EMAILS),
    clientId,
    clientSecret,
    enabled: Boolean(tenantId && clientId && clientSecret),
    redirectUri: configuredRedirectUri || `${serverURL}/api/auth/entra/callback`,
    tenantId,
    validateMFAClaim: process.env.ENTRA_VALIDATE_MFA_CLAIM === 'true',
  }
}

export const getPasswordLoginAllowedEmails = (): string[] =>
  getConfiguredEmails(process.env.PAYLOAD_PASSWORD_LOGIN_ALLOWED_EMAILS)

export const isSecureCookie = (): boolean =>
  process.env.NODE_ENV === 'production' ||
  (process.env.NEXT_PUBLIC_SERVER_URL || '').startsWith('https://')

export const createOpaqueToken = (): string => randomBytes(32).toString('base64url')

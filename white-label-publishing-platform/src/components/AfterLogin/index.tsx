import React from 'react'

import { getEntraAuthConfig } from '@/auth/entra/config'

type AfterLoginProps = {
  searchParams?: {
    ssoError?: string | string[]
  }
}

const getSSOError = (searchParams?: AfterLoginProps['searchParams']): string | null => {
  const value = searchParams?.ssoError
  if (Array.isArray(value)) return value[0] || null
  return value || null
}

const AfterLogin: React.FC<AfterLoginProps> = ({ searchParams }) => {
  const entraConfig = getEntraAuthConfig()
  const ssoError = getSSOError(searchParams)

  if (!entraConfig.enabled) {
    return ssoError ? (
      <p style={{ color: 'var(--theme-error-500)', marginTop: '1rem' }}>{ssoError}</p>
    ) : null
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <form action="/api/auth/entra/login" method="get">
        <button
          style={{
            alignItems: 'center',
            border: '1px solid var(--theme-elevation-250)',
            cursor: 'pointer',
            display: 'inline-flex',
            font: 'inherit',
            justifyContent: 'center',
            minHeight: '44px',
            padding: '0 1rem',
            width: '100%',
          }}
          type="submit"
        >
          Log in with Microsoft Entra ID
        </button>
      </form>
      {ssoError ? (
        <p style={{ color: 'var(--theme-error-500)', marginTop: '0.75rem' }}>{ssoError}</p>
      ) : null}
    </div>
  )
}

export default AfterLogin

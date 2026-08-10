import { describe, expect, it, afterEach } from 'vitest'

import { hasMfaClaim } from '@/auth/entra/claims'
import { getConfiguredEmails, getEntraAuthConfig } from '@/auth/entra/config'
import { markLocalLoginType, markUserLoginType } from '@/auth/loginType'
import { restrictPasswordLoginToAllowedEmails } from '@/auth/passwordFallback'
import type { User } from '@/payload-types'

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('Entra auth configuration', () => {
  it('normalizes comma-separated email allow lists', () => {
    expect(getConfiguredEmails(' Owner@Example.com,admin@example.com ,, ')).toEqual([
      'owner@example.com',
      'admin@example.com',
    ])
  })

  it('is enabled only when required Entra settings are present', () => {
    process.env.ENTRA_TENANT_ID = 'tenant-id'
    process.env.ENTRA_CLIENT_ID = 'client-id'
    process.env.ENTRA_CLIENT_SECRET = 'client-secret'
    process.env.NEXT_PUBLIC_SERVER_URL = 'http://localhost:3000'

    expect(getEntraAuthConfig()).toMatchObject({
      enabled: true,
      redirectUri: 'http://localhost:3000/api/auth/entra/callback',
      validateMFAClaim: false,
    })
  })

  it('requires the Entra MFA claim only when explicitly configured', () => {
    process.env.ENTRA_TENANT_ID = 'tenant-id'
    process.env.ENTRA_CLIENT_ID = 'client-id'
    process.env.ENTRA_CLIENT_SECRET = 'client-secret'
    process.env.ENTRA_VALIDATE_MFA_CLAIM = 'true'

    expect(getEntraAuthConfig()).toMatchObject({
      validateMFAClaim: true,
    })
  })

  it('recognizes Entra MFA claims', () => {
    expect(hasMfaClaim({ amr: ['pwd', 'mfa'] })).toBe(true)
    expect(hasMfaClaim({ amr: ['pwd'] })).toBe(false)
  })
})

describe('Payload password fallback guard', () => {
  const createUser = (id: number, email: string): User => ({
    collection: 'users',
    createdAt: '2026-08-09T00:00:00.000Z',
    email,
    id,
    updatedAt: '2026-08-09T00:00:00.000Z',
  })

  it('allows password login when Entra is not configured', () => {
    process.env.ENTRA_TENANT_ID = ''
    process.env.ENTRA_CLIENT_ID = ''
    process.env.ENTRA_CLIENT_SECRET = ''
    process.env.PAYLOAD_PASSWORD_LOGIN_ALLOWED_EMAILS = 'owner@example.com'

    const user = createUser(1, 'editor@example.com')

    expect(
      restrictPasswordLoginToAllowedEmails({
        collection: {} as never,
        context: {},
        req: { t: (key: string) => key } as never,
        user,
      }),
    ).toEqual(user)
  })

  it('allows only configured break-glass emails when Entra is configured', () => {
    process.env.ENTRA_TENANT_ID = 'tenant-id'
    process.env.ENTRA_CLIENT_ID = 'client-id'
    process.env.ENTRA_CLIENT_SECRET = 'client-secret'
    process.env.PAYLOAD_PASSWORD_LOGIN_ALLOWED_EMAILS = 'owner@example.com'

    const owner = createUser(1, 'owner@example.com')
    const editor = createUser(2, 'editor@example.com')

    expect(
      restrictPasswordLoginToAllowedEmails({
        collection: {} as never,
        context: {},
        req: { t: (key: string) => key } as never,
        user: owner,
      }),
    ).toEqual(owner)

    expect(() =>
      restrictPasswordLoginToAllowedEmails({
        collection: {} as never,
        context: {},
        req: { t: (key: string) => key } as never,
        user: editor,
      }),
    ).toThrow()
  })
})

describe('Payload admin login type display', () => {
  const user: User = {
    collection: 'users',
    createdAt: '2026-08-09T00:00:00.000Z',
    email: 'owner@example.com',
    id: 1,
    updatedAt: '2026-08-09T00:00:00.000Z',
  }

  const createReq = () => {
    const calls: unknown[] = []
    const req = {
      payload: {
        db: {
          updateOne: async (args: unknown) => {
            calls.push(args)
          },
        },
      },
    }

    return { calls, req: req as never }
  }

  it('persists Payload email/password logins as local', async () => {
    const { calls, req } = createReq()

    await expect(
      markLocalLoginType({
        collection: {} as never,
        context: {},
        req,
        token: 'token',
        user,
      }),
    ).resolves.toMatchObject({
      loginType: 'Local',
    })

    expect(calls).toEqual([
      {
        collection: 'users',
        data: {
          loginType: 'Local',
        },
        id: user.id,
        req,
        returning: false,
      },
    ])
  })

  it('persists Entra logins', async () => {
    const { calls, req } = createReq()

    await expect(markUserLoginType({ loginType: 'Entra ID', req, user })).resolves.toMatchObject({
      loginType: 'Entra ID',
    })

    expect(calls).toEqual([
      {
        collection: 'users',
        data: {
          loginType: 'Entra ID',
        },
        id: user.id,
        req,
        returning: false,
      },
    ])
  })
})

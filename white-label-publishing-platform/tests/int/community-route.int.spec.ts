import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({ getPayload: vi.fn(), verify: vi.fn(), cookie: vi.fn() }))
vi.mock('payload', async (original) => ({
  ...(await original<typeof import('payload')>()),
  getPayload: mocks.getPayload,
}))
vi.mock('next/headers', () => ({ cookies: async () => ({ get: mocks.cookie }) }))
vi.mock('@/editorial/community', async (original) => ({
  ...(await original<typeof import('@/editorial/community')>()),
  verifyChallenge: mocks.verify,
}))
import { GET, POST } from '@/app/(frontend)/api/community/[postId]/route'
const originalEnv = { ...process.env }
let payload: {
  secret: string
  find: ReturnType<typeof vi.fn>
  count: ReturnType<typeof vi.fn>
  create: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
}
const params = { params: Promise.resolve({ postId: '1' }) }
const origin = 'https://juniorhova.com'
const request = (body: unknown, o = origin) =>
  new Request(`${origin}/api/community/1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', origin: o },
    body: JSON.stringify(body),
  })
beforeEach(() => {
  process.env.NEXT_PUBLIC_SERVER_URL = origin
  process.env.TURNSTILE_SECRET_KEY = 'test-secret'
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'test-public'
  mocks.verify.mockReset().mockResolvedValue(true)
  mocks.cookie.mockReturnValue({ value: '11111111-1111-1111-1111-111111111111' })
  payload = {
    secret: 'test-secret',
    find: vi.fn(async ({ collection }) => ({ docs: collection === 'posts' ? [{ id: 1 }] : [] })),
    count: vi.fn(async () => ({ totalDocs: 0 })),
    create: vi.fn(),
    update: vi.fn(),
  }
  mocks.getPayload.mockResolvedValue(payload)
})
afterEach(() => {
  process.env = { ...originalEnv }
})
describe('Public community route', () => {
  it('never exposes comments or counts of unpublished posts', async () => {
    payload.find.mockResolvedValue({ docs: [] })
    expect((await GET(new Request(origin), params)).status).toBe(404)
    expect(payload.count).not.toHaveBeenCalled()
  })
  it('blocks writes before database access for wrong origin or failed verification', async () => {
    expect(
      (await POST(request({ type: 'reaction', kind: 'like' }, 'https://attacker.test'), params))
        .status,
    ).toBe(403)
    mocks.verify.mockResolvedValue(false)
    expect((await POST(request({ type: 'reaction', kind: 'like' }), params)).status).toBe(403)
    expect(payload.create).not.toHaveBeenCalled()
  })
  it('ignores supplied approval state and creates a pending comment', async () => {
    expect(
      (
        await POST(
          request({
            type: 'comment',
            name: 'Leitor',
            text: '<script>texto</script>',
            status: 'approved',
            token: 't',
          }),
          params,
        )
      ).status,
    ).toBe(200)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'comments',
        data: expect.objectContaining({ status: 'pending', post: 1 }),
      }),
    )
  })
  it('enforces the comment limit', async () => {
    payload.count.mockResolvedValue({ totalDocs: 5 })
    expect(
      (await POST(request({ type: 'comment', name: 'Leitor', text: 'texto', token: 't' }), params))
        .status,
    ).toBe(429)
    expect(payload.create).not.toHaveBeenCalled()
  })
  it('updates a visitor reaction rather than adding another', async () => {
    payload.find.mockImplementation(async ({ collection }) => ({
      docs: collection === 'posts' ? [{ id: 1 }] : [{ id: 9 }],
    }))
    expect(
      (await POST(request({ type: 'reaction', kind: 'helpful', token: 't' }), params)).status,
    ).toBe(200)
    expect(payload.update).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'reactions', id: 9, data: { kind: 'helpful' } }),
    )
    expect(payload.create).not.toHaveBeenCalled()
  })
  it('returns only approved public comment fields', async () => {
    payload.find.mockImplementation(async ({ collection }) => ({
      docs:
        collection === 'posts'
          ? [{ id: 1 }]
          : [{ id: 5, name: 'A', text: 'B', visitorHash: 'private', createdAt: 'date' }],
    }))
    const data = await (await GET(new Request(origin), params)).json()
    expect(data.comments[0]).not.toHaveProperty('visitorHash')
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'comments',
        where: { and: [{ post: { equals: 1 } }, { status: { equals: 'approved' } }] },
      }),
    )
  })
})

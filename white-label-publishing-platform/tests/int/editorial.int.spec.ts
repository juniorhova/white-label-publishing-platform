import { afterEach, describe, expect, it, vi } from 'vitest'
import { validateImport, isSafeArticleURL } from '@/editorial/import'
import { validateSubmission, verifyChallenge, visitorHash } from '@/editorial/community'
import { importEndpoint } from '@/editorial/importEndpoint'
import { Comments, Reactions } from '@/collections/Comments'
import { Download } from '@/blocks/Download/config'
const base = { title: 'Um artigo', slug: 'um-artigo', markdown: '## Introdução\n\nTexto.' }
const saved = { ...process.env }
afterEach(() => {
  vi.unstubAllGlobals()
  process.env = { ...saved }
})
describe('Editorial import boundaries', () => {
  it('rejects executable and protocol-relative links', () => {
    for (const url of [
      'javascript:alert(1)',
      'data:text/html,x',
      '//attacker.test',
      '/\\attacker.test',
    ])
      expect(isSafeArticleURL(url)).toBe(false)
    for (const url of ['/posts/artigo', '#secao', 'https://example.test/material'])
      expect(isSafeArticleURL(url)).toBe(true)
  })
  it('defaults to a dry run and draft', () => {
    expect(validateImport(base).apply).toBeUndefined()
    expect(validateImport(base).publish).toBeUndefined()
  })
  it.each(['../admin', 'Bad Slug', 'https://example.test', ''])(
    'rejects unsafe slug %s',
    (slug) => {
      expect(() => validateImport({ ...base, slug })).toThrow()
    },
  )
  it('rejects malformed blocks and media IDs', () => {
    expect(() =>
      validateImport({ ...base, blocks: { unsafe: { type: 'html', title: 'x' } } }),
    ).toThrow()
    expect(() =>
      validateImport({ ...base, blocks: { pdf: { type: 'pdf', title: 'x', mediaId: -1 } } }),
    ).toThrow()
  })
  it('rejects non-YouTube video URLs', () => {
    expect(() => validateImport({ ...base, videoURL: 'javascript:alert(1)' })).toThrow()
  })
  it('rejects unauthenticated endpoint calls before reading body', async () => {
    const text = vi.fn()
    const r = await importEndpoint.handler({ user: null, text } as never)
    expect(r.status).toBe(401)
    expect(text).not.toHaveBeenCalled()
  })
  it('requires the existing timestamp before overwriting', async () => {
    const update = vi.fn()
    const r = await importEndpoint.handler({
      user: { collection: 'users' },
      headers: new Headers({ authorization: 'JWT test' }),
      text: async () => JSON.stringify({ ...base, apply: true }),
      payload: {
        find: async () => ({ docs: [{ id: 8, updatedAt: '2026-11-22T12:00:00.000Z' }] }),
        update,
      },
    } as never)
    expect(r.status).toBe(409)
    expect(update).not.toHaveBeenCalled()
  })
  it('rejects cross-origin requests even with an authenticated user', async () => {
    const r = await importEndpoint.handler({
      user: { collection: 'users' },
      headers: new Headers({ origin: 'https://attacker.test' }),
    } as never)
    expect(r.status).toBe(403)
  })
  it('PDF selection validates actual MIME type on the server', async () => {
    const field = Download.fields.find((f) => 'name' in f && f.name === 'file') as {
      validate: (value: unknown, options: { req: unknown }) => Promise<boolean | string>
    }
    const req = { payload: { findByID: async () => ({ mimeType: 'image/png' }) } }
    expect(await field.validate(1, { req })).not.toBe(true)
    req.payload.findByID = async () => ({ mimeType: 'application/pdf' })
    expect(await field.validate(1, { req })).toBe(true)
  })
})
describe('Community safety', () => {
  it('does not allow anonymous direct collection writes or reads', () => {
    for (const c of [Comments, Reactions])
      for (const op of ['read', 'create', 'update', 'delete'] as const)
        expect(c.access![op]!({ req: { user: null } } as never)).toBe(false)
  })
  it('new comments await approval', () => {
    expect(Comments.fields.find((f) => 'name' in f && f.name === 'status')).toMatchObject({
      defaultValue: 'pending',
    })
  })
  it('rejects malformed comments and unknown reactions', () => {
    expect(() => validateSubmission({ type: 'comment', name: '', text: 'x' })).toThrow()
    expect(() =>
      validateSubmission({ type: 'comment', name: 'A', text: 'x'.repeat(3001) }),
    ).toThrow()
    expect(() => validateSubmission({ type: 'reaction', kind: 'admin' })).toThrow()
  })
  it('hashes visitor identifiers instead of exposing raw values', () => {
    expect(visitorHash('visitor', 'secret')).toHaveLength(64)
    expect(visitorHash('visitor', 'other')).not.toBe(visitorHash('visitor', 'secret'))
  })
  it('fails closed without challenge configuration', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    expect(await verifyChallenge('token', 'juniorhova.com')).toBe(false)
  })
  it('checks hostname and action, not just challenge success', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'test'
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ success: true, hostname: 'wrong.test', action: 'post-interaction' }),
      })),
    )
    expect(await verifyChallenge('token', 'juniorhova.com')).toBe(false)
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          success: true,
          hostname: 'juniorhova.com',
          action: 'post-interaction',
        }),
      })),
    )
    expect(await verifyChallenge('token', 'juniorhova.com')).toBe(true)
  })
})

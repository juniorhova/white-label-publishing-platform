import { describe, expect, it, vi } from 'vitest'
import type { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'
import { up, down } from '@/migrations/20261116_020000_publish_approved_home'

function fixture(current?: unknown, customNavigation = false) {
  const req = { transactionID: 'migration-transaction' }
  const payload = {
    find: vi.fn().mockResolvedValue({ docs: current ? [current] : [] }),
    create: vi.fn().mockResolvedValue({ id: 2 }),
    update: vi.fn().mockResolvedValue({ id: 1 }),
    findGlobal: vi.fn().mockImplementation(async ({ slug }) => ({
      navItems: customNavigation
        ? [{ link: { label: 'Contato', url: '/contato' } }]
        : slug === 'header'
          ? [{ link: { label: 'Home' } }]
          : [],
    })),
    updateGlobal: vi.fn(),
    logger: { info: vi.fn() },
  }
  return { payload, req, args: { payload, req } as unknown as MigrateUpArgs }
}

describe('Approved home content migration', () => {
  it('recreates a missing home and default menus in the migration transaction', async () => {
    const { payload, req, args } = fixture()
    await up(args)
    const call = payload.create.mock.calls[0][0]
    expect(call.collection).toBe('pages')
    expect(call.data.slug).toBe('home')
    expect(call.data._status).toBe('published')
    expect(call.data.hero.type).toBe('portfolio')
    expect(call.data.hero.media).toBeNull()
    expect(call.req).toBe(req)
    expect(payload.updateGlobal).toHaveBeenCalledTimes(2)
    for (const [call] of payload.updateGlobal.mock.calls) expect(call.req).toBe(req)
  })
  it('preserves the legacy content in Versions before replacing it', async () => {
    const old = {
      id: 1,
      title: 'Home',
      _status: 'published',
      hero: {
        type: 'lowImpact',
        richText: { text: 'Building reliable platforms, automating infrastructure' },
      },
    }
    const { payload, args } = fixture(old)
    await up(args)
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.update.mock.calls[0][0].data).toEqual({ title: 'Home' })
    expect(payload.update.mock.calls[1][0].data.hero.type).toBe('portfolio')
  })
  it.each([
    { id: 1, hero: { type: 'portfolio' } },
    { id: 1, _status: 'draft', hero: { type: 'lowImpact' } },
    { id: 1, _status: 'published', hero: { type: 'lowImpact' } },
  ])('preserves an existing personal, draft or customized home', async (current) => {
    const { payload, args } = fixture(current)
    await up(args)
    expect(payload.create).not.toHaveBeenCalled()
    expect(payload.update).not.toHaveBeenCalled()
    expect(payload.updateGlobal).not.toHaveBeenCalled()
  })
  it('preserves custom navigation and never creates users, media or posts', async () => {
    const { payload, args } = fixture(undefined, true)
    await up(args)
    expect(payload.updateGlobal).not.toHaveBeenCalled()
    expect(payload.create.mock.calls.map(([call]) => call.collection)).toEqual(['pages'])
  })
  it('refuses automatic rollback over subsequent editorial changes', async () => {
    await expect(down({} as MigrateDownArgs)).rejects.toThrow('Payload Versions')
  })
})

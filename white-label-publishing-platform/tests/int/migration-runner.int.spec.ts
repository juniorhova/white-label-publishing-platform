import { describe, expect, it, vi } from 'vitest'
import {
  expectedMigrations,
  pendingMigrations,
  withDatabaseLock,
  LOCK_KEY,
} from '../../scripts/deploy/migrations.mjs'
describe('Release migration gate', () => {
  it('matches the complete native registry', async () => {
    const names = await expectedMigrations()
    expect(names).toContain('20261122_201125_editorial_publishing')
    expect(new Set(names).size).toBe(names.length)
  })
  it('permits old application rollback with additional applied migrations', () => {
    expect(
      pendingMigrations(
        ['old'],
        [
          { name: 'old', batch: 1 },
          { name: 'new', batch: 2 },
        ],
      ),
    ).toEqual([])
  })
  it('detects pending migrations and refuses development push markers', () => {
    expect(pendingMigrations(['old', 'new'], [{ name: 'old', batch: 1 }])).toEqual(['new'])
    expect(() => pendingMigrations(['old'], [{ name: 'old', batch: '-1' }])).toThrow(
      'manual schema reconciliation',
    )
  })
  it('does not execute without the lock and closes the connection on timeout', async () => {
    const client = {
      connect: vi.fn(),
      end: vi.fn(),
      query: vi.fn(async () => ({ rows: [{ acquired: false }] })),
    }
    const task = vi.fn()
    await expect(withDatabaseLock(client, task, 0)).rejects.toThrow('concurrent migration')
    expect(task).not.toHaveBeenCalled()
    expect(client.end).toHaveBeenCalled()
  })
  it('holds the lock until completion and releases it even on failure', async () => {
    const order: string[] = []
    const client = {
      connect: vi.fn(),
      end: vi.fn(async () => {
        order.push('end')
      }),
      query: vi.fn(async (sql: string) => {
        order.push(sql)
        return { rows: [{ acquired: true }] }
      }),
    }
    await expect(
      withDatabaseLock(
        client,
        async () => {
          order.push('operation')
          throw new Error('failure')
        },
        0,
      ),
    ).rejects.toThrow('failure')
    expect(client.query).toHaveBeenCalledWith('SELECT pg_try_advisory_lock($1) AS acquired', [
      LOCK_KEY,
    ])
    expect(order).toEqual([
      'SELECT pg_try_advisory_lock($1) AS acquired',
      'operation',
      'SELECT pg_advisory_unlock($1)',
      'end',
    ])
  })
})

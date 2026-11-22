import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

// Every runner for this application must use the same session-level advisory key.
export const LOCK_KEY = 19690122
export async function expectedMigrations(directory = 'src/migrations') {
  const index = await readFile(path.join(directory, 'index.ts'), 'utf8')
  const names = [...index.matchAll(/name:\s*['"]([^'"]+)['"]/g)].map((m) => m[1])
  const files = (await readdir(directory))
    .filter((f) => /^\d.*\.ts$/.test(f))
    .map((f) => f.slice(0, -3))
  if (
    !names.length ||
    new Set(names).size !== names.length ||
    names.some((n) => !files.includes(n)) ||
    files.some((n) => !names.includes(n))
  )
    throw new Error('Invalid migration registry; refusing to continue.')
  return names
}
export function pendingMigrations(expected, applied) {
  if (applied.some((row) => Number(row.batch) === -1))
    throw new Error(
      'Development schema push marker found; manual schema reconciliation required. No automatic confirmation is permitted.',
    )
  return expected.filter((name) => !applied.some((row) => row.name === name))
}
export async function readLedger(client) {
  const exists = await client.query("SELECT to_regclass('public.payload_migrations') AS name")
  if (!exists.rows[0].name) return []
  return (await client.query('SELECT name, batch FROM public.payload_migrations')).rows
}
export async function acquireLock(client, timeout = 60000) {
  const deadline = Date.now() + timeout
  do {
    const { rows } = await client.query('SELECT pg_try_advisory_lock($1) AS acquired', [LOCK_KEY])
    if (rows[0].acquired) return
    if (Date.now() >= deadline)
      throw new Error('Timed out waiting for the migration lock; refusing concurrent migration.')
    await new Promise((resolve) => setTimeout(resolve, 250))
  } while (true)
}
export async function withDatabaseLock(client, operation, timeout) {
  await client.connect()
  let locked = false
  try {
    await acquireLock(client, timeout)
    locked = true
    return await operation()
  } finally {
    try {
      if (locked) await client.query('SELECT pg_advisory_unlock($1)', [LOCK_KEY])
    } finally {
      await client.end()
    }
  }
}
export async function runPayloadMigration(client) {
  const child = spawn(process.execPath, [path.resolve('node_modules/payload/bin.js'), 'migrate'], {
    stdio: 'inherit',
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --no-deprecation`,
    },
  })
  let cancelled = false
  let killTimer
  const terminate = () => {
    cancelled = true
    try {
      if (process.platform !== 'win32') process.kill(-child.pid, 'SIGTERM')
      else child.kill('SIGTERM')
    } catch {
      /* already exited */
    }
    killTimer = setTimeout(() => {
      try {
        if (process.platform !== 'win32') process.kill(-child.pid, 'SIGKILL')
        else child.kill('SIGKILL')
      } catch {
        /* already exited */
      }
    }, 10000)
  }
  const lostConnection = () => terminate()
  client.on('error', lostConnection)
  client.on('end', lostConnection)
  process.once('SIGTERM', terminate)
  process.once('SIGINT', terminate)
  try {
    const code = await new Promise((resolve, reject) => {
      child.once('error', reject)
      child.once('exit', (code, signal) => resolve(signal ? 1 : code))
    })
    if (code !== 0 || cancelled)
      throw new Error('Migration process failed or was interrupted; application must not start.')
  } finally {
    clearTimeout(killTimer)
    client.off('error', lostConnection)
    client.off('end', lostConnection)
    process.off('SIGTERM', terminate)
    process.off('SIGINT', terminate)
  }
}
export async function main(mode = process.argv[2]) {
  if (!['migrate', 'check'].includes(mode)) throw new Error('Use migrations.mjs migrate|check')
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.')
  const timeout = Number(process.env.MIGRATION_LOCK_TIMEOUT_MS || 60000)
  if (!Number.isInteger(timeout) || timeout < 0 || timeout > 600000)
    throw new Error('Invalid migration lock timeout.')
  const expected = await expectedMigrations()
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    application_name: `portfolio-${mode}`,
  })
  // Keep database errors from surfacing connection details in uncaught event output.
  client.on('error', () => {})
  try {
    await withDatabaseLock(
      client,
      async () => {
        const pending = pendingMigrations(expected, await readLedger(client))
        if (mode === 'migrate' && pending.length) {
          console.log(
            `Applying ${pending.length} pending migrations under an exclusive database lock.`,
          )
          await runPayloadMigration(client)
        }
        const remaining = pendingMigrations(expected, await readLedger(client))
        if (remaining.length)
          throw new Error(
            `Migrations are pending: ${remaining.join(', ')}. Run the release migration job before starting this image.`,
          )
        console.log(
          mode === 'migrate'
            ? 'Release migrations complete.'
            : 'Migration ledger matches this application image.',
        )
      },
      timeout,
    )
  } catch (error) {
    // PG errors may contain connection metadata. Only our own fixed messages are public.
    if (error?.code) throw new Error('Database operation failed; inspect protected database logs.')
    throw error
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}

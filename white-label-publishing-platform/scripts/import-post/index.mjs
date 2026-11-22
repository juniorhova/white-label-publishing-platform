import { readFile, realpath } from 'node:fs/promises'
import path from 'node:path'
const [filename, ...flags] = process.argv.slice(2)
if (!filename || flags.some((f) => !['--apply', '--publish'].includes(f)))
  throw new Error('Uso: pnpm import:post artigo.json [--apply] [--publish]')
if (flags.includes('--publish') && !flags.includes('--apply'))
  throw new Error('--publish exige --apply explícito.')
const origin = new URL(process.env.IMPORT_SITE_URL || '')
if (
  origin.protocol !== 'https:' &&
  !(origin.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(origin.hostname))
)
  throw new Error('Use HTTPS ou localhost.')
if (origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash)
  throw new Error('IMPORT_SITE_URL deve conter somente a origem.')
const token = process.env.IMPORT_PAYLOAD_TOKEN
if (!token)
  throw new Error(
    'Defina IMPORT_PAYLOAD_TOKEN com um JWT de sessão Payload; não grave credenciais no arquivo.',
  )
const manifest = JSON.parse(await readFile(filename, 'utf8'))
const { markdownFile, ...article } = manifest
if (typeof markdownFile !== 'string') throw new Error('Informe markdownFile no manifesto.')
const directory = await realpath(path.dirname(path.resolve(filename)))
const markdownPath = await realpath(path.resolve(directory, markdownFile))
if (
  !markdownPath.startsWith(directory + path.sep) ||
  path.extname(markdownPath).toLowerCase() !== '.md'
)
  throw new Error('O Markdown deve ser um .md dentro da pasta do manifesto.')
article.markdown = await readFile(markdownPath, 'utf8')
article.apply = flags.includes('--apply')
article.publish = flags.includes('--publish')
const r = await fetch(new URL('/api/editorial/import', origin), {
  method: 'POST',
  redirect: 'error',
  headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
  body: JSON.stringify(article),
})
console.log(JSON.stringify(await r.json(), null, 2))
if (!r.ok) process.exitCode = 1

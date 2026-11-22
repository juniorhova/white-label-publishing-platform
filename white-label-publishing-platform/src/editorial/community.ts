import { createHmac } from 'node:crypto'

export function visitorHash(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('hex')
}
export function validateSubmission(body: Record<string, unknown>) {
  if (!['comment', 'reaction'].includes(String(body.type))) throw new Error('Tipo inválido.')
  if (
    body.type === 'comment' &&
    (typeof body.name !== 'string' ||
      !body.name.trim() ||
      body.name.length > 80 ||
      typeof body.text !== 'string' ||
      !body.text.trim() ||
      body.text.length > 3000)
  )
    throw new Error('Preencha nome e comentário dentro dos limites.')
  if (body.type === 'reaction' && !['like', 'helpful', 'insightful'].includes(String(body.kind)))
    throw new Error('Reação inválida.')
}
export async function verifyChallenge(token: unknown, hostname: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || typeof token !== 'string' || !token || token.length > 2048) return false
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token }),
    signal: AbortSignal.timeout(10000),
  })
  const result = await response.json()
  return (
    response.ok &&
    result.success === true &&
    result.hostname === hostname &&
    result.action === 'post-interaction'
  )
}

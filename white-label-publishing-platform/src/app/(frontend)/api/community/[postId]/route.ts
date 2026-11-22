import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'
import { validateSubmission, verifyChallenge, visitorHash } from '@/editorial/community'
export const dynamic = 'force-dynamic'
async function published(postId: string) {
  if (!/^\d+$/.test(postId)) return null
  const payload = await getPayload({ config })
  const posts = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    draft: false,
    where: { and: [{ id: { equals: Number(postId) } }, { _status: { equals: 'published' } }] },
    depth: 0,
    limit: 1,
  })
  return posts.docs.length ? payload : null
}
export async function GET(_req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params
  const payload = await published(postId)
  if (!payload) return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 })
  const comments = await payload.find({
    collection: 'comments',
    overrideAccess: true,
    where: { and: [{ post: { equals: Number(postId) } }, { status: { equals: 'approved' } }] },
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  })
  const counts = await Promise.all(
    ['like', 'helpful', 'insightful'].map(async (kind) => [
      kind,
      (
        await payload.count({
          collection: 'reactions',
          overrideAccess: true,
          where: { and: [{ post: { equals: Number(postId) } }, { kind: { equals: kind } }] },
        })
      ).totalDocs,
    ]),
  )
  return NextResponse.json(
    {
      comments: comments.docs.map((c) => ({
        id: c.id,
        name: c.name,
        text: c.text,
        createdAt: c.createdAt,
      })),
      counts: Object.fromEntries(counts),
      enabled: Boolean(
        process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      ),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
export async function POST(req: Request, { params }: { params: Promise<{ postId: string }> }) {
  const origin = new URL(getServerSideURL()).origin
  if (req.headers.get('origin') !== origin)
    return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 })
  if (Number(req.headers.get('content-length') || 0) > 16000)
    return NextResponse.json({ error: 'Envio muito grande.' }, { status: 413 })
  let body: Record<string, unknown>
  try {
    const raw = await req.text()
    if (raw.length > 16000) throw new Error('Envio muito grande.')
    body = JSON.parse(raw)
    validateSubmission(body)
  } catch {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
  }
  if (!process.env.TURNSTILE_SECRET_KEY || !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
    return NextResponse.json({ error: 'Interações indisponíveis no momento.' }, { status: 503 })
  try {
    if (!(await verifyChallenge(body.token, new URL(origin).hostname)))
      return NextResponse.json({ error: 'Verificação expirada. Tente novamente.' }, { status: 403 })
    const { postId } = await params
    const payload = await published(postId)
    if (!payload) return NextResponse.json({ error: 'Artigo não encontrado.' }, { status: 404 })
    const jar = await cookies()
    const previous = jar.get('jh-reader')?.value
    const visitor = previous && /^[a-f0-9-]{36}$/.test(previous) ? previous : randomUUID()
    const hash = visitorHash(visitor, payload.secret)
    if (body.type === 'comment') {
      const recent = await payload.count({
        collection: 'comments',
        overrideAccess: true,
        where: {
          and: [
            { visitorHash: { equals: hash } },
            { createdAt: { greater_than: new Date(Date.now() - 3600000).toISOString() } },
          ],
        },
      })
      if (recent.totalDocs >= 5)
        return NextResponse.json(
          { error: 'Limite de comentários atingido. Tente mais tarde.' },
          { status: 429 },
        )
      await payload.create({
        collection: 'comments',
        overrideAccess: true,
        data: {
          post: Number(postId),
          name: (body.name as string).trim(),
          text: (body.text as string).trim(),
          status: 'pending',
          visitorHash: hash,
        },
      })
    } else {
      const key = visitorHash(`${postId}:${visitor}`, payload.secret)
      const existing = await payload.find({
        collection: 'reactions',
        overrideAccess: true,
        where: { key: { equals: key } },
        limit: 1,
        depth: 0,
      })
      if (existing.docs[0])
        await payload.update({
          collection: 'reactions',
          id: existing.docs[0].id,
          overrideAccess: true,
          data: { kind: body.kind as 'like' | 'helpful' | 'insightful' },
        })
      else
        await payload.create({
          collection: 'reactions',
          overrideAccess: true,
          data: {
            post: Number(postId),
            key,
            kind: body.kind as 'like' | 'helpful' | 'insightful',
            visitorHash: hash,
          },
        })
    }
    const response = NextResponse.json({
      message:
        body.type === 'comment'
          ? 'Comentário enviado para aprovação. Obrigado!'
          : 'Reação registrada. Obrigado!',
    })
    response.cookies.set('jh-reader', visitor, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 31536000,
    })
    return response
  } catch {
    return NextResponse.json(
      { error: 'Não foi possível enviar agora. Tente novamente.' },
      { status: 503 },
    )
  }
}

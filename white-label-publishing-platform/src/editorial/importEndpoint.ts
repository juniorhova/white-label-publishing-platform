import type { Endpoint } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { articleData, validateImport } from './import'
export const importEndpoint: Endpoint = {
  path: '/editorial/import',
  method: 'post',
  handler: async (req) => {
    if (!req.user || req.user.collection !== 'users')
      return Response.json({ error: 'Faça login como administrador.' }, { status: 401 })
    const origin = req.headers.get('origin')
    if (
      origin
        ? origin !== new URL(getServerSideURL()).origin
        : !req.headers.get('authorization')?.startsWith('JWT ')
    )
      return Response.json({ error: 'Origem inválida.' }, { status: 403 })
    try {
      const raw = await req.text!()
      if (raw.length > 300000)
        return Response.json({ error: 'Artigo muito grande.' }, { status: 413 })
      const article = validateImport(JSON.parse(raw))
      const existing = await req.payload.find({
        collection: 'posts',
        overrideAccess: false,
        req,
        draft: true,
        where: { slug: { equals: article.slug } },
        limit: 1,
        depth: 0,
      })
      const previous = existing.docs[0]
      if (
        previous &&
        (!article.expectedUpdatedAt || article.expectedUpdatedAt !== previous.updatedAt)
      )
        return Response.json(
          {
            error:
              'Já existe um artigo com esse slug. Revise no admin e informe expectedUpdatedAt exato para atualizar.',
            id: previous.id,
            updatedAt: previous.updatedAt,
          },
          { status: 409 },
        )
      const data = await articleData(article, req)
      if (!article.apply)
        return Response.json({
          dryRun: true,
          action: previous ? 'update' : 'create',
          slug: article.slug,
          status: data._status,
          blocks: data.content.root.children.length,
        })
      const context = { ...req.context, disableRevalidate: false }
      const doc = previous
        ? await req.payload.update({
            collection: 'posts',
            id: previous.id,
            data,
            draft: !article.publish,
            overrideAccess: false,
            req,
            context,
          })
        : await req.payload.create({
            collection: 'posts',
            data,
            draft: !article.publish,
            overrideAccess: false,
            req,
            context,
          })
      return Response.json({
        id: doc.id,
        slug: doc.slug,
        updatedAt: doc.updatedAt,
        status: doc._status,
      })
    } catch (e) {
      return Response.json(
        { error: e instanceof Error ? e.message : 'Falha na importação.' },
        { status: 400 },
      )
    }
  },
}

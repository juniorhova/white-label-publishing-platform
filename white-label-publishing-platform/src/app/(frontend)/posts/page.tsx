import type { Metadata } from 'next'
import { getPayload, type Where } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { PostCards } from '@/components/Editorial/PostCards'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Artigos — Junior Hova',
  description: 'Aprendizados sobre Cloud, DevOps, engenharia de software e carreira.',
}
export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>
}) {
  const params = await searchParams
  const category = /^\d+$/.test(params.category || '') ? params.category! : ''
  const q = (params.q || '').slice(0, 120).trim()
  const page = Math.max(1, Math.min(10000, Number(params.page) || 1))
  const payload = await getPayload({ config })
  const conditions: Where[] = [{ _status: { equals: 'published' } }]
  if (category) conditions.push({ categories: { contains: Number(category) } })
  if (q) conditions.push({ or: [{ title: { like: q } }, { 'meta.description': { like: q } }] })
  const [posts, categories] = await Promise.all([
    payload.find({
      collection: 'posts',
      overrideAccess: false,
      draft: false,
      where: { and: conditions },
      sort: '-publishedAt',
      limit: 12,
      page: Math.floor(page),
      depth: 1,
    }),
    payload.find({ collection: 'categories', overrideAccess: false, limit: 100, sort: 'title' }),
  ])
  const url = (c: string, p = 1) =>
    `/posts?${new URLSearchParams({ ...(c ? { category: c } : {}), ...(q ? { q } : {}), page: String(p) })}`
  return (
    <main className="editorial-shell editorial-index">
      <div className="editorial-index-heading">
        <h1 className="editorial-title">Artigos</h1>
        <p>Cloud, DevOps e carreira internacional.</p>
      </div>
      <details className="editorial-search" open={Boolean(q)}>
        <summary>
          <SearchIcon size={16} aria-hidden="true" /> Buscar artigos
        </summary>
        <form action="/posts">
          <label htmlFor="article-search">Buscar artigos por título ou descrição</label>
          <input
            className="editorial-input"
            id="article-search"
            name="q"
            defaultValue={q}
            maxLength={120}
            type="search"
          />
          {category && <input type="hidden" name="category" value={category} />}
          <button className="editorial-action" type="submit">
            Buscar
          </button>
        </form>
      </details>
      <nav className="editorial-filters" aria-label="Categorias" tabIndex={0}>
        <Link href={url('')} aria-current={!category ? 'page' : undefined}>
          Todos
        </Link>
        {categories.docs.map((c) => (
          <Link
            key={c.id}
            href={url(String(c.id))}
            aria-current={category === String(c.id) ? 'page' : undefined}
          >
            {c.title}
          </Link>
        ))}
      </nav>
      {(category || q || !posts.totalDocs) && (
        <p className="mb-6 editorial-muted" role="status">
          {posts.totalDocs} {posts.totalDocs === 1 ? 'artigo encontrado' : 'artigos encontrados'}
        </p>
      )}
      <PostCards posts={posts.docs} />
      <nav className="editorial-filters" aria-label="Paginação">
        {posts.hasPrevPage && <Link href={url(category, posts.prevPage!)}>← Anterior</Link>}
        {posts.hasNextPage && <Link href={url(category, posts.nextPage!)}>Próxima →</Link>}
      </nav>
    </main>
  )
}

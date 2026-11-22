import React from 'react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PostCards } from './PostCards'
export async function RecentPosts() {
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    draft: false,
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 3,
    depth: 1,
  })
  return (
    <section className="editorial-shell" id="artigos" aria-labelledby="recent-posts-heading">
      <span id="videos" aria-hidden="true" />
      <h2 className="text-2xl font-bold mb-6" id="recent-posts-heading">
        Artigos recentes
      </h2>
      {result.docs.length > 0 && <PostCards posts={result.docs} />}
      <p className="mt-6">
        <Link href="/posts">Ver todos os artigos →</Link>
      </p>
    </section>
  )
}

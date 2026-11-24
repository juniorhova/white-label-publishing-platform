import { InterviewArticleBody } from '@/components/Editorial/InterviewArticleBody'
import { ReaderTools } from '@/components/Editorial/ReaderTools'
import { Community } from '@/components/Editorial/Community'
import { PostCards } from '@/components/Editorial/PostCards'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import { Media } from '@/components/Media'
import Link from 'next/link'
import '@/components/Editorial/editorial.css'
import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { getYouTubeVideoID } from '@/utilities/youtube'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

export async function generateStaticParams() {
  return []
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const payload = await getPayload({ config: configPromise })
  const chosen = (post.relatedPosts || []).map((p) => (typeof p === 'object' ? p.id : p))
  const related = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    draft: false,
    where: {
      and: [
        { id: { not_equals: post.id } },
        { _status: { equals: 'published' } },
        ...(chosen.length
          ? [{ id: { in: chosen } }]
          : post.categories?.length
            ? [
                {
                  categories: {
                    in: post.categories.map((c) => (typeof c === 'object' ? c.id : c)),
                  },
                },
              ]
            : []),
      ],
    },
    sort: '-publishedAt',
    limit: 3,
    depth: 1,
  })
  return (
    <article className="editorial-shell">
      <PageClient />
      <PayloadRedirects disableNotFound url={url} />
      {draft && <LivePreviewListener />}
      <Link href="/posts">← Todos os artigos</Link>
      <h1 className="editorial-title">{post.title}</h1>
      <p className="text-lg mb-4">{post.meta?.description}</p>
      {post.publishedAt && (
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
        </time>
      )}
      {post.videoURL ? (
        <YouTubeEmbed url={post.videoURL} showArticleLink={false} />
      ) : post.heroImage && typeof post.heroImage === 'object' ? (
        <Media className="my-8" resource={post.heroImage} />
      ) : null}
      <div className="editorial-reading mt-10">
        <div>
          <div id="article-body">
            {post.videoURL && getYouTubeVideoID(post.videoURL) === 'coPH1HBW85A' ? (
              <InterviewArticleBody content={post.content} />
            ) : (
              <RichText data={post.content} enableGutter={false} />
            )}
          </div>
          {!draft && <Community postId={post.id} />}
        </div>
        <ReaderTools key={post.id} />
      </div>
      {related.docs.length > 0 && (
        <section className="editorial-related">
          <h2 className="text-2xl font-bold mb-6">Continue lendo</h2>
          <PostCards posts={related.docs} />
        </section>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post, collection: 'posts' })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})

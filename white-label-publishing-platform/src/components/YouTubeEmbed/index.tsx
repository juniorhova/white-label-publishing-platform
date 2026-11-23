import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import React from 'react'
import { getYouTubeMetadata } from '@/utilities/getYouTubeMetadata'
import { YouTubePlayer } from './Component.client'

export async function YouTubeEmbed({
  url,
  description,
  showArticleLink = true,
}: {
  url: string
  showArticleLink?: boolean
  description?: string | null
}) {
  const video = await getYouTubeMetadata(url)
  if (!video) return null
  if (!showArticleLink) {
    return (
      <div className="my-6 max-w-2xl">
        <YouTubePlayer key={video.id} {...video} showTitle={false} />
      </div>
    )
  }

  const payload = await getPayload({ config })
  const related = await payload.find({
    collection: 'posts',
    overrideAccess: false,
    draft: false,
    where: { and: [{ videoURL: { equals: url } }, { _status: { equals: 'published' } }] },
    limit: 1,
    depth: 0,
  })
  const post = related.docs[0]
  return (
    <div className="personal-video-grid">
      <YouTubePlayer key={video.id} {...video} showFallback={false} />
      <div className="personal-video-copy">
        <p className="personal-eyebrow">VÍDEO DO CANAL</p>
        <h3>{post ? <Link href={`/posts/${post.slug}`}>{post.title}</Link> : video.title}</h3>
        {post && <Link href={`/posts/${post.slug}`}>Ler artigo e acessar materiais →</Link>}
        {description && <p className="personal-video-description">{description}</p>}
        <a
          className="home-video-fallback"
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Assistir no YouTube ↗
        </a>
      </div>
    </div>
  )
}

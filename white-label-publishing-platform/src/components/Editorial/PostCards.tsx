import Image from 'next/image'
import { getYouTubeVideoID } from '@/utilities/youtube'
import React from 'react'
import Link from 'next/link'
import type { Post } from '@/payload-types'
import { Media } from '@/components/Media'
import './editorial.css'
export function PostCards({ posts }: { posts: Post[] }) {
  return (
    <div className="editorial-grid">
      {posts.map((post) => {
        const image = post.meta?.image || post.heroImage
        const videoID = getYouTubeVideoID(post.videoURL || '')
        return (
          <Link className="editorial-card" href={`/posts/${post.slug}`} key={post.id}>
            {image && typeof image === 'object' ? (
              <Media resource={image} imgClassName="w-full" />
            ) : videoID ? (
              <Image
                unoptimized
                width={640}
                height={360}
                src={`https://i.ytimg.com/vi/${videoID}/hqdefault.jpg`}
                alt=""
              />
            ) : null}
            <small>
              {post.categories
                ?.filter((c) => typeof c === 'object')
                .map((c) => (typeof c === 'object' ? c.title : ''))
                .join(' · ')}
            </small>
            <h3>{post.title}</h3>
            <p>{post.meta?.description}</p>
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </time>
            )}
          </Link>
        )
      })}
    </div>
  )
}

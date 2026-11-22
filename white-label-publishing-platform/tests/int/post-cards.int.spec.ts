import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { PostCards } from '@/components/Editorial/PostCards'
import type { Post } from '@/payload-types'

const image = {
  id: 12,
  url: '/api/media/file/capa.png',
  createdAt: '2026-11-22T00:00:00Z',
  updatedAt: '2026-11-22T00:00:00Z',
}

const post: Post = {
  id: 1,
  title: 'Um artigo de DevOps',
  slug: 'artigo-de-devops',
  content: {
    root: { type: 'root', children: [], direction: null, format: '', indent: 0, version: 1 },
  },
  createdAt: '2026-11-22T00:00:00Z',
  updatedAt: '2026-11-22T00:00:00Z',
  meta: { image },
  heroImage: image,
}

describe('cards de artigos', () => {
  it('mostra a thumbnail do YouTube e leva ao artigo quando há um vídeo', () => {
    const html = renderToStaticMarkup(
      createElement(PostCards, { posts: [{ ...post, videoURL: 'https://youtu.be/Pmywg8y43j0' }] }),
    )

    expect(html).toContain('href="/posts/artigo-de-devops"')
    expect(html).toContain('https://i.ytimg.com/vi/Pmywg8y43j0/hqdefault.jpg')
    expect(html).not.toContain('<iframe')
  })

  it('mostra apenas texto quando o artigo não tem vídeo', () => {
    const html = renderToStaticMarkup(createElement(PostCards, { posts: [post] }))

    expect(html).toContain('href="/posts/artigo-de-devops"')
    expect(html).toContain(post.title)
    expect(html).not.toContain('<img')
  })
})

import { describe, expect, it } from 'vitest'

import { generatePreviewPath } from '@/utilities/generatePreviewPath'

const req = {} as never

const getPathParam = (previewPath: string | null): string | null => {
  if (!previewPath) return null

  return new URLSearchParams(previewPath.split('?')[1]).get('path')
}

describe('preview path generation', () => {
  it('routes the home page preview to the public homepage', () => {
    const previewPath = generatePreviewPath({
      collection: 'pages',
      req,
      slug: 'home',
    })

    expect(getPathParam(previewPath)).toBe('/')
  })

  it('routes nested public preview paths for posts', () => {
    const previewPath = generatePreviewPath({
      collection: 'posts',
      req,
      slug: 'hello world',
    })

    expect(getPathParam(previewPath)).toBe('/posts/hello%20world')
  })
})

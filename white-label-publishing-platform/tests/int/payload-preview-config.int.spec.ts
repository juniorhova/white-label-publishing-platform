import { describe, expect, it } from 'vitest'

import configPromise from '@/payload.config'

describe('Payload preview configuration', () => {
  it('enables Payload preview and live preview for pages and posts', async () => {
    const config = await configPromise
    const pages = config.collections.find((collection) => collection.slug === 'pages')
    const posts = config.collections.find((collection) => collection.slug === 'posts')

    expect(config.admin.livePreview?.collections).toEqual(['pages', 'posts'])

    expect(pages?.admin.preview).toBeTypeOf('function')
    expect(pages?.admin.livePreview?.url).toBeTypeOf('function')

    expect(posts?.admin.preview).toBeTypeOf('function')
    expect(posts?.admin.livePreview?.url).toBeTypeOf('function')
  })
})

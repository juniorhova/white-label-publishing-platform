import React from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { getYouTubeVideoID, validateSocialURL } from '@/utilities/youtube'
import { getYouTubeMetadata } from '@/utilities/getYouTubeMetadata'
import { YouTubePlayer } from '@/components/YouTubeEmbed/Component.client'

afterEach(() => {
  vi.unstubAllGlobals()
  cleanup()
})

const id = 'Pmywg8y43j0'
describe('Home YouTube integration', () => {
  it.each([
    `https://youtu.be/${id}?si=tracking`,
    `https://www.youtube.com/watch?v=${id}&t=15`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
  ])('extracts a video ID from %s', (url) => expect(getYouTubeVideoID(url)).toBe(id))

  it.each([
    'javascript:alert(1)',
    'http://127.0.0.1/watch?v=Pmywg8y43j0',
    'https://youtube.com.attacker.test/watch?v=Pmywg8y43j0',
    'https://user:pass@youtube.com/watch?v=Pmywg8y43j0',
    'https://youtube.com:444/watch?v=Pmywg8y43j0',
    'https://www.youtube.com/playlist?list=123',
    'https://youtu.be/invalid',
  ])('rejects unsafe or non-video URL %s', (url) => expect(getYouTubeVideoID(url)).toBeNull())

  it('only fetches the fixed oEmbed provider and uses its real title and image', async () => {
    const request = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        title: 'Título real do vídeo',
        thumbnail_url: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      }),
    })
    vi.stubGlobal('fetch', request)
    const video = await getYouTubeMetadata(`https://youtu.be/${id}?si=tracking`)
    expect(video?.title).toBe('Título real do vídeo')
    expect(video?.thumbnail).toBe(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`)
    const [endpoint, options] = request.mock.calls[0]
    expect(endpoint.origin).toBe('https://www.youtube.com')
    expect(endpoint.pathname).toBe('/oembed')
    expect(endpoint.searchParams.get('url')).toBe(`https://www.youtube.com/watch?v=${id}`)
    expect(options.redirect).toBe('error')
  })

  it('does not fetch invalid URLs', async () => {
    const request = vi.fn()
    vi.stubGlobal('fetch', request)
    expect(await getYouTubeMetadata('https://private.test/video')).toBeNull()
    expect(request).not.toHaveBeenCalled()
  })

  it('retains a playable fallback when YouTube metadata is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')))
    expect(await getYouTubeMetadata(`https://youtu.be/${id}`)).toEqual({
      id,
      title: 'Vídeo no YouTube',
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    })
  })

  it('rejects external thumbnail hosts returned by the provider', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ title: 'Vídeo', thumbnail_url: 'https://attacker.test/image.png' }),
      }),
    )
    expect((await getYouTubeMetadata(`https://youtu.be/${id}`))?.thumbnail).toBe(
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    )
  })

  it('loads the inline player only after activating its cover', () => {
    const { container } = render(
      React.createElement(YouTubePlayer, {
        id,
        title: 'Título real',
        thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      }),
    )
    expect(container.querySelector('iframe')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir: Título real' }))
    const player = container.querySelector('iframe')!
    expect(player.title).toBe('Título real')
    expect(player.src).toContain(`https://www.youtube-nocookie.com/embed/${id}`)
    expect(player.getAttribute('referrerpolicy')).toBe('strict-origin-when-cross-origin')
    expect(screen.getByRole('link', { name: 'Assistir no YouTube ↗' }).getAttribute('href')).toBe(
      `https://www.youtube.com/watch?v=${id}`,
    )
  })

  it('only accepts matching HTTPS social profile URLs', () => {
    expect(validateSocialURL('https://github.com/juniorhova', 'github')).toBe(true)
    expect(validateSocialURL('https://www.linkedin.com/in/airtonhovajunior/', 'linkedin')).toBe(
      true,
    )
    expect(validateSocialURL('javascript:alert(1)', 'youtube')).not.toBe(true)
    expect(validateSocialURL('https://github.com.attacker.test/u', 'github')).not.toBe(true)
    expect(validateSocialURL(null, 'youtube')).toBe(true)
  })
})

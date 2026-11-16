import { getYouTubeVideoID } from './youtube'

export async function getYouTubeMetadata(url: string) {
  const id = getYouTubeVideoID(url)
  if (!id) return null
  const fallback = {
    id,
    title: 'Vídeo no YouTube',
    thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
  }
  try {
    const endpoint = new URL('https://www.youtube.com/oembed')
    endpoint.searchParams.set('url', `https://www.youtube.com/watch?v=${id}`)
    endpoint.searchParams.set('format', 'json')
    const response = await fetch(endpoint, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(4000),
      redirect: 'error',
    })
    if (!response.ok) return fallback
    const data: unknown = await response.json()
    if (!data || typeof data !== 'object') return fallback
    const metadata = data as { title?: unknown; thumbnail_url?: unknown }
    let thumbnail = fallback.thumbnail
    if (typeof metadata.thumbnail_url === 'string') {
      const image = new URL(metadata.thumbnail_url)
      if (
        image.protocol === 'https:' &&
        image.hostname === 'i.ytimg.com' &&
        !image.port &&
        !image.username &&
        !image.password
      )
        thumbnail = image.href
    }
    return {
      ...fallback,
      thumbnail,
      title:
        typeof metadata.title === 'string' && metadata.title.trim()
          ? metadata.title.slice(0, 500)
          : fallback.title,
    }
  } catch {
    return fallback
  }
}

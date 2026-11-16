/** Accept only ordinary YouTube video URLs; never fetch an editor-supplied host. */
export function getYouTubeVideoID(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    const host = url.hostname.toLowerCase()
    let id: string | null = null
    if (host === 'youtu.be') id = url.pathname.slice(1)
    else if (
      ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(host)
    ) {
      if (url.pathname === '/watch') id = url.searchParams.get('v')
      else id = /^\/(?:embed|shorts|live)\/([^/]+)\/?$/.exec(url.pathname)?.[1] ?? null
    }
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}

export function validateSocialURL(value: unknown, platform: 'youtube' | 'github' | 'linkedin') {
  if (!value) return true
  if (typeof value !== 'string') return 'Informe uma URL válida.'
  const hosts = {
    youtube: ['youtube.com', 'www.youtube.com', 'youtu.be'],
    github: ['github.com', 'www.github.com'],
    linkedin: ['linkedin.com', 'www.linkedin.com'],
  }
  try {
    const url = new URL(value)
    if (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.port &&
      hosts[platform].includes(url.hostname)
    )
      return true
  } catch {
    /* Return the same field validation message. */
  }
  return 'Use um endereço HTTPS da plataforma correspondente.'
}

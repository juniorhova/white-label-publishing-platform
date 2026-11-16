import React from 'react'
import { getYouTubeMetadata } from '@/utilities/getYouTubeMetadata'
import { YouTubePlayer } from './Component.client'

export async function YouTubeEmbed({
  url,
  description,
}: {
  url: string
  description?: string | null
}) {
  const video = await getYouTubeMetadata(url)
  if (!video) return null
  return (
    <div className="personal-video-grid">
      <YouTubePlayer key={video.id} {...video} showFallback={false} />
      <div className="personal-video-copy">
        <p className="personal-eyebrow">VÍDEO DO CANAL</p>
        <h3>{video.title}</h3>
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

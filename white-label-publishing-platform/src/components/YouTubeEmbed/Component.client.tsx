'use client'

import React, { useState } from 'react'
import { Play } from 'lucide-react'

export function YouTubePlayer({
  id,
  title,
  thumbnail,
  showFallback = true,
}: {
  id: string
  title: string
  thumbnail: string
  showFallback?: boolean
}) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="home-video">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&hl=pt-br`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          className="home-video-cover"
          onClick={() => setPlaying(true)}
          aria-label={`Reproduzir: ${title}`}
        >
          {/* YouTube serves this remote preview; Next image optimization is unnecessary. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnail} alt="" width={480} height={360} loading="lazy" />
          <span className="home-video-brand">YouTube</span>
          <span className="home-video-play">
            <Play aria-hidden="true" size={26} fill="currentColor" />
          </span>
          <span className="home-video-title">{title}</span>
        </button>
      )}
      {showFallback && (
        <a
          className="home-video-fallback"
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Assistir no YouTube ↗
        </a>
      )}
    </div>
  )
}

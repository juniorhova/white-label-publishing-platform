import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { getYouTubeMetadata } from '@/utilities/getYouTubeMetadata'
import { YouTubePlayer } from '@/components/YouTubeEmbed/Component.client'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'
import { Timeline } from '@/components/HomeInteractive/Timeline'
import { Roadmap } from '@/components/HomeInteractive/Roadmap'

type Column = NonNullable<ContentBlockProps['columns']>[number]

async function ContentVideoCard({ url, richText }: { url: string; richText: Column['richText'] }) {
  const video = await getYouTubeMetadata(url)
  if (!video) return null
  return (
    <>
      <YouTubePlayer {...video} showFallback={false} />
      <div className="editorial-video-info">
        <h3>{video.title}</h3>
        {richText && <RichText data={richText} enableGutter={false} />}
        <a
          className="editorial-content-link"
          href={`https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Assistir no YouTube ↗
        </a>
      </div>
    </>
  )
}

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns, appearance, sectionTitle } = props

  if (appearance === 'timeline') return <Timeline {...props} />
  if (appearance === 'roadmap') return <Roadmap {...props} />

  const colsSpanClasses = {
    full: 'lg:col-span-12',
    half: 'lg:col-span-6',
    oneThird: 'lg:col-span-4',
    twoThirds: 'lg:col-span-8',
  }

  if (appearance === 'cards' || appearance === 'about') {
    return (
      <section
        id={appearance === 'about' ? 'sobre' : undefined}
        className={`container editorial-section editorial-${appearance}`}
      >
        {sectionTitle && <h2 className="editorial-section-title">{sectionTitle}</h2>}
        <div className="editorial-content-grid">
          {columns?.map(({ richText, enableLink, link, videoURL }, index) => (
            <div
              className={`editorial-content-item${videoURL ? ' editorial-video-item' : ''}`}
              key={index}
            >
              {videoURL ? (
                <ContentVideoCard url={videoURL} richText={richText} />
              ) : (
                richText && <RichText data={richText} enableGutter={false} />
              )}
              {enableLink && (
                <CMSLink {...link} appearance="inline" className="editorial-content-link" />
              )}
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <div className="container my-16">
      {sectionTitle && <h2 className="editorial-section-title">{sectionTitle}</h2>}
      <div className="grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col

            return (
              <div
                className={cn('col-span-4', colsSpanClasses[size || 'full'], {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {richText && <RichText data={richText} enableGutter={false} />}

                {enableLink && <CMSLink {...link} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}

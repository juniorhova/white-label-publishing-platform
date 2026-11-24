import React from 'react'
import Image from 'next/image'
import { Github, Linkedin, Youtube } from 'lucide-react'

import type { Page } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import portrait from '../../../public/junior-hova-portrait.png'
import './portfolio.css'

export const PortfolioHero: React.FC<Page['hero']> = ({
  eyebrow,
  heading,
  introduction,
  links,
  media,
  youtubeVideoURL,
  youtubeDescription,
  youtubeURL,
  githubURL,
  linkedinURL,
}) => {
  const socials = [
    { label: 'YouTube', url: youtubeURL, icon: Youtube, className: 'social-youtube' },
    { label: 'GitHub', url: githubURL, icon: Github, className: 'social-github' },
    { label: 'LinkedIn', url: linkedinURL, icon: Linkedin, className: 'social-linkedin' },
  ].filter(({ url }) => Boolean(url))
  return (
    <section className="personal-home" aria-labelledby="portfolio-heading">
      <div className="personal-intro">
        <div className="personal-portrait">
          {media && typeof media === 'object' ? (
            <Media
              resource={media}
              priority
              imgClassName="portrait-image"
              size="(max-width: 640px) 88px, 180px"
            />
          ) : (
            <Image
              src={portrait}
              alt="Junior Hova de jaqueta de couro em um mirante"
              priority
              className="portrait-image"
              sizes="(max-width: 640px) 88px, 180px"
            />
          )}
        </div>
        <div className="personal-copy">
          {eyebrow && <p className="personal-eyebrow">{eyebrow}</p>}
          <h1 id="portfolio-heading">{heading}</h1>
          {introduction && <p className="personal-description">{introduction}</p>}
          {links && links.length > 0 && (
            <div className="personal-actions">
              {links.slice(0, 2).map(({ link }, index) => (
                <CMSLink
                  key={index}
                  {...link}
                  appearance="inline"
                  className={index === 0 ? 'personal-primary' : 'personal-secondary'}
                />
              ))}
            </div>
          )}
          {socials.length > 0 && (
            <nav className="personal-socials" aria-label="Redes sociais">
              {socials.map(({ label, url, icon: Icon, className }) => (
                <a
                  key={label}
                  href={url!}
                  className={className}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={17} aria-hidden="true" />
                  {label}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </nav>
          )}
        </div>
      </div>
      {youtubeVideoURL && (
        <section className="personal-feature" aria-labelledby="featured-video-heading">
          <div className="personal-feature-heading">
            <h2 id="featured-video-heading">Vídeo em destaque</h2>
          </div>
          <div className="personal-video-panel">
            <YouTubeEmbed url={youtubeVideoURL} description={youtubeDescription} />
          </div>
        </section>
      )}
    </section>
  )
}

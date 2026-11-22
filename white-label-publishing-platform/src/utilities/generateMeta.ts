import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  collection?: 'pages' | 'posts'
}): Promise<Metadata> => {
  const { doc } = args

  const isHome = doc?.slug === 'home'
  const ogImage =
    isHome && !doc?.meta?.image
      ? getServerSideURL() + '/junior-hova-portrait.png'
      : getImageURL(doc?.meta?.image)

  const title = isHome
    ? doc?.meta?.title || 'Junior Hova — Cloud, DevOps e tecnologia'
    : `${doc?.meta?.title || doc?.title || 'Artigo'} | Junior Hova`
  const pathname = isHome
    ? '/'
    : `${args.collection === 'posts' ? '/posts' : ''}/${doc?.slug || ''}`

  return {
    alternates: { canonical: pathname },
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: pathname,
    }),
    title,
  }
}

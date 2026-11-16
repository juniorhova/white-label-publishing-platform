import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { type DataFromGlobalSlug, getPayload } from 'payload'
import { cache } from 'react'

type Global = keyof Config['globals']

const getGlobal = cache(
  async <T extends Global>(slug: T, depth = 0): Promise<DataFromGlobalSlug<T>> => {
    const payload = await getPayload({ config: configPromise })

    const global = await payload.findGlobal({
      slug,
      depth,
    })

    return global
  },
)

/** Request-scoped caching keeps startup content migrations visible immediately. */
export const getCachedGlobal =
  <T extends Global>(slug: T, depth = 0) =>
  () =>
    getGlobal<T>(slug, depth)

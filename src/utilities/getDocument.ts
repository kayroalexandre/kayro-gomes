import type { Config } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

type Collection = keyof Config['collections']

async function getDocument(collection: Collection, id: string, depth = 0) {
  const payload = await getPayload({ config: configPromise })

  const page = await payload.find({
    collection,
    depth,
    where: {
      id: {
        equals: id,
      },
    },
  })

  return page.docs[0]
}

/**
 * Returns an unstable_cache function mapped with the cache tag for the document ID.
 * Used by PayloadRedirects to resolve redirect targets by document ID.
 */
export const getCachedDocument = (collection: Collection, id: string) =>
  unstable_cache(async () => getDocument(collection, id), [collection, id], {
    tags: [`${collection}_${id}`],
  })

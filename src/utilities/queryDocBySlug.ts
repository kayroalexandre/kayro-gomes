import { cache } from 'react'
import { draftMode } from 'next/headers'
import { getPayload, type CollectionSlug } from 'payload'
import configPromise from '@payload-config'

/**
 * Faz `find` em uma collection buscando 1 doc pelo slug,
 * respeitando `draftMode` (overrideAccess só é liberado em draft).
 *
 * Usa o `cache` do React (in-memory, por request) para deduplicar chamadas
 * entre `generateMetadata` e a render function dentro da mesma request.
 *
 * O retorno é `unknown` para forçar o caller a fazer a assertion para o
 * tipo concreto (ex: `Post`, `Project`, `Page`). Isso evita um cast
 * duvidoso dentro do utility.
 *
 * Para cache persistente entre requests use `unstable_cache` com tags
 * (não necessário aqui: revalidação é feita via `revalidatePath` nos hooks
 * afterChange das collections).
 */
export const queryDocBySlug = cache(
  async ({ collection, slug }: { collection: CollectionSlug; slug: string }) => {
    const { isEnabled: draft } = await draftMode()
    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection,
      draft,
      limit: 1,
      pagination: false,
      overrideAccess: draft,
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return result.docs?.[0] || null
  },
)

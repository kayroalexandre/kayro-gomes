import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const SITE_NAME = 'Kayro Gomes'
const SITE_LANG = 'pt-BR'
const SITE_DESCRIPTION =
  'Portfólio e blog de Kayro Gomes, desenvolvedor full-stack brasileiro.'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/og-image.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

/**
 * Gera o `Metadata` do Next para uma Page/Post a partir do doc.
 * Inclui canonical, hreflang (pt-BR) e Open Graph.
 *
 * @param doc - Page ou Post (com meta opcional)
 * @param pathOverride - opcional, sobrescreve o path usado no canonical/og.
 *   Use quando o doc não carrega o slug correto (ex: Post precisa de
 *   `/posts/<slug>`, mas `doc.slug` retorna só `<slug>`).
 */
export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  pathOverride?: string
}): Promise<Metadata> => {
  const { doc, pathOverride } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const rawTitle = doc?.meta?.title?.trim()
  const title =
    !rawTitle
      ? `${SITE_NAME} — Desenvolvedor Full-Stack`
      : rawTitle === SITE_NAME || rawTitle.includes(SITE_NAME)
        ? rawTitle
        : `${rawTitle} | ${SITE_NAME}`

  const slug = Array.isArray(doc?.slug) ? doc?.slug.join('/') : doc?.slug
  const path = pathOverride ?? (slug ? `/${slug}` : '/')
  const serverUrl = getServerSideURL()
  const normalizedPath = path === '/' ? '' : path
  const fullUrl = `${serverUrl}${normalizedPath}`

  return {
    alternates: {
      canonical: fullUrl,
      languages: {
        'pt-BR': fullUrl,
      },
    },
    description: doc?.meta?.description || SITE_DESCRIPTION,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || SITE_DESCRIPTION,
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      locale: SITE_LANG,
      title,
      url: fullUrl,
    }),
    title,
  }
}

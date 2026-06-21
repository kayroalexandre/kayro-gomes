import type { RequiredDataFromCollectionSlug } from 'payload'

/**
 * Página /posts (Blog) — listagem de posts/artigos.
 * Usa o bloco Archive configurado para mostrar a collection "posts".
 * Cards clicáveis levam para /posts/[slug].
 */
export const postsPage: () => RequiredDataFromCollectionSlug<'pages'> = () => {
  return {
    title: 'Blog',
    slug: 'posts',
    _status: 'published',
    hero: {
      type: 'lowImpact',
      richText: {
        root: {
          type: 'root',
          children: [
            {
              type: 'heading',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Blog',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h1',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
    layout: [
      {
        blockType: 'archive',
        populateBy: 'collection',
        relationTo: 'posts',
        categories: [],
        limit: 12,
      },
    ],
    meta: {
      title: 'Blog — Kayro Gomes',
      description:
        'Artigos, reflexões e tutoriais sobre desenvolvimento web, CMS, DevOps e arquitetura.',
    },
  }
}

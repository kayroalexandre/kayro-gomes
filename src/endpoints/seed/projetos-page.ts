import type { RequiredDataFromCollectionSlug } from 'payload'

/**
 * Página /projetos — listagem de projetos do portfólio.
 * Usa o bloco Archive configurado para mostrar a collection "projects".
 * Cards clicáveis levam para /projetos/[slug].
 */
export const projetos: () => RequiredDataFromCollectionSlug<'pages'> = () => {
  return {
    slug: 'projetos',
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
                  text: 'Projetos',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              tag: 'h1',
              version: 1,
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Aplicações, sites e bibliotecas que construí. Cada um com seu stack, contexto e o que aprendi no caminho.',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              textFormat: 0,
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
        relationTo: 'projects',
        categories: [],
        limit: 12,
        introContent: {
          root: {
            type: 'root',
            children: [],
            direction: 'ltr',
            format: '',
            indent: 0,
            version: 1,
          },
        },
      },
    ],
    meta: {
      title: 'Projetos — Kayro Gomes',
      description:
        'Aplicações, sites e bibliotecas que construí. Cada um com seu stack, contexto e o que aprendi no caminho.',
    },
  }
}

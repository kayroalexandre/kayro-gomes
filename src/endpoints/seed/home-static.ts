import type { RequiredDataFromCollectionSlug } from 'payload'

/**
 * Fallback estático da home — usado só enquanto a página "home" não
 * existe no CMS (antes do primeiro seed). Conteúdo em PT-BR pra
 * combinar com o resto do site.
 */
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
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
                text: 'Kayro Gomes',
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
                text: 'Site em construção. Entre no ',
                version: 1,
              },
              {
                type: 'link',
                children: [
                  {
                    type: 'text',
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: 'admin',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                fields: { linkType: 'custom', newTab: false, url: '/admin' },
                format: '',
                indent: 0,
                version: 2,
              },
              {
                type: 'text',
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: ' e rode o seed para preencher o site com conteúdo de exemplo.',
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
  meta: {
    description: 'Portfólio e blog de Kayro Gomes, desenvolvedor full-stack brasileiro.',
    title: 'Kayro Gomes — Desenvolvedor Full-Stack',
  },
  title: 'Início',
  layout: [],
}

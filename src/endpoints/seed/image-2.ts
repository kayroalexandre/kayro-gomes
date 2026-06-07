import type { Media } from '@/payload-types'

/** Imagem genérica usada em posts e na seção mid da home. */
export const image2: Omit<Media, 'createdAt' | 'id' | 'updatedAt'> = {
  alt: 'Imagem ilustrativa de exemplo usada em posts do blog',
  caption: {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Imagem ilustrativa de exemplo. Substitua no admin em Mídia.',
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
}

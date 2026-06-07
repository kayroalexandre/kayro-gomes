import type { Media } from '@/payload-types'

/** Imagem genérica usada no hero da home e em demos. */
export const image1: Omit<Media, 'createdAt' | 'id' | 'updatedAt'> = {
  alt: 'Foto de capa ilustrativa com gradiente azul e roxo — usada no hero da home',
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
              text: 'Imagem de capa ilustrativa. Substitua no admin em Mídia.',
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

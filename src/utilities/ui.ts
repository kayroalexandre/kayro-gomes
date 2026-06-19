/**
 * Utility functions for UI components automatically added by ShadCN and used in a few of our frontend components and blocks.
 *
 * Other functions may be exported from here in the future or by installing other shadcn components.
 */

import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Utilitários de tamanho de fonte semânticos do design system (`text-*`, gerados a
 * partir de `--text-*` no `@theme`). Sem isto, o tailwind-merge classificaria
 * `text-body`/`text-heading`/… como COR (heurística padrão para `text-<palavra>`),
 * e ao mesclar com um override de cor o tamanho seria silenciosamente removido.
 * Registramo-los no grupo `font-size` para que deduplicar/preservar funcione como
 * nas escalas nativas. NÃO inclui `on-dark*`/`on-light*` (são tokens de cor).
 */
const FONT_SIZE_TOKENS = [
  'body',
  'body-lg',
  'body-sm',
  'heading',
  'heading-lg',
  'heading-sm',
  'subheading',
  'subheading-lg',
  'subheading-sm',
  'subtitle',
  'subtitle-lg',
  'subtitle-sm',
  'title',
  'title-hero',
  'title-lg',
  'title-sm',
  'code',
  'code-lg',
  'code-sm',
]

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: FONT_SIZE_TOKENS }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

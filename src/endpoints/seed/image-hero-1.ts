import type { Media } from '@/payload-types'

/** Imagem do hero da home (highImpact). */
export const imageHero1: Omit<Media, 'createdAt' | 'id' | 'updatedAt'> = {
  alt: 'Foto de capa do site — gradiente abstrato para o hero da home',
}

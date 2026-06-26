import type { Menu } from '@/payload-types'

/**
 * Tipo de link de navegação derivado da collection `Menu`.
 */
export type NavLink = Pick<Menu, 'type' | 'reference' | 'url' | 'label' | 'newTab'>

/** Calcula o href de um link de navegação seguindo a mesma lógica do CMSLink. */
export function getNavItemHref(link: NavLink): string | undefined {
  if (!link) return undefined
  const { type, reference, url } = link

  if (type === 'reference' && typeof reference?.value === 'object' && reference.value?.slug) {
    const prefix = reference.relationTo === 'pages' ? '' : `/${reference.relationTo}`
    return `${prefix}/${reference.value.slug}`
  }

  return url || undefined
}

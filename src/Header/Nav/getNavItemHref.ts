import type { Header as HeaderType } from '@/payload-types'
import type { Menu } from '@/payload-types'

/**
 * Tipo unificado para links de navegação.
 * Suporta tanto o shape antigo (Header.navItems[].link) quanto o novo (Menu collection).
 */
export type NavLink =
  | NonNullable<HeaderType['navItems']>[number]['link']
  | Pick<Menu, 'type' | 'reference' | 'url' | 'label' | 'newTab'>

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

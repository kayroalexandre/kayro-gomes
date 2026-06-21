import type { Header as HeaderType } from '@/payload-types'

export type NavLink = NonNullable<HeaderType['navItems']>[number]['link']

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

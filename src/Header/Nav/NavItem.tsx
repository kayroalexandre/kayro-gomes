'use client'

import React from 'react'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import type { NavLink } from './getNavItemHref'

/**
 * Item individual da navegação principal do Header.
 *
 * Encapsula em um único lugar o vocabulário do design system: receitas de
 * tipografia (`type-*`), cor semântica e o estado ativo. Renderiza via
 * `appearance="inline"` (Link puro) para evitar o `text-sm` cru herdado do
 * `Button variant="link"`, deixando a receita `type-*` vencer sem conflito.
 */
export const HeaderNavItem: React.FC<{ link: NavLink; active: boolean }> = ({ link, active }) => {
  return (
    <CMSLink
      {...link}
      appearance="inline"
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-md outline-none transition-colors duration-[var(--duration-fast)] focus-visible:focus-ring',
        active
          ? 'type-body-strong text-foreground'
          : 'type-body text-muted-foreground hover:text-foreground',
      )}
    />
  )
}

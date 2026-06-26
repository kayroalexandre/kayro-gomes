'use client'

import React from 'react'

import type { Header as HeaderType, Menu } from '@/payload-types'

import { Icon } from '@/components/ui/icon'
import { ThemeToggle } from '@/providers/Theme/ThemeToggle'
import { HeaderNavItem } from './NavItem'
import { MobileMenu } from './MobileMenu'
import { getNavItemHref } from './getNavItemHref'
import type { NavLink } from './getNavItemHref'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const menuItems = data?.menu || []
  const searchEnabled = data?.searchEnabled === true
  const pathname = usePathname()

  // Itens com estado ativo resolvido — compartilhados entre o nav desktop e o
  // dropdown mobile, evitando recomputar o href em dois lugares.
  // O campo `menu` é um relationship para a collection `Menu`, que tem
  // estrutura similar ao `link` anterior (label, type, reference|url, newTab).
  const items = menuItems
    .filter((item): item is Menu => typeof item === 'object' && item !== null)
    .map((item) => {
      const link: NavLink = {
        type: item.type,
        reference: item.reference,
        url: item.url,
        label: item.label,
        newTab: item.newTab,
      }
      const href = getNavItemHref(link)
      return { link, active: href ? pathname === href : false }
    })

  return (
    <>
      {/* Center: nav horizontal — só no desktop (< md vazaria sobre o logo). */}
      <nav
        aria-label="Navegação principal"
        className="justify-self-center hidden md:flex gap-6 md:gap-8 items-center"
      >
        {items.map((item, i) => (
          <HeaderNavItem key={i} link={item.link} active={item.active} />
        ))}
      </nav>

      {/* Right: Action icons — mesmo footprint (size-10) e tratamento de cor do toggle */}
      <div className="flex items-center gap-2 justify-self-end">
        {searchEnabled && (
          <Link
            aria-label="Buscar no site"
            className="group inline-flex size-10 items-center justify-center rounded-full glass border border-border/20 outline-none focus-visible:focus-ring"
            href="/search"
          >
            <span className="sr-only">Buscar</span>
            <Icon
              icon={SearchIcon}
              size="md"
              className="text-muted-foreground transition-colors group-hover:text-foreground"
            />
          </Link>
        )}
        <ThemeToggle />
        <MobileMenu items={items} />
      </div>
    </>
  )
}

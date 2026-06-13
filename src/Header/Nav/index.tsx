'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { ThemeToggle } from '@/providers/Theme/ThemeToggle'
import { usePathname } from 'next/navigation'

/** Calcula o href de um link de navegação seguindo a mesma lógica do CMSLink. */
function getNavItemHref(
  link: NonNullable<HeaderType['navItems']>[number]['link'],
): string | undefined {
  if (!link) return undefined
  const { type, reference, url } = link

  if (type === 'reference' && typeof reference?.value === 'object' && reference.value?.slug) {
    const prefix = reference.relationTo === 'pages' ? '' : `/${reference.relationTo}`
    return `${prefix}/${reference.value.slug}`
  }

  return url || undefined
}

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const searchEnabled = data?.searchEnabled === true
  const pathname = usePathname()

  return (
    <>
      {/* Center: Navigation links — absolutely centered via grid justify-self */}
      <nav
        aria-label="Navegação principal"
        className="justify-self-center flex gap-6 md:gap-8 items-center font-medium text-base"
      >
        {navItems.map(({ link }, i) => {
          const itemHref = getNavItemHref(link)
          const active = itemHref ? pathname === itemHref : false

          return (
            <CMSLink
              key={i}
              {...link}
              appearance="link"
              className={cn(
                'transition-colors duration-200',
                active
                  ? 'text-foreground font-semibold'
                  : 'text-foreground/60 hover:text-foreground',
              )}
            />
          )
        })}
      </nav>

      {/* Right: Action icons */}
      <div className="flex items-center gap-2 justify-self-end">
        {searchEnabled && (
          <Link
            aria-label="Buscar no site"
            className="inline-flex items-center justify-center p-1 rounded hover:opacity-80 transition-opacity focus-visible:outline-2 focus-visible:outline-primary"
            href="/search"
          >
            <span className="sr-only">Buscar</span>
            <SearchIcon
              aria-hidden
              className="w-5 h-5 text-foreground/60 hover:text-foreground transition-colors"
            />
          </Link>
        )}
        <ThemeToggle />
      </div>
    </>
  )
}

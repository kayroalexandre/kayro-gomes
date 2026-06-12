'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'
import { ThemeToggle } from '@/providers/Theme/ThemeToggle'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const searchEnabled = data?.searchEnabled === true

  return (
    <>
      {/* Center: Navigation links — absolutely centered via grid justify-self */}
      <nav
        aria-label="Navegação principal"
        className="justify-self-center flex gap-6 md:gap-8 items-center font-sans font-medium text-sm"
      >
        {navItems.map(({ link }, i) => {
          return (
            <CMSLink
              key={i}
              {...link}
              appearance="link"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
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
              className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
            />
          </Link>
        )}
        <ThemeToggle />
      </div>
    </>
  )
}

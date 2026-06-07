'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []

  return (
    <nav aria-label="Navegação principal" className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" />
      })}
      <Link
        aria-label="Buscar no site"
        className="inline-flex items-center justify-center p-1 rounded focus-visible:outline-2 focus-visible:outline-primary"
        href="/search"
      >
        <span className="sr-only">Buscar</span>
        <SearchIcon aria-hidden className="w-5 text-primary" />
      </Link>
    </nav>
  )
}

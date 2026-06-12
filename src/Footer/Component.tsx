import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="container py-12 flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Link className="flex items-center" href="/">
            <Logo />
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            Portfólio profissional com projetos, artigos e experiências.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex flex-col md:flex-row gap-4 md:items-center">
            <ThemeSelector />
            <nav className="flex flex-col md:flex-row gap-4 text-sm">
              {navItems.map(({ link }, i) => {
                return <CMSLink key={i} {...link} />
              })}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

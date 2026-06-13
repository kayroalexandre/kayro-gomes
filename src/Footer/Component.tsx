import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border/10 bg-background/50 backdrop-blur-sm">
      <div className="container py-16 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Link className="flex items-center hover:opacity-95 transition-opacity" href="/">
            <Logo className="text-foreground" />
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Portfólio profissional com projetos, artigos e experiências.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:items-end">
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            <nav className="flex flex-col md:flex-row gap-6 text-sm text-muted-foreground">
              {navItems.map(({ link }, i) => {
                return <CMSLink key={i} {...link} className="hover:text-foreground transition-colors duration-200" />
              })}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}

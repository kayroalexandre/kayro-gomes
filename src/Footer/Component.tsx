import type { Menu } from '@/payload-types'

import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 2)()

  const menuItems = footerData?.menu || []

  return (
    <footer className="mt-auto border-t border-border-muted glass">
      <div className="container py-16 flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-4">
          <Link className="flex items-center hover:opacity-90 transition-opacity" href="/">
            <Logo className="text-foreground" />
          </Link>
          <p className="text-body-sm text-muted-foreground max-w-xs leading-relaxed">
            Portfólio profissional com projetos, artigos e experiências.
          </p>
        </div>

        <div className="flex flex-col gap-6 md:items-end">
          <nav
            aria-label="Navegação do rodapé"
            className="flex flex-col md:flex-row gap-6 text-body-sm text-muted-foreground"
          >
            {menuItems
              .filter((item): item is Menu => typeof item === 'object' && item !== null)
              .map((item, i) => {
                const link = {
                  type: item.type,
                  reference: item.reference,
                  url: item.url,
                  label: item.label,
                  newTab: item.newTab,
                }
                return (
                  <CMSLink
                    key={i}
                    {...link}
                    className="hover:text-foreground transition-colors duration-200"
                  />
                )
              })}
          </nav>
        </div>
      </div>
    </footer>
  )
}

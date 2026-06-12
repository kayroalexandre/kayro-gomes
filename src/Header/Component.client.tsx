'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full bg-background/30 backdrop-blur-lg transition-all duration-300"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container grid h-20 grid-cols-[auto_1fr_auto] items-center">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <Logo loading="eager" priority="high" className="text-foreground" />
        </Link>

        {/* Center: Navigation links (absolute center) */}
        <HeaderNav data={data} />

        {/* Right: Action icons (search + theme) rendered inside HeaderNav */}
      </div>
    </header>
  )
}

'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

import type { Theme } from '@/providers/Theme/types'

/**
 * Define o tema do header (`light` ou `dark`) durante a vida útil da página.
 *
 * Usado em páginas cujo hero tem imagem de fundo que conflita com o
 * tema do header. Renderiza `null` — é um efeito colateral puro.
 *
 * Coloque como irmão do conteúdo da página:
 *
 * ```tsx
 * <PageClient /> // ou <PageHeaderTheme theme="dark" />
 * <PostHero post={post} />
 * ```
 */
export const PageHeaderTheme: React.FC<{ theme: Extract<Theme, 'light' | 'dark'> }> = ({
  theme,
}) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme(theme)
  }, [setHeaderTheme, theme])

  return null
}

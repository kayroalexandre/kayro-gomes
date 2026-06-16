'use client'

import { useEffect, useState } from 'react'

import {
  findEffectiveBackgroundColor,
  parseColorToLuminance,
  selectContrastColor,
} from '@/utilities/contrast'

/**
 * Hook especializado para o Header fixed.
 *
 * Detecta o fundo **atrás** do Header em tempo real (scroll + resize)
 * e retorna cores de contraste para logo, nav e ícones.
 *
 * Diferente de `useDynamicTextColor`, este hook não usa ref de elemento
 * porque o Header é fixed e precisa detectar o conteúdo que está **atrás** dele.
 */
export function useHeaderContrast() {
  const [colors, setColors] = useState({
    logo: 'var(--foreground)',
    nav: 'var(--foreground)',
    icon: 'var(--foreground)',
  })

  useEffect(() => {
    let rafId: number | null = null

    const updateColors = () => {
      // Estratégia: pegar elemento no centro do viewport, logo abaixo do Header
      // O Header é fixed com z-50, então elementFromPoint vai retornar o Header primeiro.
      // Precisamos "olhar através" dele pegando o elemento no mesmo X,Y mas ignorando o Header.
      const headerHeight = 80 // var(--header-h) = 5rem = 80px
      const adminBarOffset = document.documentElement.getAttribute('data-adminbar-h')
        ? parseInt(document.documentElement.getAttribute('data-adminbar-h') || '0')
        : 0

      // Posição logo abaixo do Header
      const x = window.innerWidth / 2
      const y = headerHeight + adminBarOffset + 5

      // elementFromPoint retorna o elemento no topo da pilha (Header)
      // Para "ver através", usamos uma abordagem diferente: pegar todos os elementos naquele ponto
      // e encontrar o primeiro que NÃO é o Header
      // Temporariamente desabilita pointer-events no Header para "ver através"
      const headerEl = document.querySelector('header') as HTMLElement | null
      const originalPointerEvents = headerEl?.style.pointerEvents

      if (headerEl) {
        headerEl.style.pointerEvents = 'none'
      }

      const elementBehind = document.elementFromPoint(x, y) as HTMLElement | null

      // Restaura pointer-events
      if (headerEl && originalPointerEvents !== undefined) {
        headerEl.style.pointerEvents = originalPointerEvents
      }

      if (elementBehind) {
        // Detecção especial para HighImpactHero: se o elemento atrás é uma section
        // com altura de viewport (100dvh), é quase certamente um HighImpactHero
        // com imagem de fundo. Nesse caso, forçar cores claras (dark theme).
        const isHighImpactHero =
          elementBehind.tagName === 'SECTION' && elementBehind.className.includes('100dvh')

        if (isHighImpactHero) {
          // HighImpactHero sempre tem foto de fundo + overlay escuro
          // Usar cores claras para garantir contraste
          const mainColor = selectContrastColor(0.1, 'main') // luminance baixa = escuro
          const iconColor = selectContrastColor(0.1, 'subtle')

          setColors({
            logo: mainColor,
            nav: mainColor,
            icon: iconColor,
          })
          return
        }

        // Para outros casos (LowImpact, MediumImpact, páginas sem hero),
        // detectar o fundo real atrás do Header.
        const bgColor = findEffectiveBackgroundColor(elementBehind)
        const luminance = parseColorToLuminance(bgColor)

        if (luminance !== null) {
          const mainColor = selectContrastColor(luminance, 'main')
          const iconColor = selectContrastColor(luminance, 'subtle')

          setColors({
            logo: mainColor,
            nav: mainColor,
            icon: iconColor,
          })
        } else {
          // Fallback: usar cor padrão do tema
          setColors({
            logo: 'var(--foreground)',
            nav: 'var(--foreground)',
            icon: 'var(--foreground)',
          })
        }
      }
    }

    // 1. Detecção inicial
    rafId = requestAnimationFrame(updateColors)

    // 2. Observer para scroll (throttled via RAF)
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateColors)
    }

    // 3. Observer para resize
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateColors)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    // 4. Observer para mudanças de tema
    const themeObserver = new MutationObserver(() => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateColors)
    })

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      themeObserver.disconnect()
    }
  }, [])

  return colors
}

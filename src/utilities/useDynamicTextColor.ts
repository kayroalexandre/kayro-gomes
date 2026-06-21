'use client'

import { useEffect, useRef, useState } from 'react'

import {
  findEffectiveBackgroundColor,
  parseColorToLuminance,
  selectContrastColor,
  type ContrastLevel,
} from './contrast'

/**
 * Hook para contraste dinâmico de texto/ícones.
 *
 * Detecta automaticamente a cor de fundo do elemento em tempo real (realtime)
 * e retorna a cor de texto adequada para manter contraste WCAG AA (4.5:1).
 *
 * Uso:
 * ```tsx
 * function MyBadge() {
 *   const { ref, color } = useDynamicTextColor('main');
 *   return <span ref={ref} style={{ color }}>Badge</span>;
 * }
 * ```
 *
 * O hook:
 * - É 100% automático (sem props manuais de cor)
 * - Funciona em tempo de render (client)
 * - Observa mudanças de classe, style, data-theme
 * - Funciona em qualquer elemento (badge, botão, texto, ícone, etc.)
 */
export function useDynamicTextColor(level: ContrastLevel = 'main') {
  const ref = useRef<HTMLElement>(null)
  const [color, setColor] = useState<string>('var(--foreground)') // Fallback inicial: padrão do tema

  useEffect(() => {
    const element = ref.current
    if (!element) return

    let rafId: number | null = null

    const updateColor = () => {
      const bgColor = findEffectiveBackgroundColor(element)
      const luminance = parseColorToLuminance(bgColor)

      if (luminance !== null) {
        const contrastColor = selectContrastColor(luminance, level)
        setColor(contrastColor)
      }
      // Se luminance for null, mantém o fallback
    }

    // 1. Detecção inicial (após paint)
    rafId = requestAnimationFrame(updateColor)

    // 2. Observer para mudanças no próprio elemento (classe, style)
    const elementObserver = new MutationObserver(() => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateColor)
    })

    elementObserver.observe(element, {
      attributes: true,
      attributeFilter: ['class', 'style'],
      subtree: false,
    })

    // 3. Observer para mudanças no <html> (data-theme, dark mode)
    const rootObserver = new MutationObserver(() => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateColor)
    })

    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    })

    // 4. Observer para mudanças no body (caso o fundo mude)
    const bodyObserver = new MutationObserver(() => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateColor)
    })

    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    })

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      elementObserver.disconnect()
      rootObserver.disconnect()
      bodyObserver.disconnect()
    }
  }, [level])

  return { ref, color }
}

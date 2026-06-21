'use client'

import React from 'react'

import { useDynamicTextColor } from '@/utilities/useDynamicTextColor'

interface DynamicTechBadgeProps {
  children: React.ReactNode
}

/**
 * Badge de tecnologia com contraste dinâmico automático.
 * Detecta o fundo e ajusta a cor do texto para manter WCAG AA.
 */
export const DynamicTechBadge: React.FC<DynamicTechBadgeProps> = ({ children }) => {
  const { ref, color } = useDynamicTextColor('main')

  return (
    <li
      ref={ref as React.RefObject<HTMLLIElement>}
      className="text-scale-01 px-2 py-1 rounded bg-on-dark/10 border border-on-dark/20"
      style={{ color }}
    >
      {children}
    </li>
  )
}

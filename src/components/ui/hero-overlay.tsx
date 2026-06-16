'use client'

import React from 'react'

interface HeroOverlayProps {
  /** Opacidade do overlay escuro (0-100). Default: 40 */
  opacity?: number
  /** Se true, renderiza o fade inferior. Default: true */
  bottomFade?: boolean
}

/**
 * Overlay reutilizável para heróis de página (PostHero, ProjectHero).
 * Centraliza o padrão visual: overlay escuro + fade inferior.
 * Usa tokens do design system (--overlay-dark, --overlay-fade).
 */
export const HeroOverlay: React.FC<HeroOverlayProps> = ({ opacity = 40, bottomFade = true }) => {
  return (
    <>
      {/* Overlay escuro sobre a imagem - usa token --overlay-dark */}
      <div
        className="absolute pointer-events-none inset-0 bg-[var(--overlay-dark)]"
        style={{ opacity: opacity / 100 }}
        aria-hidden
      />
      {/* Fade inferior para transição suave com o conteúdo abaixo - usa token --overlay-fade */}
      {bottomFade && (
        <div
          className="absolute pointer-events-none left-0 bottom-0 w-full h-1/2 bg-linear-to-t from-[var(--overlay-fade)] via-[var(--overlay-fade)]/40 to-transparent"
          aria-hidden
        />
      )}
    </>
  )
}

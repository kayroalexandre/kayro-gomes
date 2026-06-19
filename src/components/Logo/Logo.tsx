import { cn } from '@/utilities/ui'
import React from 'react'

interface Props {
  className?: string
}

/**
 * Wordmark do site — "Kayro Gomes" estilizado.
 * Substitui o logo da Payload (que era hardcoded) por uma marca de texto
 * adequada a um portfólio pessoal. Sem dependência externa.
 */
export const Logo = ({ className }: Props) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold text-heading tracking-tight whitespace-nowrap',
        className,
      )}
      aria-label="Kayro Gomes — Início"
    >
      Kayro Gomes
    </span>
  )
}

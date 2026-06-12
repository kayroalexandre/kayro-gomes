import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

/**
 * Wordmark do site — "Kayro Gomes" estilizado.
 * Substitui o logo da Payload (que era hardcoded) por uma marca de texto
 * adequada a um portfólio pessoal. Sem dependência externa.
 */
export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span
      className={clsx(
        'inline-flex items-center font-semibold text-lg tracking-tight whitespace-nowrap',
        className,
      )}
      aria-label="Kayro Gomes — Início"
    >
      Kayro Gomes
    </span>
  )
}

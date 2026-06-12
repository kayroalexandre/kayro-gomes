/**
 * Design System - Border Radius
 * Baseado na referência visual: heymessage.framer.ai
 * Bordas suaves, botões pill-shaped
 */

export const radius = {
  none: '0',
  sm: '0.25rem', // 4px
  md: '0.5rem', // 8px
  lg: '0.75rem', // 12px
  xl: '1rem', // 16px
  '2xl': '1.5rem', // 24px
  '3xl': '2rem', // 32px
  full: '9999px', // Pill shape (botões da referência)

  // Aliases semânticos
  button: '9999px', // Botões pill-shaped
  card: '1rem', // Cards
  input: '0.75rem', // Inputs
  badge: '9999px', // Badges
} as const

export type RadiusToken = keyof typeof radius

/**
 * Design System - Cores
 * Baseado na referência visual: heymessage.framer.ai
 * Paleta minimalista com alto contraste e tons neutros
 */

export const colors = {
  // Cores base (Light Mode)
  light: {
    background: 'oklch(98% 0 0)',
    foreground: 'oklch(14.5% 0 0)',
    card: 'oklch(100% 0 0)',
    cardForeground: 'oklch(14.5% 0 0)',
    popover: 'oklch(100% 0 0)',
    popoverForeground: 'oklch(14.5% 0 0)',
    primary: 'oklch(20.5% 0 0)',
    primaryForeground: 'oklch(98.5% 0 0)',
    secondary: 'oklch(96% 0 0)',
    secondaryForeground: 'oklch(20.5% 0 0)',
    muted: 'oklch(96% 0 0)',
    mutedForeground: 'oklch(55% 0 0)',
    accent: 'oklch(96% 0 0)',
    accentForeground: 'oklch(20.5% 0 0)',
    destructive: 'oklch(57.7% 0.245 27.325)',
    destructiveForeground: 'oklch(98% 0 0)',
    border: 'oklch(92% 0 0)',
    input: 'oklch(92% 0 0)',
    ring: 'oklch(70% 0 0)',
    success: 'oklch(78% 0.08 200)',
    warning: 'oklch(89% 0.1 75)',
    error: 'oklch(75% 0.15 25)',
  },

  // Cores base (Dark Mode)
  dark: {
    background: 'oklch(12% 0 0)',
    foreground: 'oklch(98.5% 0 0)',
    card: 'oklch(16% 0 0)',
    cardForeground: 'oklch(98.5% 0 0)',
    popover: 'oklch(14% 0 0)',
    popoverForeground: 'oklch(98.5% 0 0)',
    primary: 'oklch(98.5% 0 0)',
    primaryForeground: 'oklch(20.5% 0 0)',
    secondary: 'oklch(24% 0 0)',
    secondaryForeground: 'oklch(98.5% 0 0)',
    muted: 'oklch(24% 0 0)',
    mutedForeground: 'oklch(70% 0 0)',
    accent: 'oklch(24% 0 0)',
    accentForeground: 'oklch(98.5% 0 0)',
    destructive: 'oklch(39.6% 0.141 25.723)',
    destructiveForeground: 'oklch(98% 0 0)',
    border: 'oklch(26% 0 0)',
    input: 'oklch(26% 0 0)',
    ring: 'oklch(43% 0 0)',
    success: 'oklch(28% 0.1 200)',
    warning: 'oklch(35% 0.08 70)',
    error: 'oklch(45% 0.1 25)',
  },

  // Cores semânticas (comuns aos dois temas)
  semantic: {
    white: '#ffffff',
    black: '#000000',
    transparent: 'transparent',
  },
} as const

export type ColorToken = keyof typeof colors.light | keyof typeof colors.dark

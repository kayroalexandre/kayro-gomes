/**
 * Design System - Cores
 * Baseado na referência visual: heymessage.framer.ai
 * Paleta minimalista com alto contraste e tons neutros
 */

export const colors = {
  // Cores base (Light Mode)
  light: {
    background: 'oklch(99% 0 0)',
    foreground: 'oklch(9.44% 0 0)',
    card: 'oklch(96.5% 0.005 265)',
    cardForeground: 'oklch(9.44% 0 0)',
    popover: 'oklch(100% 0 0)',
    popoverForeground: 'oklch(9.44% 0 0)',
    primary: 'oklch(0% 0 0)',
    primaryForeground: 'oklch(100% 0 0)',
    secondary: 'oklch(95% 0 0)',
    secondaryForeground: 'oklch(9.44% 0 0)',
    muted: 'oklch(95% 0 0)',
    mutedForeground: 'oklch(55% 0 0)',
    accent: 'oklch(93.9% 0.165 116.8)',
    accentForeground: 'oklch(0% 0 0)',
    destructive: 'oklch(57.7% 0.245 27.325)',
    destructiveForeground: 'oklch(98% 0 0)',
    border: 'oklch(90% 0 0)',
    input: 'oklch(90% 0 0)',
    ring: 'oklch(0% 0 0)',
    success: 'oklch(78% 0.08 200)',
    warning: 'oklch(89% 0.1 75)',
    error: 'oklch(75% 0.15 25)',
  },

  // Cores base (Dark Mode)
  dark: {
    background: 'oklch(9.44% 0 0)',
    foreground: 'oklch(100% 0 0)',
    card: 'oklch(11.83% 0 0)',
    cardForeground: 'oklch(100% 0 0)',
    popover: 'oklch(13.2% 0 0)',
    popoverForeground: 'oklch(100% 0 0)',
    primary: 'oklch(93.9% 0.165 116.8)',
    primaryForeground: 'oklch(0% 0 0)',
    secondary: 'oklch(13.2% 0 0)',
    secondaryForeground: 'oklch(100% 0 0)',
    muted: 'oklch(13.2% 0 0)',
    mutedForeground: 'oklch(58.8% 0 0)',
    accent: 'oklch(93.9% 0.165 116.8)',
    accentForeground: 'oklch(0% 0 0)',
    destructive: 'oklch(39.6% 0.141 25.723)',
    destructiveForeground: 'oklch(98% 0 0)',
    border: 'oklch(20% 0 0)',
    input: 'oklch(20% 0 0)',
    ring: 'oklch(93.9% 0.165 116.8)',
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

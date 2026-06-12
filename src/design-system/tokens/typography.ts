/**
 * Design System - Tipografia
 * Baseado na referência visual: heymessage.framer.ai
 * Hierarquia clara, pesos variáveis, espaçamento generoso
 */

export const typography = {
  // Famílias de fonte
  fontFamily: {
    sans: 'var(--font-sans)',
    heading: 'var(--font-heading)',
    mono: 'var(--font-mono)',
  },

  // Tamanhos de fonte (em rem)
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
    '7xl': '4.5rem', // 72px
    '8xl': '6rem', // 96px
  },

  // Pesos de fonte
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Altura de linha
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Espaçamento entre letras
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Tamanhos de heading (específicos da referência)
  heading: {
    h1: {
      fontSize: { mobile: '2.5rem', desktop: '4.5rem' },
      fontWeight: '400',
      lineHeight: '1.1',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: { mobile: '1.875rem', desktop: '3rem' },
      fontWeight: '400',
      lineHeight: '1.2',
      letterSpacing: '-0.015em',
    },
    h3: {
      fontSize: { mobile: '1.5rem', desktop: '2rem' },
      fontWeight: '500',
      lineHeight: '1.3',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: { mobile: '1.25rem', desktop: '1.5rem' },
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0',
    },
  },

  // Tamanhos de texto de corpo
  body: {
    large: {
      fontSize: '1.125rem',
      fontWeight: '400',
      lineHeight: '1.7',
    },
    base: {
      fontSize: '1rem',
      fontWeight: '400',
      lineHeight: '1.7',
    },
    small: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.6',
    },
  },
} as const

export type TypographyToken = keyof typeof typography.fontSize

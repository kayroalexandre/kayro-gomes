/**
 * Design System - Motion Tokens
 * Baseado na referência visual: heymessage.framer.ai
 * Animações suaves, transições fluidas, microinterações
 */

export const motion = {
  // Durações (em segundos)
  duration: {
    instant: 0,
    fast: 0.15,
    normal: 0.3,
    slow: 0.5,
    slower: 0.7,
    slowest: 1,
  },

  // Easing curves
  easing: {
    linear: 'linear',
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    // Easing suave para scroll reveals
    smooth: [0.25, 0.1, 0.25, 1],
    // Easing para microinterações
    snappy: [0.2, 0, 0, 1],
  },

  // Delays para sequências de animação
  delay: {
    none: 0,
    xs: 0.05,
    sm: 0.1,
    md: 0.2,
    lg: 0.3,
    xl: 0.4,
  },

  // Variantes de animação para Framer Motion
  variants: {
    // Fade in from bottom
    fadeUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    // Fade in from top
    fadeDown: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0 },
    },
    // Fade in
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    // Scale in
    scale: {
      hidden: { opacity: 0, scale: 0.95 },
      visible: { opacity: 1, scale: 1 },
    },
    // Stagger children
    stagger: {
      visible: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
  },
} as const

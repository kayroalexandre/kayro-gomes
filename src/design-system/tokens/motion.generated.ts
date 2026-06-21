/* =========================================================================
   GERADO AUTOMATICAMENTE por scripts/build-tokens.ts a partir de motion.json.
   NÃO EDITAR. Fonte da verdade: src/design-system/tokens/motion.json
   ========================================================================= */

export const duration = {
  instant: 0,
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  slower: 0.7,
  slowest: 1,
} as const

export const easing = {
  linear: "linear",
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  smooth: [0.25, 0.1, 0.25, 1],
  snappy: [0.2, 0, 0, 1],
  emphasized: [0.2, 0.8, 0.2, 1],
} as const

export const delay = {
  none: 0,
  xs: 0.05,
  sm: 0.1,
  md: 0.2,
  lg: 0.3,
  xl: 0.4,
} as const

export type DurationToken = keyof typeof duration
export type EasingToken = keyof typeof easing
export type DelayToken = keyof typeof delay

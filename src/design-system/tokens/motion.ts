/**
 * Design System — Motion Tokens (camada de composição p/ Framer Motion).
 *
 * Durações, easings e delays NÃO são definidos aqui: são GERADOS de motion.json
 * (→ motion.generated.ts), a fonte da verdade única. Este arquivo só agrega
 * essas constantes e adiciona as `variants` de composição usadas no app.
 *
 * Para editar valores de movimento, altere motion.json e rode `bun run design:build`.
 */
import { delay, duration, easing } from './motion.generated'

export const motion = {
  duration,
  easing,
  delay,

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

export { delay, duration, easing } from './motion.generated'
export type { DelayToken, DurationToken, EasingToken } from './motion.generated'

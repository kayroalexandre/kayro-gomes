import { Google_Sans_Flex, Google_Sans_Code } from 'next/font/google'

/**
 * Google Sans Flex — família principal do design system.
 * Weights: 100–1000 (suporta variable font)
 * Optical sizes: 10–144
 */
export const fontSans = Google_Sans_Flex({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
})

/**
 * Google Sans Code — família monospace para código e dados técnicos.
 * Weights: 300–800
 */
export const fontMono = Google_Sans_Code({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
})

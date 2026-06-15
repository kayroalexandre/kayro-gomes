import fs from 'fs'
import path from 'path'

const typography = JSON.parse(
  fs.readFileSync(path.resolve('./src/design-system/tokens/typography.json'), 'utf-8')
)

/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              fontFamily: 'var(--font-sans)',
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              '--tw-prose-code': 'var(--tw-prose-body)',
              h1: {
                fontWeight: '800',
                letterSpacing: '-0.025em',
                marginBottom: '0.25em',
              },
              h2: {
                fontWeight: '600',
                letterSpacing: '-0.025em',
              },
              h3: {
                fontWeight: '600',
                letterSpacing: '-0.025em',
              },
              h4: {
                fontWeight: '600',
                letterSpacing: '-0.025em',
              },
              code: {
                fontFamily: 'var(--font-mono)',
                fontWeight: '600',
              },
              a: {
                textDecoration: 'none',
                fontWeight: '500',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: { fontSize: typography.size.h1.base.value },
              h2: { fontSize: typography.size.h2.base.value },
              h3: { fontSize: typography.size.h3.base.value },
              h4: { fontSize: typography.size.h4.base.value },
            },
          ],
        },
        md: {
          css: [
            {
              h1: { fontSize: typography.size.h1.md.value },
              h2: { fontSize: typography.size.h2.md.value },
              h3: { fontSize: typography.size.h3.md.value },
              h4: { fontSize: typography.size.h4.md.value },
            },
          ],
        },
      },
    },
  },
}

export default config

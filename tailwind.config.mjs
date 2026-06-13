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
              h1: { fontSize: '2.5rem' },
              h2: { fontSize: '1.5rem' },
              h3: { fontSize: '1.25rem' },
              h4: { fontSize: '1rem' },
            },
          ],
        },
        md: {
          css: [
            {
              h1: { fontSize: '3rem' },
              h2: { fontSize: '1.75rem' },
              h3: { fontSize: '1.5rem' },
              h4: { fontSize: '1.125rem' },
            },
          ],
        },
      },
    },
  },
}

export default config

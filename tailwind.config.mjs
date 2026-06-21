/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      // Configuração do plugin @tailwindcss/typography (classes `prose`),
      // usado para renderizar rich text do CMS. Os tamanhos de heading são
      // mapeados à escala tipográfica do design system (Simple Design System,
      // em rem) através dos CSS vars `--text-scale-*` — definidos em
      // src/design-system/tokens.css (gerado de tokens/typography.json).
      //
      // Referenciar os CSS vars (em vez de ler a forma interna do JSON) mantém
      // o prose alinhado aos MESMOS tokens dos utilitários text-*/type-* e
      // desacopla este arquivo da estrutura do JSON — refactors nos tokens não
      // quebram mais o build.
      typography: {
        DEFAULT: {
          css: [
            {
              fontFamily: 'var(--font-sans)',
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              '--tw-prose-code': 'var(--tw-prose-body)',
              h1: {
                fontWeight: 'var(--weight-extra-bold)',
                letterSpacing: 'var(--letter-spacing-tight)',
                marginBottom: '0.25em',
              },
              h2: {
                fontWeight: 'var(--weight-semibold)',
                letterSpacing: 'var(--letter-spacing-tight)',
              },
              h3: {
                fontWeight: 'var(--weight-semibold)',
                letterSpacing: 'var(--letter-spacing-tight)',
              },
              h4: {
                fontWeight: 'var(--weight-semibold)',
                letterSpacing: 'var(--letter-spacing-tight)',
              },
              code: {
                fontFamily: 'var(--font-mono)',
                fontWeight: 'var(--weight-semibold)',
              },
              a: {
                textDecoration: 'none',
                fontWeight: 'var(--weight-medium)',
              },
            },
          ],
        },
        // Tamanhos base (mobile) — aplicados pela classe `prose`.
        base: {
          css: [
            {
              h1: { fontSize: 'var(--text-scale-07)' }, // 2.5rem
              h2: { fontSize: 'var(--text-scale-05)' }, // 1.5rem
              h3: { fontSize: 'var(--text-scale-04)' }, // 1.25rem
              h4: { fontSize: 'var(--text-scale-03)' }, // 1rem
            },
          ],
        },
        // Tamanhos a partir do breakpoint md — aplicados por `md:prose-md`.
        md: {
          css: [
            {
              h1: { fontSize: 'var(--text-scale-08)' }, // 3rem
              h2: { fontSize: 'var(--text-scale-06)' }, // 2rem  (escala SDS; antes 1.875rem)
              h3: { fontSize: 'var(--text-scale-05)' }, // 1.5rem
              h4: { fontSize: 'var(--text-scale-04)' }, // 1.25rem (escala SDS; antes 1.125rem)
            },
          ],
        },
      },
    },
  },
}

export default config

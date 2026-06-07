import nextPlugin from '@next/eslint-plugin-next'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'

/**
 * Flat config para ESLint 9.
 *
 * O template original usava `FlatCompat` com `next/core-web-vitals`, que
 * dispara um bug de "circular structure" no `@eslint/eslintrc@3.3.5` quando
 * combinado com `eslint-plugin-react@7`. Aqui usamos o plugin `next` direto
 * sem o wrapper de compat.
 */
const nextRecommended = nextPlugin.configs.recommended.rules || {}
const nextCoreWebVitals = nextPlugin.configs['core-web-vitals'].rules || {}

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      '.kilo/**',
      'src/payload-types.ts',
      'src/payload-generated-schema.ts',
      'public/**',
      'tests/e2e/**',
      'tests/helpers/**',
      'scripts/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: {
      '@next/next': nextPlugin,
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...nextRecommended,
      ...nextCoreWebVitals,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
]

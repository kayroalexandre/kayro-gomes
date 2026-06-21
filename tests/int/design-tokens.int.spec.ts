import { describe, it, expect } from 'vitest'

import postcss from 'postcss'

import typography from '../../src/design-system/tokens/typography.json'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const tokensCss = readFileSync(
  resolve(__dirname, '../../src/design-system/tokens.css'),
  'utf-8',
)

/**
 * Guard de estrutura: a tipografia semântica deve ser 100% definida no JSON.
 * Cada grupo semântico precisa expor line-height e letter-spacing (além de
 * family/weight/size), para que as receitas @utility type-* derivem TODOS os
 * atributos do JSON — nada de leading/tracking decidido no build-tokens.ts.
 */

const SEMANTIC_TYPE_GROUPS = [
  'body',
  'code',
  'heading',
  'subheading',
  'subtitle',
  'title-page',
  'title-hero',
] as const

type Leaf = { $value: string | number }
const isLeaf = (n: unknown): n is Leaf =>
  !!n && typeof n === 'object' && '$value' in (n as Record<string, unknown>)

type TypographyGroup = Record<string, unknown>
type TypographyJson = Record<string, TypographyGroup>

describe('typography.json — grupos semânticos definem line-height e letter-spacing', () => {
  for (const group of SEMANTIC_TYPE_GROUPS) {
    it(`grupo "${group}" expõe line-height e letter-spacing`, () => {
      const node = (typography as unknown as TypographyJson)[group]
      expect(node, `grupo ${group} ausente`).toBeTruthy()
      expect(isLeaf(node['line-height']), `${group}.line-height ausente`).toBe(true)
      expect(isLeaf(node['letter-spacing']), `${group}.letter-spacing ausente`).toBe(true)
    })
  }

  it('grupo "body" expõe line-height-relaxed (para a receita body-large)', () => {
    const body = (typography as unknown as TypographyJson).body
    expect(isLeaf(body['line-height-relaxed']), 'body.line-height-relaxed ausente').toBe(true)
  })
})

describe('tokens.css — contraste sobre mídia exposto no @theme', () => {
  const CONTRAST_THEME_VARS = [
    '--color-on-dark',
    '--color-on-dark-muted',
    '--color-on-dark-subtle',
    '--color-on-light',
    '--color-on-light-muted',
    '--color-on-light-subtle',
  ] as const

  for (const v of CONTRAST_THEME_VARS) {
    it(`expõe ${v} no @theme`, () => {
      // `${v}: var(` casa a linha exata (o sufixo "-muted:"/"-subtle:" difere de ": var(").
      expect(tokensCss).toContain(`${v}: var(`)
    })
  }
})

describe('tokens.css — saída é CSS sintaticamente válido', () => {
  // Guard que reproduz o caminho de build (PostCSS/Tailwind). Os outros guards
  // só checam substrings; este parseia o CSS gerado e falha se um título de
  // seção/valor produzir comentário ou sintaxe inválida (ex.: `*/` dentro de um
  // comentário fecha-o cedo). Fecha o buraco do gate por-task, que não parseava CSS.
  it('parseia sem erro no PostCSS', () => {
    expect(() => postcss.parse(tokensCss, { from: 'tokens.css' })).not.toThrow()
  })
})

describe('tokens.css — tokens de layout de componente/seção emitidos', () => {
  // Guard de órfãos para o vocabulário consumido via var() em controles
  // (button/input/select/textarea) e ritmo de seção (blocos/heros). Se o build
  // parar de emitir qualquer um, esses componentes perdem altura/padding/ritmo.
  const LAYOUT_VARS = [
    '--control-height-sm',
    '--control-height-md',
    '--control-height-lg',
    '--control-padding-x-compact',
    '--control-padding-x-sm',
    '--control-padding-x-md',
    '--control-padding-x-lg',
    '--control-padding-y',
    '--control-gap',
    '--space-section-y',
    '--space-section-y-lg',
    '--space-block-gap',
  ] as const

  for (const v of LAYOUT_VARS) {
    it(`emite ${v} em :root`, () => {
      expect(tokensCss).toMatch(new RegExp(`${v}:\\s`))
    })
  }

  it('mantém a calibração shadcn (alturas 2.25/2.5/3rem)', () => {
    expect(tokensCss).toContain('--control-height-sm: 2.25rem;')
    expect(tokensCss).toContain('--control-height-md: 2.5rem;')
    expect(tokensCss).toContain('--control-height-lg: 3rem;')
  })
})

describe('tokens.css — @utility focus-ring tokenizado', () => {
  const block = tokensCss.match(/@utility focus-ring \{[^}]*\}/)?.[0] ?? ''

  it('declara o utilitário @utility focus-ring', () => {
    expect(block).not.toBe('')
  })

  it('usa os tokens --stroke-focus-ring e --ring, sem literais de px', () => {
    expect(block).toContain('var(--stroke-focus-ring)')
    expect(block).toContain('var(--ring)')
    expect(block).not.toMatch(/\d+px/)
  })
})

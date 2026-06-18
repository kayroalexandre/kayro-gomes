import { describe, it, expect } from 'vitest'

import typography from '../../src/design-system/tokens/typography.json'

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

describe('typography.json — grupos semânticos definem line-height e letter-spacing', () => {
  for (const group of SEMANTIC_TYPE_GROUPS) {
    it(`grupo "${group}" expõe line-height e letter-spacing`, () => {
      const node = (typography as Record<string, any>)[group]
      expect(node, `grupo ${group} ausente`).toBeTruthy()
      expect(isLeaf(node['line-height']), `${group}.line-height ausente`).toBe(true)
      expect(isLeaf(node['letter-spacing']), `${group}.letter-spacing ausente`).toBe(true)
    })
  }

  it('grupo "body" expõe line-height-relaxed (para a receita body-large)', () => {
    const body = (typography as Record<string, any>).body
    expect(isLeaf(body['line-height-relaxed']), 'body.line-height-relaxed ausente').toBe(true)
  })
})

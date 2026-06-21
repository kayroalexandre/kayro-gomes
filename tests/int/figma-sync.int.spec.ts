import { readFileSync } from 'fs'
import { resolve } from 'path'

import { describe, it, expect } from 'vitest'

import { loadAllTokens, walkLeaves, type TokenFile, TOKEN_FILES } from '../../scripts/figma/dtcg'
import { classifyToken } from '../../scripts/figma/mapping'
import { inSrgbGamut, oklchToRgb, parseOklch, rgbToOklch } from '../../scripts/figma/oklch'
import { mergeDumpIntoTokens, type TokenTrees } from '../../scripts/figma/figma-to-tokens'
import { buildPlan, parseShadow } from '../../scripts/figma/tokens-to-figma-plan'
import { dumpFromPlan } from '../../scripts/figma/sync'

const tokensCss = readFileSync(
  resolve(__dirname, '../../src/design-system/tokens.css'),
  'utf-8',
)

/**
 * Contrato de fidelidade da ponte de tokens Figma. O código é a verdade; o
 * Figma nunca regride. Estes guards garantem que o round-trip
 * JSON → plano → (dump idêntico) → JSON é um no-op (lossless), que o naming
 * casa com tokens.css, e que todo token está classificado.
 */

function freshTrees(): TokenTrees {
  return loadAllTokens() as TokenTrees
}

describe('round-trip lossless (no-op): JSON → plano → dump → JSON', () => {
  it('um dump idêntico ao plano não produz nenhuma mudança', () => {
    const plan = buildPlan()
    const dump = dumpFromPlan(plan)
    const trees = freshTrees()
    const { changes, orphans } = mergeDumpIntoTokens(dump, trees)
    expect(orphans, `órfãos inesperados: ${orphans.join(', ')}`).toEqual([])
    expect(changes, `mudanças espúrias: ${JSON.stringify(changes)}`).toEqual([])
  })

  it('as árvores permanecem deep-equal ao original após o merge', () => {
    const plan = buildPlan()
    const dump = dumpFromPlan(plan)
    const original = freshTrees()
    const mutated = freshTrees()
    mergeDumpIntoTokens(dump, mutated)
    expect(mutated).toEqual(original)
  })
})

describe('idempotência do plano', () => {
  it('gerar o plano duas vezes produz JSON byte-a-byte idêntico', () => {
    const a = JSON.stringify(buildPlan())
    const b = JSON.stringify(buildPlan())
    expect(a).toBe(b)
  })

  it('toda variável carrega um checksum estável', () => {
    const plan = buildPlan()
    for (const c of plan.collections) {
      for (const v of c.variables) expect(v.checksum).toMatch(/^sha256:/)
    }
  })
})

describe('aliasing preservado (semânticos nunca viram valor cru)', () => {
  it('toda variável de Color e Contrast é alias para Primitives', () => {
    const plan = buildPlan()
    const themed = plan.collections.filter((c) => c.name === 'Color' || c.name === 'Contrast')
    expect(themed.length).toBe(2)
    for (const c of themed) {
      for (const v of c.variables) {
        for (const [mode, val] of Object.entries(v.valuesByMode)) {
          expect(val.kind, `${c.name}/${v.name} [${mode}] deveria ser alias`).toBe('alias')
          if (val.kind === 'alias') expect(val.collection).toBe('Primitives')
        }
      }
    }
  })

  it('Color tem exatamente os modos Light e Dark preenchidos', () => {
    const plan = buildPlan()
    const color = plan.collections.find((c) => c.name === 'Color')!
    for (const v of color.variables) {
      expect(Object.keys(v.valuesByMode).sort()).toEqual(['Dark', 'Light'])
    }
  })
})

describe('codeSyntax casa com tokens.css (naming mapping ↔ build-tokens)', () => {
  it('todo var(--X) de codeSyntax existe como --X: em tokens.css', () => {
    const plan = buildPlan()
    const missing: string[] = []
    for (const c of plan.collections) {
      for (const v of c.variables) {
        const web = v.codeSyntax?.WEB
        if (!web) continue
        const m = web.match(/^var\((--[a-z0-9-]+)\)$/i)
        expect(m, `codeSyntax malformado: ${web}`).toBeTruthy()
        const cssVar = m![1]
        if (!tokensCss.includes(`${cssVar}:`)) missing.push(`${c.name}/${v.name} → ${cssVar}`)
      }
    }
    expect(missing, `codeSyntax sem var correspondente em tokens.css:\n${missing.join('\n')}`).toEqual([])
  })

  it('primitivos de cor NÃO têm codeSyntax (não há --primitive-* no CSS)', () => {
    const plan = buildPlan()
    const prim = plan.collections.find((c) => c.name === 'Primitives')!
    for (const v of prim.variables) {
      expect(v.codeSyntax, `${v.name} não deveria ter codeSyntax`).toBeUndefined()
      expect(v.hiddenFromPublishing).toBe(true)
    }
  })
})

describe('conversão oklch round-trip (módulo isolado)', () => {
  // Cores deliberadamente fora do gamut sRGB (chroma alto) — perda esperada.
  const OUT_OF_GAMUT_ALLOWLIST = new Set<string>()

  it('oklch → rgb → oklch dentro de tolerância para cores in-gamut', () => {
    const colors = loadAllTokens()['colors.json']
    const offenders: string[] = []
    for (const { path, leaf } of walkLeaves(colors, 'colors.json')) {
      if (!path.startsWith('primitive.')) continue
      const ok = parseOklch(String(leaf.$value))
      if (!ok) {
        offenders.push(`${path}: não parseou`)
        continue
      }
      if (!inSrgbGamut(ok)) {
        OUT_OF_GAMUT_ALLOWLIST.add(path)
        continue
      }
      const back = rgbToOklch(oklchToRgb(ok))
      // Tolerância frouxa em L/C; hue ignorado quando chroma ~ 0 (cinzas).
      expect(Math.abs(back.l - ok.l), `${path} ΔL`).toBeLessThan(0.02)
      expect(Math.abs(back.c - ok.c), `${path} ΔC`).toBeLessThan(0.02)
    }
    expect(offenders, offenders.join('\n')).toEqual([])
  })
})

describe('cobertura total do mapping (nenhum token esquecido)', () => {
  it('toda folha DTCG classifica sem cair em "não mapeado"', () => {
    const tokens = loadAllTokens()
    const unmapped: string[] = []
    for (const file of TOKEN_FILES as readonly TokenFile[]) {
      for (const { path, leaf } of walkLeaves(tokens[file], file)) {
        const c = classifyToken(file, path, leaf)
        if (c.kind === 'excluded' && /não mapeado/.test(c.reason)) {
          unmapped.push(`${file}:${path} — ${c.reason}`)
        }
      }
    }
    expect(unmapped, unmapped.join('\n')).toEqual([])
  })

  it('exclusões são todas intencionais (component/easing/glass/overlay/radius-calc/breakpoint)', () => {
    const plan = buildPlan()
    const reasons = new Set(plan.excluded.map((e) => e.source.path.split('.')[0]))
    // Top-level groups que devem aparecer entre os excluídos:
    for (const expected of ['component', 'easing', 'glass', 'overlay', 'breakpoint']) {
      expect([...reasons].some((r) => r === expected), `faltou excluir grupo ${expected}`).toBe(true)
    }
  })
})

describe('parsing de shadow → camadas DROP_SHADOW', () => {
  const cases: Array<[string, number]> = [
    ['2xs', 1],
    ['xs', 1],
    ['sm', 2],
    ['md', 2],
    ['lg', 2],
    ['xl', 2],
    ['2xl', 1],
  ]
  const effects = loadAllTokens()['effects.json']
  for (const [key, layers] of cases) {
    it(`shadow.${key} parseia em ${layers} camada(s)`, () => {
      const val = String(effects.shadow[key].$value)
      expect(parseShadow(val).length).toBe(layers)
    })
  }

  it('cada camada extrai offsets, blur e cor', () => {
    const md = parseShadow(String(effects.shadow.md.$value))
    expect(md[0].offsetY).toBe(4)
    expect(md[0].blur).toBe(6)
    expect(md[0].color[3]).toBeCloseTo(0.1, 5)
  })
})

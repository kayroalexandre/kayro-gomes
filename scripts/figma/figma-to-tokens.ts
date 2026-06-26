/* =========================================================================
   FigmaDump → merge cirúrgico nos JSON DTCG (pull).
   -------------------------------------------------------------------------
   Direção canônica: o código é a verdade. O pull importa SÓ edições de design
   deliberadas. Para cada variável do dump, comparamos o valor de exibição do
   Figma ao valor esperado a partir do token canônico em disco:
     • dentro da tolerância  → token INALTERADO (Figma não regride o código).
     • fora da tolerância    → o designer editou → reconstruímos o $value DTCG.
   Opera sobre a árvore JSON carregada, mutando apenas $value. Tokens órfãos no
   Figma (sem caminho DTCG) são reportados, nunca aplicados.
   ========================================================================= */
import { type TokenFile, getNode, isLeaf } from './dtcg'
import { aliasToRef, reverseLookup } from './mapping'
import {
  type Oklch,
  dimensionToPx,
  emToPercent,
  formatOklch,
  oklchToRgb,
  parseOklch,
  pxToRem,
  rgbDistance,
  rgbToOklch,
} from './oklch'
import type { FigmaDump, PlanValue } from './plan-types'

const COLOR_TOL = 0.012 // ~3/255 — Figma arredonda cor; abaixo disso = inalterado
const floatUnchanged = (expected: number, actual: number) =>
  Math.abs(expected - actual) <= Math.max(0.5, Math.abs(expected) * 0.01)

export type TokenTrees = Record<TokenFile, Record<string, any>>
export type Change = { file: TokenFile; path: string; from: string | number; to: string | number }
export type MergeResult = { trees: TokenTrees; changes: Change[]; orphans: string[] }

export function mergeDumpIntoTokens(dump: FigmaDump, trees: TokenTrees): MergeResult {
  const changes: Change[] = []
  const orphans: string[] = []

  for (const v of dump.variables) {
    for (const [mode, value] of Object.entries(v.valuesByMode)) {
      const target = resolveTarget(v.collection, v.name, mode)
      if (!target) {
        orphans.push(`${v.collection}/${v.name} (modo ${mode})`)
        continue
      }
      const leaf = getNode(trees[target.file], target.path)
      if (!isLeaf(leaf)) {
        orphans.push(`${v.collection}/${v.name} → ${target.file}:${target.path} (folha ausente)`)
        continue
      }
      const current = leaf.$value
      const next = reconstructValue(v.collection, current, value)
      if (next !== null && next !== current) {
        changes.push({ file: target.file, path: target.path, from: current, to: next })
        ;(leaf as { $value: string | number }).$value = next
      }
    }
  }

  return { trees, changes, orphans }
}

/** Resolve coleção/nome/modo do Figma no arquivo+caminho DTCG da folha. */
function resolveTarget(
  collection: string,
  name: string,
  mode: string,
): { file: TokenFile; path: string } | null {
  const base = reverseLookup(collection, name)
  if (!base) return null
  if (collection === 'Color') {
    const theme = mode === 'Dark' ? 'dark' : 'light'
    return { file: base.file, path: base.path.replace('@MODE', theme) }
  }
  return base
}

/**
 * Calcula o novo $value DTCG a partir do valor Figma, preservando o canônico
 * quando o Figma coincide dentro da tolerância. Retorna null se não-aplicável.
 */
function reconstructValue(
  _collection: string,
  current: string | number,
  value: PlanValue,
): string | number | null {
  // Aliases (Color/Contrast): a referência é estrutural; reconstruímos {primitive.…}.
  if (value.kind === 'alias') {
    return aliasToRef(value.name)
  }

  if (value.kind === 'color') {
    const [r, g, b, a] = value.rgba
    const curOk = parseOklch(String(current))
    if (curOk) {
      const expected = oklchToRgb(curOk)
      if (
        rgbDistance(expected, { r, g, b }) <= COLOR_TOL &&
        Math.abs((curOk.alpha ?? 1) - a) <= COLOR_TOL
      ) {
        return current // inalterado
      }
    }
    const ok = rgbToOklch({ r, g, b })
    return formatOklch({ ...ok, alpha: a } as Oklch)
  }

  if (value.kind === 'string') {
    return value.value === String(current) ? current : value.value
  }

  if (value.kind === 'float') {
    return reconstructFloat(current, value.value)
  }

  return null
}

/** Reconstrói um $value numérico/dimensional preservando a unidade e o tipo de origem. */
function reconstructFloat(current: string | number, display: number): string | number {
  const cur = String(current).trim()

  // duração/delay: "0.15s" — display em ms.
  if (/^-?[\d.]+s$/.test(cur)) {
    const expected = parseFloat(cur) * 1000
    return floatUnchanged(expected, display) ? current : `${trim(display / 1000)}s`
  }
  // rem: "0.75rem" — display em px.
  if (/rem$/.test(cur)) {
    const expected = dimensionToPx(cur)
    return expected != null && floatUnchanged(expected, display) ? current : pxToRem(display)
  }
  // px: "4px".
  if (/px$/.test(cur)) {
    const expected = dimensionToPx(cur)
    return expected != null && floatUnchanged(expected, display) ? current : `${trim(display)}px`
  }
  // em (letter-spacing): "-0.05em" — display em %.
  if (/em$/.test(cur)) {
    const expected = emToPercent(cur)
    return expected != null && floatUnchanged(expected, display)
      ? current
      : `${trim(display / 100)}em`
  }
  // número puro (string ou number): weight, line-height, alpha, z-index.
  const expected = Number(cur)
  if (floatUnchanged(expected, display)) return current
  // Preserva o tipo de origem (number 1000 vs string "400").
  return typeof current === 'number' ? trim(display) : String(trim(display))
}

const trim = (x: number) => Math.round(x * 1e6) / 1e6

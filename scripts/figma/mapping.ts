/* =========================================================================
   Spec declarativa do mapa DTCG ↔ Figma (ÚNICA fonte das regras de rename).
   -------------------------------------------------------------------------
   Classifica cada folha DTCG em: variable | textStyle | effectStyle | excluded.
   Os prefixos de codeSyntax (--background-*, --text-scale-*, --weight-*, …)
   espelham EXATAMENTE os emitidos por build-tokens.ts, garantindo que o var()
   reportado ao Dev Mode do Figma case com o var realmente presente em
   tokens.css (validado por teste).

   Decisões (ver docs/plano): camada component.* (shadcn), motion.easing,
   effects.glass/overlay, size.radius.*calc e layout.breakpoint ficam FORA das
   variáveis (code-only). Tipografia semântica → Text Styles; shadow → Effect
   Styles. Primitivos de cor entram como variáveis ocultas (aliasáveis) sem
   codeSyntax (não há --primitive-* no CSS).
   ========================================================================= */
import { type Leaf, type TokenFile, refTarget } from './dtcg'
import { dimensionToPx, emToPercent, oklchToRgb, parseOklch } from './oklch'
import type { FigmaVarType, PlanValue } from './plan-types'

export const COLLECTION_MODES: Record<string, string[]> = {
  Primitives: ['Value'],
  Color: ['Light', 'Dark'],
  Contrast: ['Absolute'],
  Typography: ['Value'],
  Motion: ['Value'],
  Size: ['Value'],
  Layout: ['Value'],
  Effects: ['Value'],
  Spacing: ['Value'],
}

/** Ordem de criação no push (dependências de alias primeiro). */
export const COLLECTION_ORDER = [
  'Primitives',
  'Color',
  'Contrast',
  'Typography',
  'Spacing',
  'Size',
  'Layout',
  'Effects',
  'Motion',
]

export const SEMANTIC_TYPE_GROUPS = [
  'body',
  'code',
  'heading',
  'subheading',
  'subtitle',
  'title-page',
  'title-hero',
]

export type VariableClass = {
  kind: 'variable'
  collection: string
  /** Nome slash-path dentro da coleção. */
  varName: string
  figmaType: FigmaVarType
  scopes: string[]
  codeSyntax?: string // valor de var() WEB; ausente p/ primitivos
  hidden?: boolean
  /** Modo ao qual ESTA folha contribui (ex. 'Light'); coleções de modo único usam o único modo. */
  mode: string
  value: PlanValue
}
export type Classification =
  | VariableClass
  | { kind: 'textStyle' }
  | { kind: 'effectStyle' }
  | { kind: 'excluded'; reason: string }

const slash = (s: string) => s.replace(/\./g, '/')
const kebab = (s: string) => s.replace(/\./g, '-')

/** Converte o alvo de uma ref DTCG de primitivo no alias Figma correspondente. */
function primitiveAlias(target: string): PlanValue {
  // target ex.: "primitive.grey.50" → Primitives / "grey/50"
  const name = slash(target.replace(/^primitive\./, ''))
  return { kind: 'alias', collection: 'Primitives', name }
}

function colorValueFromOklch(value: string): PlanValue {
  const ok = parseOklch(value)
  if (!ok) throw new Error(`Cor primitiva não-oklch: "${value}"`)
  const { r, g, b } = oklchToRgb(ok)
  return { kind: 'color', rgba: [r, g, b, ok.alpha] }
}

function semanticScopes(group: string): string[] {
  if (group === 'background') return ['FRAME_FILL', 'SHAPE_FILL']
  if (group === 'foreground') return ['TEXT_FILL']
  if (group === 'border') return ['STROKE_COLOR']
  return ['ALL_FILLS']
}

/**
 * Classifica uma folha DTCG. `path` é dotted dentro do arquivo
 * (ex. "semantic.light.background.primary").
 */
export function classifyToken(file: TokenFile, path: string, leaf: Leaf): Classification {
  const value = leaf.$value

  if (file === 'colors.json') return classifyColor(path, value)
  if (file === 'typography.json') return classifyTypography(path, value)
  if (file === 'motion.json') return classifyMotion(path, value)
  if (file === 'spacing.json') return classifySpacing(path, value)
  if (file === 'size.json') return classifySize(path, value)
  if (file === 'layout.json') return classifyLayout(path, value)
  if (file === 'effects.json') return classifyEffects(path, value)
  return { kind: 'excluded', reason: `arquivo não mapeado: ${file}` }
}

function classifyColor(path: string, value: string | number): Classification {
  if (path.startsWith('primitive.')) {
    return {
      kind: 'variable',
      collection: 'Primitives',
      varName: slash(path.replace(/^primitive\./, '')),
      figmaType: 'COLOR',
      scopes: [],
      hidden: true,
      mode: 'Value',
      value: colorValueFromOklch(String(value)),
    }
  }
  const sem = path.match(/^semantic\.(light|dark)\.(.+)$/)
  if (sem) {
    const mode = sem[1] === 'light' ? 'Light' : 'Dark'
    const rest = sem[2] // background.primary
    const group = rest.split('.')[0]
    const target = refTarget(value)
    if (!target) throw new Error(`Semântico sem ref: ${path} = ${value}`)
    return {
      kind: 'variable',
      collection: 'Color',
      varName: slash(rest),
      figmaType: 'COLOR',
      scopes: semanticScopes(group),
      codeSyntax: `var(--${kebab(rest)})`,
      mode,
      value: primitiveAlias(target),
    }
  }
  if (path.startsWith('semantic.contrast.')) {
    const name = path.replace(/^semantic\.contrast\./, '') // on-dark
    const target = refTarget(value)
    if (!target) throw new Error(`Contraste sem ref: ${path}`)
    return {
      kind: 'variable',
      collection: 'Contrast',
      varName: name,
      figmaType: 'COLOR',
      scopes: ['TEXT_FILL', 'SHAPE_FILL'],
      codeSyntax: `var(--text-${name})`,
      mode: 'Absolute',
      value: primitiveAlias(target),
    }
  }
  if (path.startsWith('component.')) {
    return { kind: 'excluded', reason: 'camada shadcn (component.*) — code-only, tokens agnósticos' }
  }
  return { kind: 'excluded', reason: `colors: caminho não mapeado: ${path}` }
}

function classifyTypography(path: string, value: string | number): Classification {
  const top = path.split('.')[0]
  if (SEMANTIC_TYPE_GROUPS.includes(top)) return { kind: 'textStyle' }

  const key = path.split('.').slice(1).join('/')
  if (top === 'family') {
    return mkVar('Typography', `family/${key}`, 'STRING', ['FONT_FAMILY'], `var(--font-${key})`, {
      kind: 'string',
      value: String(value),
    })
  }
  if (top === 'scale') {
    const px = dimensionToPx(String(value))
    return mkVar('Typography', `scale/${key}`, 'FLOAT', ['FONT_SIZE'], `var(--text-scale-${key})`, {
      kind: 'float',
      value: px ?? 0,
    })
  }
  if (top === 'weight') {
    return mkVar('Typography', `weight/${key}`, 'FLOAT', ['FONT_WEIGHT'], `var(--weight-${key})`, {
      kind: 'float',
      value: Number(value),
    })
  }
  if (top === 'line-height') {
    return mkVar(
      'Typography',
      `line-height/${key}`,
      'FLOAT',
      ['LINE_HEIGHT'],
      `var(--line-height-${key})`,
      { kind: 'float', value: Number(value) },
    )
  }
  if (top === 'letter-spacing') {
    const pct = emToPercent(String(value))
    return mkVar(
      'Typography',
      `letter-spacing/${key}`,
      'FLOAT',
      ['LETTER_SPACING'],
      `var(--letter-spacing-${key})`,
      { kind: 'float', value: pct ?? 0 },
    )
  }
  return { kind: 'excluded', reason: `typography: caminho não mapeado: ${path}` }
}

function classifyMotion(path: string, value: string | number): Classification {
  const [group, key] = path.split('.')
  if (group === 'easing') {
    return { kind: 'excluded', reason: 'motion.easing (cubic-bezier) — sem variável Figma; code-only' }
  }
  if (group === 'duration' || group === 'delay') {
    // segundos → ms (útil em prototype). Valor de exibição; canônico preserva "Ns".
    const ms = parseFloat(String(value).replace(/s$/, '')) * 1000
    return mkVar('Motion', `${group}/${key}`, 'FLOAT', [], `var(--${group}-${key})`, {
      kind: 'float',
      value: ms,
    })
  }
  return { kind: 'excluded', reason: `motion: caminho não mapeado: ${path}` }
}

function classifySpacing(path: string, value: string | number): Classification {
  if (path === 'spacing.base') {
    return mkVar('Spacing', 'base', 'FLOAT', ['GAP', 'WIDTH_HEIGHT'], 'var(--spacing)', floatPx(value))
  }
  return { kind: 'excluded', reason: `spacing: caminho não mapeado: ${path}` }
}

function classifySize(path: string, value: string | number): Classification {
  const [group, key] = path.split('.')
  if (group === 'radius') {
    if (key === 'base') {
      return mkVar('Size', 'radius/base', 'FLOAT', ['CORNER_RADIUS'], 'var(--radius)', floatPx(value))
    }
    if (key === 'none' || key === 'full') {
      return mkVar('Size', `radius/${key}`, 'FLOAT', ['CORNER_RADIUS'], `var(--radius-${key})`, floatPx(value))
    }
    return { kind: 'excluded', reason: `size.radius.${key} é calc(var(--radius)…) — code-only` }
  }
  if (group === 'icon') {
    return mkVar('Size', `icon/${key}`, 'FLOAT', ['WIDTH_HEIGHT'], `var(--icon-${key})`, floatPx(value))
  }
  if (group === 'stroke') {
    return mkVar('Size', `stroke/${key}`, 'FLOAT', ['STROKE_FLOAT'], `var(--stroke-${key})`, floatPx(value))
  }
  return { kind: 'excluded', reason: `size: caminho não mapeado: ${path}` }
}

function classifyLayout(path: string, value: string | number): Classification {
  const [group, key] = path.split('.')
  if (group === 'structure') {
    return mkVar('Layout', `structure/${key}`, 'FLOAT', ['WIDTH_HEIGHT'], `var(--${key})`, floatPx(value))
  }
  if (group === 'container') {
    return mkVar('Layout', `container/${key}`, 'FLOAT', ['GAP'], `var(--container-${key})`, floatPx(value))
  }
  if (group === 'z-index') {
    return mkVar('Layout', `z/${key}`, 'FLOAT', [], `var(--z-${key})`, {
      kind: 'float',
      value: Number(value),
    })
  }
  if (group === 'breakpoint') {
    return { kind: 'excluded', reason: 'layout.breakpoint — metadado de build, não usado em nós Figma' }
  }
  return { kind: 'excluded', reason: `layout: caminho não mapeado: ${path}` }
}

function classifyEffects(path: string, value: string | number): Classification {
  const [group, key] = path.split('.')
  if (group === 'shadow') return { kind: 'effectStyle' }
  if (group === 'blur') {
    return mkVar('Effects', `blur/${key}`, 'FLOAT', ['EFFECT_FLOAT'], `var(--blur-${key})`, floatPx(value))
  }
  if (group === 'alpha') {
    return mkVar('Effects', `alpha/${key}`, 'FLOAT', [], `var(--alpha-${key})`, {
      kind: 'float',
      value: Number(value),
    })
  }
  if (group === 'glass' || group === 'overlay') {
    return { kind: 'excluded', reason: `effects.${group} é composto (color-mix/var) — code-only` }
  }
  return { kind: 'excluded', reason: `effects: caminho não mapeado: ${path}` }
}

function floatPx(value: string | number): PlanValue {
  const px = dimensionToPx(String(value))
  return { kind: 'float', value: px ?? (Number(value) || 0) }
}

function mkVar(
  collection: string,
  varName: string,
  figmaType: FigmaVarType,
  scopes: string[],
  codeSyntax: string | undefined,
  value: PlanValue,
): VariableClass {
  return {
    kind: 'variable',
    collection,
    varName,
    figmaType,
    scopes,
    codeSyntax,
    mode: COLLECTION_MODES[collection][0],
    value,
  }
}

/* ---------------- Reverso: nome de variável Figma → caminho DTCG --------- */

/** Reconstrói o caminho DTCG (file+dotted) a partir da coleção/nome Figma. */
export function reverseLookup(collection: string, name: string): { file: TokenFile; path: string } | null {
  if (collection === 'Primitives') return { file: 'colors.json', path: `primitive.${kebabReverse(name)}` }
  if (collection === 'Contrast') return { file: 'colors.json', path: `semantic.contrast.${name}` }
  if (collection === 'Color') {
    // ambíguo entre light/dark; o caller resolve por modo. Devolve o caminho base.
    return { file: 'colors.json', path: `semantic.@MODE.${kebabReverse(name)}` }
  }
  if (collection === 'Typography') return { file: 'typography.json', path: kebabReverse(name) }
  if (collection === 'Motion') return { file: 'motion.json', path: kebabReverse(name) }
  if (collection === 'Spacing') return { file: 'spacing.json', path: `spacing.${name}` }
  if (collection === 'Size') return { file: 'size.json', path: kebabReverse(name) }
  if (collection === 'Layout') {
    const [g, k] = name.split('/')
    if (g === 'structure') return { file: 'layout.json', path: `structure.${k}` }
    if (g === 'container') return { file: 'layout.json', path: `container.${k}` }
    if (g === 'z') return { file: 'layout.json', path: `z-index.${k}` }
  }
  if (collection === 'Effects') return { file: 'effects.json', path: kebabReverse(name) }
  return null
}

const kebabReverse = (name: string) => name.replace(/\//g, '.')

/** Converte o alvo de um alias Figma (Primitives/grey/50) na ref DTCG {primitive.grey.50}. */
export function aliasToRef(aliasName: string): string {
  return `{primitive.${aliasName.replace(/\//g, '.')}}`
}

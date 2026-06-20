import fs from 'fs/promises'
import path from 'path'

/* =========================================================================
   Compilador de Design Tokens (DTCG · designtokens.org/tr/drafts/format)
   -------------------------------------------------------------------------
   Lê os JSON em src/design-system/tokens (FONTE DA VERDADE) — formato DTCG
   ($value/$type/$description, refs {grupo.token}) — e gera:

     1. src/design-system/tokens.css
          - Variáveis cruas em :root (uso direto via var(--token))
          - Cores semânticas por tema (light em :root, dark em [data-theme])
          - Grupo de contraste theme-agnóstico (--text-on-*) em :root
          - Aliases shadcn/ui (camada component de colors.json), reativos ao tema
          - Mapeamento @theme inline para Tailwind v4 nos namespaces corretos
            (--color-*, --text-*, --font-*, --font-weight-*, --leading-*,
             --tracking-*, --radius-*, --ease-*, --shadow-*, --blur-*, --breakpoint-*)
          - Utilitários compostos (@utility glass, @utility type-*)

     2. src/design-system/tokens/motion.generated.ts
          - Constantes tipadas (duration/easing/delay) p/ Framer Motion,
            derivadas de motion.json — fonte ÚNICA, sem duplicação manual.

   Desvio DTCG documentado: tokens de dimensão e sombra mantêm $value como
   STRING CSS (ex. "0.5rem", "calc(var(--radius) - 4px)", box-shadow multi-camada)
   em vez do objeto {value,unit}/composite — o Style Dictionary não faz o
   round-trip completo desse formato e o pipeline emite CSS custom properties
   onde a string É o valor literal.

   Modos:
     (sem flag)   gera os arquivos.
     --check      não escreve; falha (exit 1) se os arquivos commitados estão
                  desatualizados em relação ao gerado (guarda de CI).
     --report     imprime tokens primitivos não referenciados (higiene).
   ========================================================================= */

const TOKENS_DIR = path.resolve('src/design-system/tokens')
const OUTPUT_CSS = path.resolve('src/design-system/tokens.css')
const OUTPUT_MOTION = path.resolve('src/design-system/tokens/motion.generated.ts')

const ARGS = new Set(process.argv.slice(2))
const CHECK = ARGS.has('--check')
const REPORT = ARGS.has('--report')

type Leaf = { $value: string | number; $type?: string }
type Entry = { name: string; value: string }

const isMeta = (k: string) => k.startsWith('$')
const isLeaf = (n: unknown): n is Leaf =>
  !!n && typeof n === 'object' && '$value' in (n as Record<string, unknown>)

async function loadJSON(filename: string) {
  const content = await fs.readFile(path.join(TOKENS_DIR, filename), 'utf-8')
  return JSON.parse(content)
}

async function main() {
  console.log(CHECK ? 'Checking design tokens...' : 'Building design tokens...')

  const colors = await loadJSON('colors.json')
  const typography = await loadJSON('typography.json')
  const motion = await loadJSON('motion.json')
  const size = await loadJSON('size.json')
  const layout = await loadJSON('layout.json')
  const effects = await loadJSON('effects.json')

  // Categorias para resolver referências {categoria.path.to.token}.
  const allTokens: Record<string, any> = { colors, typography, motion, size, layout, effects }

  // ---------------------------------------------------------------------
  // Resolução de referências {category.path.to.token} (contra $value), com
  // guarda de ciclo.
  // ---------------------------------------------------------------------
  function getTokenValue(pathStr: string, seen: Set<string> = new Set()): string {
    if (seen.has(pathStr)) {
      throw new Error(`Referência circular: ${[...seen, pathStr].join(' -> ')}`)
    }
    const next = new Set(seen)
    next.add(pathStr)
    const parts = pathStr.split('.')
    for (const category of Object.keys(allTokens)) {
      let current = allTokens[category]
      let found = true
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) current = current[part]
        else {
          found = false
          break
        }
      }
      if (found && isLeaf(current)) return resolveValue(current.$value, next)
    }
    throw new Error(`Token reference not found: {${pathStr}}`)
  }

  function resolveValue(value: unknown, seen: Set<string> = new Set()): string {
    if (typeof value !== 'string') return String(value)
    return value.replace(/\{([^}]+)\}/g, (_, p) => getTokenValue(p, seen))
  }

  // ---------------------------------------------------------------------
  // Travessia $-aware. Folha = nó com $value; chaves $* são metadados.
  // Achata em pares {name (kebab por '-'), value}. Ex.: background.primary
  // -> "background-primary".
  // ---------------------------------------------------------------------
  function flatten(obj: Record<string, any>, prefix = ''): Entry[] {
    const result: Entry[] = []
    for (const [key, node] of Object.entries(obj)) {
      if (isMeta(key)) continue
      const currentKey = prefix ? `${prefix}-${key}` : key
      if (isLeaf(node)) {
        result.push({ name: currentKey, value: resolveValue(node.$value) })
      } else if (node && typeof node === 'object') {
        result.push(...flatten(node, currentKey))
      }
    }
    return result
  }

  // Mapeia um grupo raso ({ key: { $value } }) em entries, com prefixo e
  // transformação opcional de nome.
  function group(
    obj: Record<string, any>,
    prefix: string,
    nameFn: (k: string) => string = (k) => k,
  ): Entry[] {
    return Object.entries(obj)
      .filter(([k, t]) => !isMeta(k) && isLeaf(t))
      .map(([k, t]) => ({ name: `${prefix}${nameFn(k)}`, value: resolveValue((t as Leaf).$value) }))
  }

  // Ordenação determinística (numérica-aware) para diffs mínimos e --check estável.
  const sortEntries = (entries: Entry[]) =>
    [...entries].sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }))

  // Serializa entries em `--name: value;`, deduplicando e detectando conflitos.
  function decls(entries: Entry[]): string {
    const seen = new Map<string, string>()
    const out: string[] = []
    for (const { name, value } of entries) {
      if (seen.has(name)) {
        if (seen.get(name) !== value) {
          throw new Error(`Token conflict on --${name}: "${seen.get(name)}" vs "${value}"`)
        }
        continue
      }
      seen.set(name, value)
      out.push(`  --${name}: ${value};`)
    }
    return out.join('\n')
  }

  const section = (title: string, entries: Entry[]) =>
    entries.length ? `\n  /* ${title} */\n${decls(sortEntries(entries))}` : ''

  // Normaliza chaves de easing: easeIn -> in, easeInOut -> in-out, etc.
  const easeName = (k: string) =>
    k
      .replace(/^ease/, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .toLowerCase() || k.toLowerCase()

  // ---------------------------------------------------------------------
  // Pré-validação de referências (agregada): toda {ref} deve resolver.
  // ---------------------------------------------------------------------
  function collectRefs(obj: Record<string, any>, file: string, p = ''): Array<{ file: string; path: string; ref: string }> {
    const refs: Array<{ file: string; path: string; ref: string }> = []
    for (const [k, node] of Object.entries(obj)) {
      if (isMeta(k)) continue
      const np = p ? `${p}.${k}` : k
      if (isLeaf(node)) {
        if (typeof node.$value === 'string') {
          for (const m of node.$value.matchAll(/\{([^}]+)\}/g)) refs.push({ file, path: np, ref: m[1] })
        }
      } else if (node && typeof node === 'object') {
        refs.push(...collectRefs(node, file, np))
      }
    }
    return refs
  }

  const allRefs = Object.entries(allTokens).flatMap(([f, o]) => collectRefs(o, `${f}.json`, ''))
  const refErrors: string[] = []
  for (const { file, path: pth, ref } of allRefs) {
    try {
      getTokenValue(ref)
    } catch (e) {
      refErrors.push(`  ${file}:${pth} → {${ref}}  (${(e as Error).message})`)
    }
  }
  if (refErrors.length) {
    throw new Error(`Referências de token não resolvidas:\n${refErrors.join('\n')}`)
  }

  // ---------------------------------------------------------------------
  // Dimensões / escalas estruturais
  // ---------------------------------------------------------------------
  const spacingBase = resolveValue(layout.base.spacing.$value)
  const radiusBase = resolveValue(size.radius.base.$value)

  const layoutStructure = group(layout.structure, '') // --header-h / --sidebar-w / --sheet-w
  const containerEntries = group(layout.container, 'container-') // --container-padding*
  const controlEntries = group(layout.control, 'control-') // --control-height-* / --control-padding-* / --control-gap
  const spaceEntries = group(layout.space, 'space-') // --space-section-y / --space-block-gap
  const breakpointEntries = group(layout.breakpoint, 'breakpoint-')
  const iconEntries = group(size.icon, 'icon-')
  const strokeEntries = group(size.stroke, 'stroke-')
  const zIndexEntries = group(layout['z-index'], 'z-')

  // ---------------------------------------------------------------------
  // Tipografia (estrutura SDS). Primitivos + semânticos (referenciam primitivos).
  // ---------------------------------------------------------------------
  const familyEntries = group(typography.family, 'font-')
  const scaleEntries = group(typography.scale, 'text-scale-')
  const weightEntries = group(typography.weight, 'weight-')
  const lineHeightEntries = group(typography['line-height'], 'line-height-')
  const letterSpacingEntries = group(typography['letter-spacing'], 'letter-spacing-')

  const SEMANTIC_TYPE_GROUPS = [
    'body',
    'code',
    'heading',
    'subheading',
    'subtitle',
    'title-page',
    'title-hero',
  ]
  const semanticTypeEntries: Entry[] = SEMANTIC_TYPE_GROUPS.flatMap((g) => flatten(typography[g], g))

  // Motion
  const durationEntries = group(motion.duration, 'duration-')
  const easeEntries = group(motion.easing, 'ease-', easeName)
  const delayEntries = group(motion.delay, 'delay-')

  // Efeitos
  const alphaEntries = group(effects.alpha, 'alpha-')
  const glassEntries = group(effects.glass, 'glass-')
  const overlayEntries = group(effects.overlay, 'overlay-')

  // ---------------------------------------------------------------------
  // Cores
  // ---------------------------------------------------------------------
  const lightColorEntries = flatten(colors.semantic.light)
  const darkColorEntries = flatten(colors.semantic.dark)
  // Contraste theme-agnóstico: semantic.contrast.on-dark -> --text-on-dark, etc.
  const contrastEntries = group(colors.semantic.contrast, 'text-')

  // Aliases shadcn/ui (camada `component`). Cada $value é uma ref ESTRUTURAL
  // {semantic.light...}; emitimos uma var theme-reativa apontando para o NOME
  // do var semântico (não o valor), validada em light E dark.
  function hasRef(tree: any, dotted: string): boolean {
    let cur = tree
    for (const part of dotted.split('.')) {
      if (cur && typeof cur === 'object' && part in cur) cur = cur[part]
      else return false
    }
    return isLeaf(cur)
  }

  const aliasEntries: Entry[] = Object.entries(colors.component)
    .filter(([k, def]) => !isMeta(k) && isLeaf(def))
    .map(([name, def]) => {
      const ref = String((def as Leaf).$value).replace(/^\{|\}$/g, '') // semantic.light.background.brand
      const semPath = ref.replace(/^semantic\.(light|dark)\./, '') // background.brand
      if (!hasRef(colors.semantic.light, semPath)) {
        throw new Error(`Alias component "${name}" → "${semPath}" não existe em semantic.light`)
      }
      if (!hasRef(colors.semantic.dark, semPath)) {
        throw new Error(`Alias component "${name}" → "${semPath}" não existe em semantic.dark`)
      }
      return { name, value: `var(--${semPath.replace(/\./g, '-')})` }
    })

  // ---------------------------------------------------------------------
  // Mapeamentos Tailwind v4 (@theme inline) — namespaces corretos. inline =>
  // os utilitários referenciam o var() de runtime (reativo a tema).
  // ---------------------------------------------------------------------
  const themeColors: Entry[] = [
    ...lightColorEntries.map((e) => ({ name: `color-${e.name}`, value: `var(--${e.name})` })),
    ...aliasEntries.map((e) => ({ name: `color-${e.name}`, value: `var(--${e.name})` })),
  ]

  // Radius: escala (calc) vai para @theme; "base" vira o --radius cru em :root.
  const radiusScale: Entry[] = group(size.radius, 'radius-').filter((e) => e.name !== 'radius-base')

  // Utilitários text-* (font-size) com nomes semânticos curados do SDS — NÃO as
  // chaves nativas do Tailwind (xs/sm/base/lg/xl), para não colidir com cores
  // (text-<color>) nem sobrescrever line-heights padrão. Apontam para o token
  // semântico cru -> que aponta para a escala.
  const TEXT_SIZE_UTILITIES: Array<[string, string]> = [
    ['text-body-sm', 'body-size-small'],
    ['text-body', 'body-size-medium'],
    ['text-body-lg', 'body-size-large'],
    ['text-code-sm', 'code-size-small'],
    ['text-code', 'code-size-base'],
    ['text-code-lg', 'code-size-large'],
    ['text-subheading-sm', 'subheading-size-small'],
    ['text-subheading', 'subheading-size-medium'],
    ['text-subheading-lg', 'subheading-size-large'],
    ['text-heading-sm', 'heading-size-small'],
    ['text-heading', 'heading-size-base'],
    ['text-heading-lg', 'heading-size-large'],
    ['text-subtitle-sm', 'subtitle-size-small'],
    ['text-subtitle', 'subtitle-size-base'],
    ['text-subtitle-lg', 'subtitle-size-large'],
    ['text-title-sm', 'title-page-size-small'],
    ['text-title', 'title-page-size-base'],
    ['text-title-lg', 'title-page-size-large'],
    ['text-title-hero', 'title-hero-size'],
  ]
  const themeText: Entry[] = TEXT_SIZE_UTILITIES.map(([name, ref]) => ({ name, value: `var(--${ref})` }))
  const themeWeight: Entry[] = weightEntries.map((e) => ({
    name: `font-weight-${e.name.replace(/^weight-/, '')}`,
    value: `var(--${e.name})`,
  }))
  const themeFont: Entry[] = familyEntries.map((e) => ({ name: e.name, value: `var(--${e.name})` }))
  const themeLeading: Entry[] = lineHeightEntries.map((e) => ({
    name: `leading-${e.name.replace(/^line-height-/, '')}`,
    value: `var(--${e.name})`,
  }))
  const themeTracking: Entry[] = letterSpacingEntries.map((e) => ({
    name: `tracking-${e.name.replace(/^letter-spacing-/, '')}`,
    value: `var(--${e.name})`,
  }))
  const themeEase: Entry[] = easeEntries.map((e) => ({ name: e.name, value: `var(--${e.name})` }))
  const themeShadow: Entry[] = group(effects.shadow, 'shadow-')
  const themeBlur: Entry[] = group(effects.blur, 'blur-')

  // Contraste sobre mídia: expõe os tokens theme-agnósticos (--text-on-*) como
  // cores Tailwind (--color-on-*), habilitando text-on-dark / bg-on-dark-subtle /
  // border-on-light para texto e superfícies sobre imagem/vídeo (C2 do design).
  const themeContrast: Entry[] = contrastEntries.map((e) => ({
    name: `color-${e.name.replace(/^text-/, '')}`,
    value: `var(--${e.name})`,
  }))

  // ---------------------------------------------------------------------
  // Montagem do CSS
  // ---------------------------------------------------------------------
  const root = [
    section('Spacing (base — Tailwind v4 deriva a escala)', [{ name: 'spacing', value: spacingBase }]),
    section('Radius (base shadcn)', [{ name: 'radius', value: radiusBase }]),
    section('Layout — Chrome', layoutStructure),
    section('Layout — Container', containerEntries),
    section('Layout — Control (button/input/select…)', controlEntries),
    section('Layout — Spacing rhythm (section/block)', spaceEntries),
    section('Breakpoints', breakpointEntries),
    section('Icon Sizes', iconEntries),
    section('Stroke Widths', strokeEntries),
    section('Z-Index (layering)', zIndexEntries),
    section('Font Families', familyEntries),
    section('Font Weights', weightEntries),
    section('Type Scale (primitivos SDS, rem)', scaleEntries),
    section('Line Height', lineHeightEntries),
    section('Letter Spacing', letterSpacingEntries),
    section('Typography — Semantic (body, heading, …) → referencia primitivos', semanticTypeEntries),
    section('Motion — Duration', durationEntries),
    section('Motion — Easing', easeEntries),
    section('Motion — Delay', delayEntries),
    section('Effects — Alpha', alphaEntries),
    section('Effects — Glass (composto)', glassEntries),
    section('Effects — Overlay (composto)', overlayEntries),
    section('Light Theme Semantic Colors', lightColorEntries),
    section('Contrast (theme-agnóstico — usado por contrast.ts)', contrastEntries),
    section('shadcn/ui + Tailwind aliases (reativos ao tema, definidos uma vez)', aliasEntries),
  ].join('\n')

  const dark = section('Dark Theme Semantic Colors', darkColorEntries)

  const theme = [
    section('Colors — semantic + aliases', themeColors),
    section('Contrast over media (on-dark / on-light)', themeContrast),
    section('Radius scale', radiusScale),
    section('Font Families', themeFont),
    section('Font Weights', themeWeight),
    section('Font Sizes (text-*)', themeText),
    section('Line Height (leading-*)', themeLeading),
    section('Letter Spacing (tracking-*)', themeTracking),
    section('Easing (ease-*)', themeEase),
    section('Shadows (shadow-*)', themeShadow),
    section('Blur (blur-*)', themeBlur),
    section('Breakpoints', breakpointEntries),
    section('Animations', [{ name: 'animate-scroll-dot', value: 'scroll-dot 2s ease-in-out infinite' }]),
  ].join('\n')

  // Utilitário glass: fundo translúcido + desfoque do conteúdo atrás. Semântica
  // ABERTA (qualquer componente via class="glass"); tunável só pelos tokens
  // effects.glass.
  const glassUtility = `@utility glass {
  background-color: var(--glass-bg);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
}`

  // Anel de foco acessível e componível: tokeniza a espessura (size.json:
  // stroke.focus-ring) e a cor (--ring semântico, reativo ao tema). Aplicar via
  // variante, ex.: focus-visible:focus-ring. Espelha a regra global :focus-visible
  // de globals.css, agora sem o literal 2px. Os primitivos shadcn (button/input/…)
  // mantêm sua própria receita inline (ring-4/outline-1) — este utilitário é para
  // elementos custom (skip-link, navegação, CTAs).
  const focusRingUtility = `@utility focus-ring {
  outline: var(--stroke-focus-ring) solid var(--ring);
  outline-offset: var(--stroke-focus-ring);
}`

  // Estilos de texto compostos (recipes) — "type styles" do SDS. Cada type-*
  // aplica família + peso + tamanho + line-height + letter-spacing de uma vez.
  const TYPE_RECIPES: Array<{
    util: string
    family: string
    weight: string
    size: string
    lineHeight: string
    letterSpacing: string
  }> = [
    { util: 'title-hero',  family: 'title-hero-font-family',  weight: 'title-hero-font-weight',   size: 'title-hero-size',        lineHeight: 'title-hero-line-height',  letterSpacing: 'title-hero-letter-spacing' },
    { util: 'title',       family: 'title-page-font-family',  weight: 'title-page-font-weight',   size: 'title-page-size-base',   lineHeight: 'title-page-line-height',  letterSpacing: 'title-page-letter-spacing' },
    { util: 'subtitle',    family: 'subtitle-font-family',    weight: 'subtitle-font-weight',     size: 'subtitle-size-base',     lineHeight: 'subtitle-line-height',    letterSpacing: 'subtitle-letter-spacing' },
    { util: 'heading',     family: 'heading-font-family',     weight: 'heading-font-weight',      size: 'heading-size-base',      lineHeight: 'heading-line-height',     letterSpacing: 'heading-letter-spacing' },
    { util: 'subheading',  family: 'subheading-font-family',  weight: 'subheading-font-weight',   size: 'subheading-size-medium', lineHeight: 'subheading-line-height',  letterSpacing: 'subheading-letter-spacing' },
    { util: 'body-large',  family: 'body-font-family',        weight: 'body-font-weight-regular', size: 'body-size-large',        lineHeight: 'body-line-height-relaxed', letterSpacing: 'body-letter-spacing' },
    { util: 'body',        family: 'body-font-family',        weight: 'body-font-weight-regular', size: 'body-size-medium',       lineHeight: 'body-line-height',        letterSpacing: 'body-letter-spacing' },
    { util: 'body-strong', family: 'body-font-family',        weight: 'body-font-weight-strong',  size: 'body-size-medium',       lineHeight: 'body-line-height',        letterSpacing: 'body-letter-spacing' },
    { util: 'body-small',  family: 'body-font-family',        weight: 'body-font-weight-regular', size: 'body-size-small',        lineHeight: 'body-line-height',        letterSpacing: 'body-letter-spacing' },
    { util: 'code',        family: 'code-font-family',        weight: 'code-font-weight',         size: 'code-size-base',         lineHeight: 'code-line-height',        letterSpacing: 'code-letter-spacing' },
  ]
  const typeUtilities = TYPE_RECIPES.map(
    (r) => `@utility type-${r.util} {
  font-family: var(--${r.family});
  font-weight: var(--${r.weight});
  font-size: var(--${r.size});
  line-height: var(--${r.lineHeight});
  letter-spacing: var(--${r.letterSpacing});
}`,
  ).join('\n\n')

  const utilities = `${glassUtility}\n\n${focusRingUtility}\n\n${typeUtilities}`

  const cssOutput = `/* =========================================================================
   ESTE ARQUIVO É GERADO AUTOMATICAMENTE POR scripts/build-tokens.ts.
   NÃO O EDITE DIRETAMENTE. TODAS AS ALTERAÇÕES DEVEM SER NO JSON DOS TOKENS.
   ========================================================================= */

:root {${root}
}

[data-theme='dark'] {${dark}
}

@theme inline {${theme}
}

${utilities}
`

  // ---------------------------------------------------------------------
  // Guarda de órfãos: vars que consumidores externos LEEM e que o build DEVE
  // emitir. Teria pego os bugs --text-on-* (contrast.ts) e --overlay-* (hero).
  // ---------------------------------------------------------------------
  const REQUIRED_VARS = [
    'text-on-dark', 'text-on-dark-muted', 'text-on-dark-subtle',
    'text-on-light', 'text-on-light-muted', 'text-on-light-subtle',
    'overlay-dark', 'overlay-fade',
    'header-h',
    'icon-sm', 'icon-md', 'icon-lg', 'icon-xl', 'icon-2xl',
    'background', 'foreground', 'primary', 'border', 'ring', 'stroke-focus-ring',
    'radius', 'spacing', 'font-sans', 'font-mono',
  ]
  const missing = REQUIRED_VARS.filter((v) => !cssOutput.includes(`--${v}:`))
  if (missing.length) {
    throw new Error(`Vars obrigatórias ausentes (órfãs p/ consumidores): ${missing.join(', ')}`)
  }

  // ---------------------------------------------------------------------
  // motion.generated.ts — constantes tipadas a partir de motion.json.
  // ---------------------------------------------------------------------
  const jsKey = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k))
  const toSeconds = (v: string | number) => Number(String(v).replace(/s$/, ''))
  const toBezier = (v: string | number) => {
    const m = String(v).match(/cubic-bezier\(([^)]+)\)/)
    if (!m) return JSON.stringify(String(v)) // 'linear'
    return `[${m[1].split(',').map((s) => Number(s.trim())).join(', ')}]`
  }
  const motionBlock = (obj: Record<string, any>, fmt: (v: string | number) => string | number) =>
    Object.entries(obj)
      .filter(([k, t]) => !isMeta(k) && isLeaf(t))
      .map(([k, t]) => `  ${jsKey(k)}: ${fmt((t as Leaf).$value)},`)
      .join('\n')

  const motionGenerated = `/* =========================================================================
   GERADO AUTOMATICAMENTE por scripts/build-tokens.ts a partir de motion.json.
   NÃO EDITAR. Fonte da verdade: src/design-system/tokens/motion.json
   ========================================================================= */

export const duration = {
${motionBlock(motion.duration, toSeconds)}
} as const

export const easing = {
${motionBlock(motion.easing, toBezier)}
} as const

export const delay = {
${motionBlock(motion.delay, toSeconds)}
} as const

export type DurationToken = keyof typeof duration
export type EasingToken = keyof typeof easing
export type DelayToken = keyof typeof delay
`

  // ---------------------------------------------------------------------
  // Relatório opcional de higiene (--report): primitivos não referenciados.
  // ---------------------------------------------------------------------
  if (REPORT) {
    const referenced = new Set(allRefs.map((r) => r.ref))
    const unused: string[] = []
    const walk = (obj: Record<string, any>, p = '') => {
      for (const [k, node] of Object.entries(obj)) {
        if (isMeta(k)) continue
        const np = p ? `${p}.${k}` : k
        if (isLeaf(node)) {
          if (!referenced.has(np)) unused.push(np)
        } else if (node && typeof node === 'object') walk(node, np)
      }
    }
    walk(colors.primitive, 'primitive')
    if (unused.length) {
      console.warn(`[design-tokens] ${unused.length} primitivos de cor não referenciados:\n  ${unused.join(', ')}`)
    } else {
      console.warn('[design-tokens] todos os primitivos de cor estão referenciados.')
    }
  }

  // ---------------------------------------------------------------------
  // Escrita / verificação
  // ---------------------------------------------------------------------
  async function emit(file: string, content: string) {
    if (CHECK) {
      const cur = await fs.readFile(file, 'utf-8').catch(() => null)
      if (cur !== content) {
        console.error(`✗ desatualizado: ${path.relative(process.cwd(), file)}`)
        process.exitCode = 1
      }
    } else {
      await fs.mkdir(path.dirname(file), { recursive: true })
      await fs.writeFile(file, content, 'utf-8')
    }
  }

  await emit(OUTPUT_CSS, cssOutput)
  await emit(OUTPUT_MOTION, motionGenerated)

  if (CHECK) {
    if (process.exitCode === 1) {
      console.error('Rode `bun run design:build` e commite as mudanças geradas.')
    } else {
      console.log('✓ Design tokens estão atualizados.')
    }
  } else {
    console.log(`✓ Design tokens compilados:\n  ${path.relative(process.cwd(), OUTPUT_CSS)}\n  ${path.relative(process.cwd(), OUTPUT_MOTION)}`)
  }
}

main().catch((err) => {
  console.error('Falha ao compilar design tokens:', err)
  process.exit(1)
})

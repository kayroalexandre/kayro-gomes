import fs from 'fs/promises'
import path from 'path'

/* =========================================================================
   Linter de Design Tokens (guard-rail anti-hardcode)
   -------------------------------------------------------------------------
   Varre o código de CONSUMO (arquivos .ts/.tsx/.css em src/) procurando valores que
   deveriam vir do design system em vez de literais soltos. Complementa o
   build-tokens.ts: aquele garante que os tokens são coerentes; este garante
   que o código realmente os USA.

   Calibração ESTRITA (após tokenização completa do código de consumo):
     - cor literal (#hex, rgb/rgba/hsl/hsla/oklch/oklab)  → ERROR (bloqueia CI)
     - bezier literal (cubic-bezier(...), array de easing) → ERROR (preventivo)
     - dimensão solta (rounded-[Npx], text-[Npx], border-radius/letter-spacing
       literais em CSS)                                    → ERROR (exceções via disable inline)

   `max-w-[*rem]` e afins (medida de leitura) NÃO são sinalizados: largura de
   linha é semântica de layout, não falta de token.

   Arquivos de infraestrutura/gerados ficam na allowlist — em especial
   utilities/contrast.ts, que LEGITIMAMENTE parseia rgb()/oklch() (é o motor
   de contraste do próprio design system).

   Escape pontual: `// design-lint-disable-line <motivo>` na própria linha.

   Modos:
     (sem flag)  varre e reporta; sai com código 1 se houver ERROR.
     --check     idem (semântica de CI); apenas ajusta a verbosidade final.
   ========================================================================= */

export type Severity = 'error' | 'warning'

export type Violation = {
  file: string
  line: number
  column: number
  rule: string
  severity: Severity
  match: string
  message: string
}

// Arquivos/diretórios isentos: gerados, fonte de tokens, tipos do Payload,
// migrações e o parser de cor (contrast.ts).
const FILE_ALLOWLIST = [
  'src/design-system/tokens.css',
  'src/design-system/tokens/',
  'src/payload-types.ts',
  'src/migrations/',
  'src/utilities/contrast.ts',
]

export function isAllowlistedFile(filePath: string): boolean {
  const p = filePath.replace(/\\/g, '/')
  return FILE_ALLOWLIST.some((a) => p === a || p.includes(a))
}

const langOf = (filePath: string): 'css' | 'ts' => (/\.css$/.test(filePath) ? 'css' : 'ts')

// Remove comentários preservando contagem de linhas e colunas (troca os chars
// por espaço). Em .ts/.tsx também remove `// ...`, sem confundir com `://`.
function stripComments(content: string, lang: 'css' | 'ts'): string {
  let out = content.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
  if (lang === 'ts') {
    out = out
      .split('\n')
      .map((line) => line.replace(/(?<!:)\/\/.*$/, (m) => ' '.repeat(m.length)))
      .join('\n')
  }
  return out
}

type Hit = { index: number; match: string }

// --- Detectores (operam sobre uma linha já sem comentários) -----------------

const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g
const COLOR_FN = /\b(?:rgba?|hsla?|oklch|oklab)\s*\(/gi

function findColors(line: string): Hit[] {
  const hits: Hit[] = []
  for (const m of line.matchAll(HEX)) hits.push({ index: m.index ?? 0, match: m[0] })
  for (const m of line.matchAll(COLOR_FN)) hits.push({ index: m.index ?? 0, match: m[0] })
  return hits
}

const CUBIC = /\bcubic-bezier\s*\(/gi
const ARR4 = /\[\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*,\s*(-?\d*\.?\d+)\s*\]/g
const EASE_CTX = /eas(?:e|ing)/i

function findBeziers(line: string, lang: 'css' | 'ts'): Hit[] {
  const hits: Hit[] = []
  for (const m of line.matchAll(CUBIC)) hits.push({ index: m.index ?? 0, match: m[0] })
  // Array de easing (Framer): só conta se a linha fala de easing E a forma é
  // plausível (pontos de controle x1/x2 ∈ [0,1]) — evita arrays genéricos.
  if (lang === 'ts' && EASE_CTX.test(line)) {
    for (const m of line.matchAll(ARR4)) {
      const x1 = Number.parseFloat(m[1])
      const x2 = Number.parseFloat(m[3])
      if (x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1) hits.push({ index: m.index ?? 0, match: m[0] })
    }
  }
  return hits
}

// Apenas radius e font-size arbitrários (têm escala dedicada). Larguras de
// medida (max-w/min-w/…) ficam de fora de propósito.
const TW_RADIUS = /\brounded(?:-[a-z]+)?-\[\s*[\d.]+(?:px|rem|em)\s*\]/g
const TW_TEXT = /\btext-\[\s*[\d.]+(?:px|rem|em)\s*\]/g
const CSS_DIM_PROP = /\b(border-radius|letter-spacing)\s*:\s*([^;}\n]+)/gi
const CSS_LITERAL = /-?[\d.]+(?:px|rem|em)\b/

function findDimensions(line: string, lang: 'css' | 'ts'): Hit[] {
  const hits: Hit[] = []
  if (lang === 'ts') {
    for (const m of line.matchAll(TW_RADIUS)) hits.push({ index: m.index ?? 0, match: m[0] })
    for (const m of line.matchAll(TW_TEXT)) hits.push({ index: m.index ?? 0, match: m[0] })
  } else {
    for (const m of line.matchAll(CSS_DIM_PROP)) {
      const value = m[2]
      const lit = value.match(CSS_LITERAL)
      if (lit) {
        hits.push({ index: (m.index ?? 0) + m[0].indexOf(lit[0]), match: `${m[1]}: ${lit[0]}` })
      }
    }
  }
  return hits
}

const MESSAGES: Record<string, (match: string) => string> = {
  'no-literal-color': (m) =>
    `cor literal "${m}" — use um token de cor (var(--…) ou classe Tailwind como text-foreground/bg-primary).`,
  'no-literal-bezier': (m) =>
    `bezier literal "${m}" — importe easing.* de @/design-system/tokens/motion ou use a CSS var --ease-*.`,
  'no-literal-dimension': (m) =>
    `dimensão literal "${m}" — use a escala (rounded-sm/var(--radius-*), text-body/var(--text-*), var(--letter-spacing-*)).`,
}

const RULE_SEVERITY: Record<string, Severity> = {
  'no-literal-color': 'error',
  'no-literal-bezier': 'error',
  'no-literal-dimension': 'error',
}

/**
 * Núcleo puro do linter: recebe caminho (para a allowlist) + conteúdo, devolve
 * as violações. Sem I/O, totalmente determinístico (testável com strings).
 */
export function lintContent(filePath: string, content: string): Violation[] {
  if (isAllowlistedFile(filePath)) return []

  const lang = langOf(filePath)

  // Linhas com escape explícito (lido do conteúdo ORIGINAL, antes do strip).
  const disabled = new Set<number>()
  content.split('\n').forEach((line, i) => {
    if (line.includes('design-lint-disable-line')) disabled.add(i + 1)
  })

  const stripped = stripComments(content, lang)
  const violations: Violation[] = []

  stripped.split('\n').forEach((line, i) => {
    const lineNo = i + 1
    if (disabled.has(lineNo)) return

    const push = (rule: string, hit: Hit) =>
      violations.push({
        file: filePath,
        line: lineNo,
        column: hit.index + 1,
        rule,
        severity: RULE_SEVERITY[rule],
        match: hit.match,
        message: MESSAGES[rule](hit.match),
      })

    for (const hit of findColors(line)) push('no-literal-color', hit)
    for (const hit of findBeziers(line, lang)) push('no-literal-bezier', hit)
    for (const hit of findDimensions(line, lang)) push('no-literal-dimension', hit)
  })

  return violations
}

// --- Runner -----------------------------------------------------------------

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(full)))
    else if (/\.(ts|tsx|css)$/.test(entry.name)) files.push(full)
  }
  return files
}

async function main() {
  const check = process.argv.includes('--check')
  console.log(check ? 'Checando design tokens em uso...' : 'Lintando design tokens em uso...')

  const root = path.resolve('src')
  const files = (await walk(root)).sort()
  const all: Violation[] = []
  for (const file of files) {
    const rel = path.relative(process.cwd(), file).replace(/\\/g, '/')
    const content = await fs.readFile(file, 'utf-8')
    all.push(...lintContent(rel, content))
  }

  const errors = all.filter((v) => v.severity === 'error')
  const warnings = all.filter((v) => v.severity === 'warning')

  const byFile = new Map<string, Violation[]>()
  for (const v of all) {
    if (!byFile.has(v.file)) byFile.set(v.file, [])
    byFile.get(v.file)!.push(v)
  }
  for (const [file, vs] of [...byFile.entries()].sort()) {
    console.log(`\n${file}`)
    for (const v of vs.sort((a, b) => a.line - b.line || a.column - b.column)) {
      const tag = v.severity === 'error' ? 'error  ' : 'warning'
      const loc = `${String(v.line)}:${String(v.column)}`.padEnd(8)
      console.log(`  ${loc} ${tag}  ${v.rule.padEnd(20)} ${v.message}`)
    }
  }

  console.log(`\n${errors.length} erro(s), ${warnings.length} aviso(s) em ${byFile.size} arquivo(s).`)
  if (errors.length) {
    console.error(
      `\n✗ ${errors.length} erro(s) de token bloqueiam o CI. Tokenize ou justifique com \`// design-lint-disable-line\`.`,
    )
    process.exitCode = 1
  } else {
    console.log('\n✓ Sem erros de token (avisos não bloqueiam o CI).')
  }
}

// Só executa quando é o entrypoint (Bun define import.meta.main); ao ser
// importado pelos testes (Vitest), permanece como biblioteca pura.
if ((import.meta as { main?: boolean }).main) {
  main().catch((err) => {
    console.error('Falha ao lintar design tokens:', err)
    process.exit(1)
  })
}

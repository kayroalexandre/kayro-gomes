# Frente C1 — Regras `no-raw-typography` + `no-raw-color` (warning) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar duas regras de `warning` ao linter anti-hardcode (`scripts/lint-tokens.ts`) que detectam tipografia crua (escala de tamanho do Tailwind) e cor crua (paleta do Tailwind) no código `.tsx`, calibradas para **não** sinalizar o vocabulário semântico do projeto.

**Architecture:** Estende o núcleo puro `lintContent`. Dois novos detectores por regex (`findRawTypography`, `findRawColor`), entradas em `MESSAGES` e `RULE_SEVERITY` (severidade `warning`), e chamadas no laço de `lintContent` (apenas `lang === 'ts'`). Severidade `warning` **não bloqueia o CI** (o runner só seta `exitCode` para erros) — as ~95 ocorrências atuais viram a lista que guia a refatoração de componentes.

**Tech Stack:** TypeScript (Bun), Vitest. O linter é uma função pura testável com strings.

## Global Constraints

- **Severidade `warning`** para ambas as regras — elas **não** podem fazer o CI falhar. Confirmado pelo runner: `process.exitCode = 1` só `if (errors.length)`.
- **Decisão de escopo (aprovada):** `no-raw-typography` barra **apenas tamanho** (`text-xs..9xl`). **Peso NÃO é barrado** — `font-*` já é token-backed (`--font-weight-*`) neste projeto e o `docs/DESIGN-SYSTEM.md` o endossa como escape. Um teste negativo trava isso (`font-bold`/`font-medium` não sinalizados).
- **Calibração anti-falso-positivo:** não sinalizar utilitários **semânticos** (`text-foreground`, `text-muted-foreground`, `text-on-dark*`, `bg-card`, `bg-background-inverse`, `text-body`, `text-heading-lg`, `text-title-hero`, `border-border`, `ring-ring`, etc.). As regex miram **só** a escala/paleta nativa do Tailwind.
- **Não corrigir as ocorrências** existentes neste PR (isso é o PR 5 + refatoração). O `bun run lint:tokens` passará a imprimir warnings — **isso é esperado e correto**; ele continua saindo com código 0.
- Respeitar o escape `// design-lint-disable-line <motivo>` e a `FILE_ALLOWLIST` (já centralizados em `lintContent` — os detectores novos não precisam tratar isso).
- **Branch `develop`.** Conventional Commits pt-BR; tipo `feat(design-system)`.
- **Gate:** `bun run design:check && bunx tsc --noEmit && bun run lint && bun run test:int` verdes; `bun run lint:tokens` com **0 erros** (warnings novos OK).

---

### Task 1: Duas regras `warning` no linter + testes

**Files:**
- Modify: `scripts/lint-tokens.ts` (regex + detectores + `MESSAGES` + `RULE_SEVERITY` + chamadas em `lintContent`)
- Test: `tests/int/lint-tokens.int.spec.ts` (novos `describe` de positivos/negativos)

**Interfaces:**
- Consumes: o núcleo `lintContent(filePath, content): Violation[]` e os tipos `Hit = { index: number; match: string }`, `Severity = 'error' | 'warning'`. O laço de `lintContent` já aplica `disabled` (escape) e `isAllowlistedFile`. `langOf` retorna `'ts'` para `.ts`/`.tsx` e `'css'` para `.css`.
- Produces: duas regras novas `no-raw-typography` e `no-raw-color` (severidade `warning`), ativas apenas em `lang === 'ts'`.

- [ ] **Step 1: Escrever os testes que falham (positivos) + travas (negativos)**

Acrescente ao final de `tests/int/lint-tokens.int.spec.ts`:

```ts
describe('lintContent — tipografia crua (warning, só tamanho)', () => {
  it('sinaliza text-5xl como warning', () => {
    const vs = lintContent('src/heros/Foo.tsx', `<h1 className="text-5xl font-bold">`)
    expect(rules(vs)).toContain('no-raw-typography')
    expect(bySeverity(vs, 'warning').map((v) => v.rule)).toContain('no-raw-typography')
    expect(bySeverity(vs, 'error')).toHaveLength(0)
  })

  it('sinaliza text-sm e text-2xl', () => {
    const vs = lintContent('src/components/Foo.tsx', `className="text-sm"`)
    expect(rules(vs)).toContain('no-raw-typography')
    const vs2 = lintContent('src/components/Foo.tsx', `className="text-2xl"`)
    expect(rules(vs2)).toContain('no-raw-typography')
  })

  it('NÃO sinaliza peso (font-bold/font-medium são token-backed)', () => {
    const vs = lintContent('src/components/Foo.tsx', `className="font-bold font-medium font-extra-bold"`)
    expect(rules(vs)).not.toContain('no-raw-typography')
  })

  it('NÃO sinaliza tamanhos semânticos (text-body/text-heading-lg/text-title-hero)', () => {
    const vs = lintContent(
      'src/components/Foo.tsx',
      `className="text-body text-heading-lg text-title-hero text-subheading-sm text-code"`,
    )
    expect(rules(vs)).not.toContain('no-raw-typography')
  })

  it('NÃO sinaliza utilitário de cor text-foreground', () => {
    const vs = lintContent('src/components/Foo.tsx', `className="text-foreground"`)
    expect(rules(vs)).not.toContain('no-raw-typography')
  })

  it('respeita o disable inline', () => {
    const vs = lintContent(
      'src/heros/Foo.tsx',
      `className="text-5xl" // design-lint-disable-line hero calibrado`,
    )
    expect(vs).toHaveLength(0)
  })

  it('não roda em .css (escala de tamanho é conceito de classe tsx)', () => {
    const vs = lintContent('src/app/(frontend)/globals.css', `.x { content: "text-5xl"; }`)
    expect(rules(vs)).not.toContain('no-raw-typography')
  })
})

describe('lintContent — cor crua (warning)', () => {
  it('sinaliza text-white como warning', () => {
    const vs = lintContent('src/components/Foo.tsx', `className="text-white"`)
    expect(rules(vs)).toContain('no-raw-color')
    expect(bySeverity(vs, 'warning').map((v) => v.rule)).toContain('no-raw-color')
    expect(bySeverity(vs, 'error')).toHaveLength(0)
  })

  it('sinaliza bg-gray-500, text-red-500, border-zinc-200', () => {
    for (const cls of ['bg-gray-500', 'text-red-500', 'border-zinc-200']) {
      const vs = lintContent('src/components/Foo.tsx', `className="${cls}"`)
      expect(rules(vs), cls).toContain('no-raw-color')
    }
  })

  it('sinaliza text-white/60 (com opacidade)', () => {
    const vs = lintContent('src/components/ui/scroll-indicator.tsx', `className="text-white/60"`)
    expect(rules(vs)).toContain('no-raw-color')
    expect(vs.find((v) => v.rule === 'no-raw-color')?.match).toBe('text-white')
  })

  it('NÃO sinaliza tokens semânticos (foreground/card/muted/on-dark/inverse/border/ring)', () => {
    const vs = lintContent(
      'src/components/Foo.tsx',
      `className="text-foreground bg-card text-muted-foreground text-on-dark-subtle bg-background-inverse border-border ring-ring"`,
    )
    expect(rules(vs)).not.toContain('no-raw-color')
  })

  it('NÃO confunde prefixo to/from semânticos nem palavras (auto-rows, from-background)', () => {
    const vs = lintContent('src/components/Foo.tsx', `className="auto-rows-min from-background to-card"`)
    expect(rules(vs)).not.toContain('no-raw-color')
  })

  it('respeita o disable inline (caso intencional sobre mídia)', () => {
    const vs = lintContent(
      'src/components/AdminBar/index.tsx',
      `className="bg-black text-white" // design-lint-disable-line chrome fixo do admin`,
    )
    expect(vs).toHaveLength(0)
  })

  it('não roda em .css (paleta crua em css já é pega por no-literal-color)', () => {
    const vs = lintContent('src/app/(frontend)/globals.css', `.x { content: "bg-red-500"; }`)
    expect(rules(vs)).not.toContain('no-raw-color')
  })
})
```

- [ ] **Step 2: Rodar os testes e confirmar que os positivos falham**

Run: `bun run test:int tests/int/lint-tokens.int.spec.ts -t "crua"`
Expected: FAIL nos positivos (`text-5xl`, `text-white`, …) — as regras ainda não existem. (Os negativos já passam porque nada sinaliza.)

- [ ] **Step 3: Implementar os detectores em `scripts/lint-tokens.ts`**

**(a)** Logo após o bloco de `findDimensions` (depois da função e suas constantes `TW_RADIUS`/`TW_TEXT`/`CSS_DIM_PROP`/`CSS_LITERAL`), adicione:

```ts
// no-raw-typography (warning): escala de TAMANHO crua do Tailwind, que fura a
// escala semântica (--text-body/--text-heading/…). text-[Npx] já é pego por
// no-literal-dimension. PESO fica de fora de propósito: font-* é token-backed
// (--font-weight-*) e é escape legítimo (ver docs/DESIGN-SYSTEM.md).
const TW_RAW_TEXT_SIZE = /\btext-(?:xs|sm|base|lg|[2-9]?xl)(?![\w-])/g

function findRawTypography(line: string, lang: 'css' | 'ts'): Hit[] {
  if (lang !== 'ts') return []
  const hits: Hit[] = []
  for (const m of line.matchAll(TW_RAW_TEXT_SIZE)) hits.push({ index: m.index ?? 0, match: m[0] })
  return hits
}

// no-raw-color (warning): classes de PALETA crua do Tailwind (text-white,
// bg-gray-500…). Mira só os nomes nativos da paleta — os tokens semânticos
// (foreground/card/primary/on-dark*/background-inverse/border/ring…) NÃO estão
// nessa lista, então não casam. A sombra opcional cobre 50/100–900/950.
const TW_PALETTE =
  'white|black|gray|grey|zinc|slate|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose'
const TW_RAW_COLOR = new RegExp(
  `\\b(?:text|bg|border|ring|outline|fill|stroke|from|via|to|divide|placeholder)-(?:${TW_PALETTE})(?:-(?:950|[1-9]00|50))?(?![\\w-])`,
  'g',
)

function findRawColor(line: string, lang: 'css' | 'ts'): Hit[] {
  if (lang !== 'ts') return []
  const hits: Hit[] = []
  for (const m of line.matchAll(TW_RAW_COLOR)) hits.push({ index: m.index ?? 0, match: m[0] })
  return hits
}
```

**(b)** Em `MESSAGES`, adicione as duas mensagens (após `no-literal-dimension`):

```ts
  'no-raw-typography': (m) =>
    `tipografia crua "${m}" — use uma receita type-* ou um utilitário semântico de tamanho (text-body/text-heading/…).`,
  'no-raw-color': (m) =>
    `cor crua "${m}" — use um token semântico (text-foreground/bg-card/…), de contraste (text-on-dark*) ou superfície invertida (bg-background-inverse).`,
```

**(c)** Em `RULE_SEVERITY`, adicione as duas regras como `warning`:

```ts
  'no-raw-typography': 'warning',
  'no-raw-color': 'warning',
```

**(d)** No laço de `lintContent`, logo após
`for (const hit of findDimensions(line, lang)) push('no-literal-dimension', hit)`,
adicione:

```ts
    for (const hit of findRawTypography(line, lang)) push('no-raw-typography', hit)
    for (const hit of findRawColor(line, lang)) push('no-raw-color', hit)
```

- [ ] **Step 4: Rodar os testes e confirmar GREEN**

Run: `bun run test:int tests/int/lint-tokens.int.spec.ts`
Expected: PASS em todos (positivos sinalizam como `warning`; negativos seguem limpos).

- [ ] **Step 5: Verificar o comportamento no código real (warnings, 0 erros)**

Run: `bun run lint:tokens`
Expected: imprime os **warnings** novos (tipografia/cor crua nos componentes) e termina com `✓ Sem erros de token (avisos não bloqueiam o CI).` e **código de saída 0**. NÃO corrija os warnings — eles são a lista-guia da refatoração.

- [ ] **Step 6: Gate completo**

Run: `bun run design:check && bunx tsc --noEmit && bun run lint && bun run test:int`
Expected: todos verdes. (O `bun run lint` é o ESLint do projeto, não o linter de tokens — não afetado.)

- [ ] **Step 7: Commit**

```bash
git add scripts/lint-tokens.ts tests/int/lint-tokens.int.spec.ts
git commit -m "feat(design-system): regras no-raw-typography/no-raw-color (warning) no linter

Duas regras de aviso no lint-tokens.ts que detectam tipografia crua (escala de
tamanho nativa do Tailwind, text-xs..9xl) e cor crua (paleta nativa). Severidade
warning: guiam a refatoração de componentes sem bloquear o CI. Calibradas para
não sinalizar o vocabulário semântico (text-foreground, bg-card, text-on-dark*,
text-body, font-* token-backed). Peso fica fora de propósito (font-* já consome
--font-weight-*). Cobertura de positivos e negativos em lint-tokens.int.spec.ts.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Critérios de sucesso (PR 4)

- `no-raw-typography` sinaliza `text-xs..9xl` (warning), **não** sinaliza peso nem tamanhos semânticos.
- `no-raw-color` sinaliza a paleta crua (warning), **não** sinaliza tokens semânticos/contraste/inversa.
- `bun run lint:tokens` imprime warnings e sai com código 0 (0 erros).
- Gate verde. Testes de positivo **e** negativo cobrindo a calibração.

## Revisão (foco do reviewer — caça a falso-positivo)

Verifique, idealmente rodando `lintContent` mentalmente ou via `bun run lint:tokens`:
- `text-subheading-sm`, `text-body-lg`, `text-title-hero`, `text-code-sm` → **não** sinalizados por `no-raw-typography`.
- `font-bold`, `font-medium`, `font-semibold` → **não** sinalizados (decisão de escopo).
- `text-foreground`, `bg-card`, `text-muted-foreground`, `text-on-dark*`, `bg-background-inverse`, `border-border`, `ring-ring`, `from-background`, `to-card` → **não** sinalizados por `no-raw-color`.
- `auto-rows-min`, `divide-y` (sem cor) → **não** sinalizados (sem `\b<prefixo>-<paleta>`).
- `text-white/60`, `bg-gray-500`, `text-red-500` → sinalizados; o `.match` de `text-white/60` é `text-white`.
- Ambas as severidades são `warning`; nenhum novo `error`; CI segue verde.
- As regras só rodam em `.ts`/`.tsx` (`lang === 'ts'`).

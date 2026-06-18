# Frente A — Endurecer a infra de tipografia (PR 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar a tipografia semântica 100% definida no JSON — migrar `line-height`/`letter-spacing` das receitas hardcoded no script para `typography.json` e desacoplar o `prose` dos literais — sem alterar o resultado visual.

**Architecture:** O compilador `build-tokens.ts` lê os JSON DTCG e gera `tokens.css`. Hoje as receitas `@utility type-*` fixam `leading`/`tracking` num array no script; este PR move esses atributos para os grupos semânticos de `typography.json` (de onde `family`/`weight`/`size` já vêm), faz o build derivá-los de lá, e troca os literais de peso/tracking do `prose` (`tailwind.config.mjs`) por `var(--*)`. Um teste de integração trava a estrutura para impedir regressão.

**Tech Stack:** Bun 1.3.x, TypeScript, Vitest (jsdom), Tailwind v4 (CSS-first, `@theme inline`), formato DTCG.

## Global Constraints

- Package manager é **Bun** (`bun`/`bunx`), nunca npm/pnpm.
- **Nunca** editar `src/design-system/tokens.css` ou `tokens/motion.generated.ts` à mão — são gerados por `bun run design:build`. Toda mudança é no JSON/script, seguida de rebuild e commit dos gerados.
- `tailwind.config.mjs` referencia **CSS vars** (`var(--…)`), **nunca** a forma interna do JSON.
- Commits em **Conventional Commits** com descrição em **pt-BR**; terminar a mensagem com `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Branch de trabalho: **`develop`** (commits diretos permitidos).
- Gate antes de cada commit final de tarefa: `bun run design:check`, `bun run lint`, `bunx tsc --noEmit`, `bun run test:int` — todos verdes.
- A forma canônica de aplicar tipografia é `type-*`; este PR **não** altera componentes.
- Mudança visual esperada: **nenhuma** (os valores resolvidos de line-height/letter-spacing são idênticos; só muda de onde vêm).

---

## File Structure

- `src/design-system/tokens/typography.json` — **Modify.** Cada grupo semântico (`body`, `code`, `heading`, `subheading`, `subtitle`, `title-page`, `title-hero`) ganha `line-height` e `letter-spacing`; `body` ganha também `line-height-relaxed` (para a receita `body-large`).
- `scripts/build-tokens.ts` — **Modify.** O array `TYPE_RECIPES` troca os campos `leading`/`tracking` (nomes de primitivos) por `lineHeight`/`letterSpacing` (nomes de tokens semânticos completos); o template `typeUtilities` passa a usar esses nomes.
- `tailwind.config.mjs` — **Modify.** Os literais `fontWeight`/`letterSpacing` do `prose` viram `var(--weight-*)`/`var(--letter-spacing-tight)`.
- `src/design-system/tokens.css` — **Regenerate** (via `design:build`; não editar à mão).
- `tests/int/design-tokens.int.spec.ts` — **Create.** Guard de estrutura: cada grupo semântico tipográfico tem `line-height` e `letter-spacing`.

---

## Task 1: Guard de estrutura tipográfica (teste primeiro)

Trava a invariante que o resto do PR vai satisfazer: todo grupo semântico de tipografia precisa expor `line-height` e `letter-spacing`. Escrito antes da mudança no JSON para falhar primeiro (TDD).

**Files:**
- Test: `tests/int/design-tokens.int.spec.ts` (Create)

**Interfaces:**
- Consumes: `src/design-system/tokens/typography.json` (import direto; `tsconfig` já tem `resolveJsonModule`).
- Produces: nada que outras tasks consumam em código — apenas a garantia estrutural.

- [ ] **Step 1: Escrever o teste que falha**

Criar `tests/int/design-tokens.int.spec.ts`:

```ts
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
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `bun run test:int tests/int/design-tokens.int.spec.ts`
Expected: FAIL — os grupos ainda não têm `line-height`/`letter-spacing` (ex.: "body.line-height ausente").

- [ ] **Step 3: Commit do teste que falha**

```bash
git add tests/int/design-tokens.int.spec.ts
git commit -m "$(cat <<'EOF'
test(design-system): guard de line-height/letter-spacing nos grupos tipograficos

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Adicionar line-height/letter-spacing aos grupos semânticos do JSON

Faz o teste da Task 1 passar, declarando no JSON os mesmos valores que hoje vivem no array `TYPE_RECIPES` do script. Mapa de origem (extraído de `scripts/build-tokens.ts`, array `TYPE_RECIPES`):

| Grupo | line-height | letter-spacing | observação |
| --- | --- | --- | --- |
| `title-hero` | `tight` | `tight` | |
| `title-page` | `tight` | `tight` | receita `type-title` |
| `subtitle` | `snug` | `normal` | |
| `heading` | `snug` | `tight` | |
| `subheading` | `snug` | `normal` | |
| `body` | `normal` | `normal` | cobre `body`, `body-strong`, `body-small` |
| `body` (relaxed) | `relaxed` | — | exclusivo da receita `body-large` |
| `code` | `normal` | `normal` | |

**Files:**
- Modify: `src/design-system/tokens/typography.json`

**Interfaces:**
- Produces: tokens semânticos `--<group>-line-height`, `--<group>-letter-spacing` e `--body-line-height-relaxed` (emitidos pelo `flatten` dos grupos em `build-tokens.ts`, consumidos pela Task 3).

- [ ] **Step 1: Editar `typography.json` — grupo `body`**

Adicionar as três entradas ao objeto `"body"` (após `size-large`):

```json
    "size-large": { "$type": "dimension", "$value": "var(--text-scale-04)" },
    "line-height": { "$type": "number", "$value": "var(--line-height-normal)" },
    "line-height-relaxed": { "$type": "number", "$value": "var(--line-height-relaxed)" },
    "letter-spacing": { "$type": "dimension", "$value": "var(--letter-spacing-normal)" }
```

- [ ] **Step 2: Editar `typography.json` — grupo `code`**

Adicionar após `size-large` do `"code"`:

```json
    "size-large": { "$type": "dimension", "$value": "var(--text-scale-04)" },
    "line-height": { "$type": "number", "$value": "var(--line-height-normal)" },
    "letter-spacing": { "$type": "dimension", "$value": "var(--letter-spacing-normal)" }
```

- [ ] **Step 3: Editar `typography.json` — grupo `heading`**

Adicionar após `size-large` do `"heading"`:

```json
    "size-large": { "$type": "dimension", "$value": "var(--text-scale-06)" },
    "line-height": { "$type": "number", "$value": "var(--line-height-snug)" },
    "letter-spacing": { "$type": "dimension", "$value": "var(--letter-spacing-tight)" }
```

- [ ] **Step 4: Editar `typography.json` — grupo `subheading`**

Adicionar após `size-large` do `"subheading"`:

```json
    "size-large": { "$type": "dimension", "$value": "var(--text-scale-05)" },
    "line-height": { "$type": "number", "$value": "var(--line-height-snug)" },
    "letter-spacing": { "$type": "dimension", "$value": "var(--letter-spacing-normal)" }
```

- [ ] **Step 5: Editar `typography.json` — grupo `subtitle`**

Adicionar após `size-large` do `"subtitle"`:

```json
    "size-large": { "$type": "dimension", "$value": "var(--text-scale-07)" },
    "line-height": { "$type": "number", "$value": "var(--line-height-snug)" },
    "letter-spacing": { "$type": "dimension", "$value": "var(--letter-spacing-normal)" }
```

- [ ] **Step 6: Editar `typography.json` — grupo `title-page`**

Adicionar após `size-large` do `"title-page"`:

```json
    "size-large": { "$type": "dimension", "$value": "var(--text-scale-09)" },
    "line-height": { "$type": "number", "$value": "var(--line-height-tight)" },
    "letter-spacing": { "$type": "dimension", "$value": "var(--letter-spacing-tight)" }
```

- [ ] **Step 7: Editar `typography.json` — grupo `title-hero`**

Adicionar após `size` do `"title-hero"`:

```json
    "size": { "$type": "dimension", "$value": "var(--text-scale-10)" },
    "line-height": { "$type": "number", "$value": "var(--line-height-tight)" },
    "letter-spacing": { "$type": "dimension", "$value": "var(--letter-spacing-tight)" }
```

> Atenção: JSON não permite vírgula sobrando. Cada grupo é um objeto — garanta que a entrada anterior à primeira adição termine com vírgula e a última entrada do objeto não tenha vírgula final.

- [ ] **Step 8: Rodar o guard e confirmar que passa**

Run: `bun run test:int tests/int/design-tokens.int.spec.ts`
Expected: PASS — todos os grupos têm `line-height`/`letter-spacing` e `body` tem `line-height-relaxed`.

- [ ] **Step 9: Validar JSON e build (ainda sem mudar o script)**

Run: `bun run design:build`
Expected: build conclui sem erro de referência (os novos `var()` apontam para primitivos existentes). O `tokens.css` agora contém `--body-line-height`, `--title-hero-letter-spacing`, etc. **Não** commitar ainda — a Task 3 muda o script e regenera junto.

---

## Task 3: Build deriva leading/tracking do JSON (remover hardcode do script)

Troca o acoplamento: as receitas `type-*` deixam de fixar `leading`/`tracking` e passam a referenciar os tokens semânticos criados na Task 2.

**Files:**
- Modify: `scripts/build-tokens.ts` (array `TYPE_RECIPES` e template `typeUtilities`)
- Regenerate: `src/design-system/tokens.css`

**Interfaces:**
- Consumes: `--<group>-line-height`, `--<group>-letter-spacing`, `--body-line-height-relaxed` (Task 2).
- Produces: `@utility type-*` cujas declarações `line-height`/`letter-spacing` apontam para os tokens semânticos.

- [ ] **Step 1: Substituir o tipo e o array `TYPE_RECIPES`**

Em `scripts/build-tokens.ts`, localizar o bloco `const TYPE_RECIPES` (campos atuais: `util, family, weight, size, leading, tracking`) e substituí-lo inteiro por:

```ts
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
```

- [ ] **Step 2: Atualizar o template `typeUtilities`**

Logo abaixo do array, o `map` que monta cada `@utility type-*`. Trocar as duas últimas linhas do template (que hoje usam `var(--line-height-${r.leading})` e `var(--letter-spacing-${r.tracking})`) para referenciar os nomes completos:

```ts
  const typeUtilities = TYPE_RECIPES.map(
    (r) => `@utility type-${r.util} {
  font-family: var(--${r.family});
  font-weight: var(--${r.weight});
  font-size: var(--${r.size});
  line-height: var(--${r.lineHeight});
  letter-spacing: var(--${r.letterSpacing});
}`,
  ).join('\n\n')
```

- [ ] **Step 3: Regenerar os tokens**

Run: `bun run design:build`
Expected: "✓ Design tokens compilados". O `tokens.css` muda apenas o **texto** das declarações `type-*` (ex.: `line-height: var(--body-line-height-relaxed)`), mantendo o valor resolvido idêntico.

- [ ] **Step 4: Conferir o diff gerado**

Run: `git --no-pager diff src/design-system/tokens.css`
Expected: mudanças restritas ao bloco de `@utility type-*` (line-height/letter-spacing agora apontam para `--<group>-*`) e à adição das novas vars semânticas em `:root`. Nenhuma var obrigatória sumiu (a guarda `REQUIRED_VARS` do build teria falhado se sim).

- [ ] **Step 5: Confirmar sincronização**

Run: `bun run design:check`
Expected: "✓ Design tokens estão atualizados."

---

## Task 4: Desacoplar o `prose` dos literais

Faz o `prose` consumir os tokens de peso/tracking em vez de números/medidas literais.

**Files:**
- Modify: `tailwind.config.mjs`

**Interfaces:**
- Consumes: `--weight-extra-bold`, `--weight-semibold`, `--weight-medium`, `--letter-spacing-tight` (emitidos em `:root` por `build-tokens.ts`).

- [ ] **Step 1: Trocar os literais no bloco `DEFAULT.css`**

Em `tailwind.config.mjs`, dentro de `typography.DEFAULT.css[0]`, aplicar:

- `h1.fontWeight: '800'` → `'var(--weight-extra-bold)'`
- `h1.letterSpacing: '-0.025em'` → `'var(--letter-spacing-tight)'`
- `h2.fontWeight: '600'` → `'var(--weight-semibold)'`, `h2.letterSpacing: '-0.025em'` → `'var(--letter-spacing-tight)'`
- `h3.fontWeight: '600'` → `'var(--weight-semibold)'`, `h3.letterSpacing: '-0.025em'` → `'var(--letter-spacing-tight)'`
- `h4.fontWeight: '600'` → `'var(--weight-semibold)'`, `h4.letterSpacing: '-0.025em'` → `'var(--letter-spacing-tight)'`
- `code.fontWeight: '600'` → `'var(--weight-semibold)'`
- `a.fontWeight: '500'` → `'var(--weight-medium)'`

Resultado do bloco (referência):

```js
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
```

> `marginBottom: '0.25em'` permanece literal — é proporção tipográfica relativa ao texto (`em`), não um token de design; não há token correspondente e está fora do escopo do linter de dimensão.

- [ ] **Step 2: Verificar que o `design:check` segue verde**

Run: `bun run design:check`
Expected: "✓ Design tokens estão atualizados." (o `tailwind.config.mjs` não é arquivo gerado; esta mudança não afeta `tokens.css`.)

---

## Task 5: Gate completo + commit da Frente A

Roda todas as verificações do projeto e fecha o PR 1 num commit (gerados + fontes).

**Files:** (nenhum novo — apenas verificação e commit do que foi alterado nas Tasks 2–4)

- [ ] **Step 1: Lint do código**

Run: `bun run lint`
Expected: sem erros (max-warnings 0).

- [ ] **Step 2: Lint de tokens em uso (sem regressão de hardcode)**

Run: `bun run lint:tokens`
Expected: "✓ Sem erros de token" (as regras novas só entram no PR 4; aqui nada deve regredir).

- [ ] **Step 3: Typecheck**

Run: `bunx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 4: Testes de integração**

Run: `bun run test:int`
Expected: PASS, incluindo `tests/int/design-tokens.int.spec.ts` e `tests/int/lint-tokens.int.spec.ts`.

- [ ] **Step 5: Commit da Frente A**

```bash
git add src/design-system/tokens/typography.json scripts/build-tokens.ts tailwind.config.mjs src/design-system/tokens.css
git commit -m "$(cat <<'EOF'
refactor(design-system): tipografia semantica 100% no JSON + prose desacoplado

Move line-height/letter-spacing das receitas type-* (hardcoded no
build-tokens.ts) para os grupos semanticos de typography.json, de onde o
build passa a deriva-los. body-large mantem o line-height relaxed via token
dedicado. O prose (tailwind.config.mjs) passa a consumir var(--weight-*) e
var(--letter-spacing-tight) no lugar dos literais. Sem mudanca visual.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

> O teste que falha (Task 1, Step 3) já foi commitado separadamente; este commit fecha a implementação. Se preferir um histórico de um único commit, pule o commit da Task 1 Step 3 e inclua o teste aqui.

---

## Próximos PRs (planos subsequentes, escritos just-in-time)

Cada um ganha seu próprio arquivo de plano quando chegar a vez, pois dependem de decisões deste/anterior:

- **PR 2 — `feat(design-system)`:** `@utility focus-ring` + expor tokens de contraste no `@theme` (`--color-on-dark*`/`--color-on-light*`) para texto sobre mídia.
- **PR 3 — `docs(design-system)`:** `docs/DESIGN-SYSTEM.md` (contrato de consumo) + referência no `CLAUDE.md`.
- **PR 4 — `feat(design-system)`:** regras `no-raw-typography` e `no-raw-color` em `lint-tokens.ts` como `warning` + testes em `lint-tokens.int.spec.ts`.
- **PR 5 — `fix(design-system)`:** vazamentos baratos — `text-red-500`→`text-error`, `text-white/60`→`text-on-dark-subtle`, e `design-lint-disable-line` nos casos intencionais (CTA do hero, AdminBar, Code, TechBadge).

## Self-Review (preenchido)

- **Cobertura do spec (Frente A):** A1 (leading/tracking → JSON) → Tasks 1–3; A2 (prose desacoplado) → Task 4; guard de teste → Task 1. A3 (`focus-ring`) pertence ao PR 2 (fora deste plano, por decisão de escopo). ✓
- **Placeholders:** nenhum — todo passo traz o conteúdo concreto (JSON, TS, comandos, saída esperada). ✓
- **Consistência de tipos/nomes:** os nomes de token produzidos na Task 2 (`<group>-line-height`, `<group>-letter-spacing`, `body-line-height-relaxed`) são exatamente os referenciados na Task 3 (`lineHeight`/`letterSpacing` do `TYPE_RECIPES`) e validados na Task 1. ✓
- **Risco mapeado:** `design:check` exige recommit dos gerados — coberto na Task 3/Task 5. JSON com vírgula sobrando — alerta explícito na Task 2 Step 7. ✓

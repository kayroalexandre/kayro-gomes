# Frente A2 — `@utility focus-ring` + contraste no `@theme` — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expor os tokens de contraste (`on-dark*`/`on-light*`) como cores Tailwind no `@theme` e adicionar um `@utility focus-ring` componível e tokenizado — a infraestrutura que o PR 5 (C2) e a refatoração de foco vão consumir.

**Architecture:** Ambas as mudanças vivem em `scripts/build-tokens.ts` (a fonte que gera `src/design-system/tokens.css`). Nada de editar `tokens.css` à mão: altera-se o gerador, roda-se `bun run design:build`, e o `tokens.css` regenerado é commitado junto. Guards de integração leem o `tokens.css` commitado e travam o contrato (utilitário e cores presentes, tokenizados).

**Tech Stack:** Bun 1.3.x, TypeScript, Tailwind v4 (CSS-first: `@theme inline` + `@utility`), Vitest (jsdom), pipeline DTCG de tokens.

## Global Constraints

- **Comunicação com o usuário em pt-BR**; arquivos de instrução de agente (CLAUDE.md/AGENTS.md) em inglês. Comentários de código podem ser em pt-BR (seguir o padrão do arquivo).
- **Nunca editar `src/design-system/tokens.css` à mão** — é gerado. Toda mudança é no JSON ou em `scripts/build-tokens.ts`, seguida de `bun run design:build`.
- **Branch de trabalho: `develop`** (commits diretos permitidos). Não commitar em `main`.
- **Conventional Commits em pt-BR.** Este PR é `feat(design-system): ...`.
- **Gate verde obrigatório a cada commit:** `bun run design:check`, `bun run lint` (`--max-warnings 0`), `bun run lint:tokens`, `bunx tsc --noEmit`, `bun run test:int`. O lint proíbe `any` (`--max-warnings 0`); use `unknown` quando precisar.
- **Sem mudança visual nesta fase.** Não adotar `focus-ring` em componentes nem refatorar cores aqui — apenas expor a infraestrutura. (A adoção é a etapa seguinte, fora deste spec.)
- **YAGNI:** não adicionar shadow semântico, tokens de estado (disabled/selected) nem token de offset dedicado. O offset do focus-ring reusa `--stroke-focus-ring`.

---

### Task 1: Expor tokens de contraste no `@theme` (habilita `text-on-dark` etc.)

**Files:**
- Modify: `scripts/build-tokens.ts` (adicionar `themeContrast` e a seção no array `theme`)
- Generated (commit, não editar à mão): `src/design-system/tokens.css`
- Test: `tests/int/design-tokens.int.spec.ts`

**Interfaces:**
- Consumes: `contrastEntries` — já existe em `build-tokens.ts` (`const contrastEntries = group(colors.semantic.contrast, 'text-')`), cujos `name` são `text-on-dark`, `text-on-dark-muted`, `text-on-dark-subtle`, `text-on-light`, `text-on-light-muted`, `text-on-light-subtle`, e cujos `value` são os literais oklch. O `:root` já emite `--text-on-*` (seção "Contrast"). O tipo `Entry = { name: string; value: string }`.
- Produces: no `@theme inline` gerado, seis vars novas `--color-on-dark`, `--color-on-dark-muted`, `--color-on-dark-subtle`, `--color-on-light`, `--color-on-light-muted`, `--color-on-light-subtle`, cada uma `var(--text-on-*)`. Isso habilita as classes Tailwind `text-on-dark*`/`bg-on-dark*`/`border-on-dark*` (e equivalentes `on-light`). Deixa o arquivo de teste com o scaffold `tokensCss` (leitura do CSS gerado) que a Task 2 reusa.

- [ ] **Step 1: Escrever o teste que falha (guard do contrato)**

Em `tests/int/design-tokens.int.spec.ts`, adicione os imports de I/O logo após o import existente de `typography` (topo do arquivo):

```ts
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

const tokensCss = readFileSync(
  fileURLToPath(new URL('../../src/design-system/tokens.css', import.meta.url)),
  'utf-8',
)
```

E acrescente este bloco ao final do arquivo:

```ts
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
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `bun run test:int tests/int/design-tokens.int.spec.ts -t "contraste sobre mídia"`
Expected: FAIL — `tokens.css` ainda não contém `--color-on-dark: var(` (hoje só há `--color-ring`).

- [ ] **Step 3: Implementar a derivação no `build-tokens.ts`**

Logo após a definição de `themeBlur` (a linha `const themeBlur = group(effects.blur, 'blur-')`), adicione:

```ts
  // Contraste sobre mídia: expõe os tokens theme-agnósticos (--text-on-*) como
  // cores Tailwind (--color-on-*), habilitando text-on-dark / bg-on-dark-subtle /
  // border-on-light para texto e superfícies sobre imagem/vídeo (C2 do design).
  const themeContrast: Entry[] = contrastEntries.map((e) => ({
    name: `color-${e.name.replace(/^text-/, '')}`,
    value: `var(--${e.name})`,
  }))
```

No array `theme`, logo abaixo da linha `section('Colors — semantic + aliases', themeColors),`, adicione:

```ts
    section('Contrast over media (on-dark-*/on-light-*)', themeContrast),
```

- [ ] **Step 4: Regenerar o CSS e verificar sincronização**

Run: `bun run design:build && bun run design:check`
Expected: build escreve `src/design-system/tokens.css`; `design:check` termina com `✓ Design tokens estão atualizados.` O `@theme inline` agora contém as seis vars `--color-on-*`.

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `bun run test:int tests/int/design-tokens.int.spec.ts -t "contraste sobre mídia"`
Expected: PASS (6 asserts verdes).

- [ ] **Step 6: Gate completo**

Run: `bun run design:check && bun run lint:tokens && bunx tsc --noEmit && bun run lint && bun run test:int`
Expected: todos verdes (`tsc` sem saída; lint sem warnings; test:int sem falhas).

- [ ] **Step 7: Commit**

```bash
git add scripts/build-tokens.ts src/design-system/tokens.css tests/int/design-tokens.int.spec.ts
git commit -m "feat(design-system): expõe tokens de contraste (on-dark/on-light) no @theme

Mapeia os tokens theme-agnósticos --text-on-* como cores Tailwind --color-on-*,
habilitando text-on-dark/bg-on-dark-subtle/border-on-light para texto e superfícies
sobre mídia. Infra consumida pela tokenização dos vazamentos sobre imagem (C2).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `@utility focus-ring` (anel de foco componível e tokenizado)

**Files:**
- Modify: `scripts/build-tokens.ts` (constante `focusRingUtility`, composição de `utilities`, `REQUIRED_VARS`)
- Generated (commit, não editar à mão): `src/design-system/tokens.css`
- Test: `tests/int/design-tokens.int.spec.ts`

**Interfaces:**
- Consumes: o scaffold `tokensCss` (const no topo do arquivo de teste) já adicionado pela Task 1. Os tokens `--stroke-focus-ring` (2px, de `size.json` → seção "Stroke Widths" do `:root`) e `--ring` (semântico, de `colors.json` → `:root`/`[data-theme]`), ambos já emitidos. `glassUtility` e `typeUtilities` já existem; `utilities` é a string que concatena os blocos `@utility`.
- Produces: bloco `@utility focus-ring { outline: var(--stroke-focus-ring) solid var(--ring); outline-offset: var(--stroke-focus-ring); }` no `tokens.css` gerado. Habilita aplicar `focus-visible:focus-ring` (e variantes) em elementos custom. `stroke-focus-ring` passa a constar em `REQUIRED_VARS` (guarda de órfão).

- [ ] **Step 1: Escrever o teste que falha (guard do utilitário)**

Acrescente ao final de `tests/int/design-tokens.int.spec.ts` (o `tokensCss` já está no topo, vindo da Task 1):

```ts
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
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `bun run test:int tests/int/design-tokens.int.spec.ts -t "focus-ring"`
Expected: FAIL — `tokens.css` ainda não contém `@utility focus-ring`; `block` é string vazia.

- [ ] **Step 3: Implementar o utilitário no `build-tokens.ts`**

Logo após a constante `glassUtility` (fecha com `}`\` na linha do `backdrop-filter`), adicione:

```ts
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
```

Troque a composição de `utilities`:

```ts
  const utilities = `${glassUtility}\n\n${typeUtilities}`
```

por:

```ts
  const utilities = `${glassUtility}\n\n${focusRingUtility}\n\n${typeUtilities}`
```

Em `REQUIRED_VARS`, troque a linha:

```ts
    'background', 'foreground', 'primary', 'border', 'ring',
```

por (acrescenta `stroke-focus-ring` à guarda de órfãos, já que o utilitário depende dele):

```ts
    'background', 'foreground', 'primary', 'border', 'ring', 'stroke-focus-ring',
```

- [ ] **Step 4: Regenerar o CSS e verificar sincronização**

Run: `bun run design:build && bun run design:check`
Expected: build escreve o CSS; `design:check` termina com `✓ Design tokens estão atualizados.` O bloco `@utility focus-ring` aparece entre `@utility glass` e os `@utility type-*`.

- [ ] **Step 5: Rodar o teste e confirmar que passa**

Run: `bun run test:int tests/int/design-tokens.int.spec.ts -t "focus-ring"`
Expected: PASS (2 asserts verdes).

- [ ] **Step 6: Gate completo**

Run: `bun run design:check && bun run lint:tokens && bunx tsc --noEmit && bun run lint && bun run test:int`
Expected: todos verdes. (Atenção: `lint:tokens` varre `src/`, não o `tokens.css` gerado — que está na allowlist; o utilitário tokenizado não introduz literal proibido em código de consumo.)

- [ ] **Step 7: Commit**

```bash
git add scripts/build-tokens.ts src/design-system/tokens.css tests/int/design-tokens.int.spec.ts
git commit -m "feat(design-system): adiciona @utility focus-ring tokenizado

Anel de foco componível que combina a espessura (--stroke-focus-ring) e a cor
(--ring) num utilitário único, aplicável via focus-visible:focus-ring em elementos
custom. Tokeniza a regra global :focus-visible (remove o literal 2px). Adiciona
stroke-focus-ring à guarda de órfãos REQUIRED_VARS.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Sequência e verificação final

- As duas tasks são independentes e sequenciais; cada uma fecha com gate verde e um commit `feat(design-system)`.
- Após ambas: revisão de branch (whole-branch) cobrindo os dois commits do PR 2.
- Atualizar o ledger `.git/sdd/progress.md` e a memória `design-system-hardening.md` ao concluir.

## Critérios de sucesso (PR 2)

- `@theme inline` expõe `--color-on-dark`, `--color-on-dark-muted`, `--color-on-dark-subtle`, `--color-on-light`, `--color-on-light-muted`, `--color-on-light-subtle`.
- `@utility focus-ring` presente no `tokens.css`, tokenizado (sem literal `2px`).
- `stroke-focus-ring` em `REQUIRED_VARS`.
- Guards de integração verdes; gate completo verde nos dois commits.
- Nenhuma mudança visual (apenas infraestrutura exposta; sem adoção em componentes).

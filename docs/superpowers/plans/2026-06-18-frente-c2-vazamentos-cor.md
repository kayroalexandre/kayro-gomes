# Frente C2 — Vazamentos de cor crua → tokens semânticos — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zerar os 17 warnings `no-raw-color` corrigindo o bug de tema (`text-red-500`) e substituindo os vazamentos de cor por tokens semânticos/contraste (imperceptível), anotando a única superfície escura sólida que não tem token absoluto.

**Architecture:** Edições cirúrgicas em 6 componentes. A maioria é troca de classe crua por token de contraste (`text-on-dark`≈branco, `text-on-light`≈preto — diferença imperceptível). O `bg-black` do bloco de código (sempre escuro, tema prism vsDark, sem token de superfície absoluta) é anotado via extração do `className` para `const` (o `design-lint-disable-line` só funciona em contexto JS, não dentro de `className="..."` de JSX).

**Tech Stack:** React 19 / Next 16 (App Router), Tailwind v4 (tokens `--color-on-*` expostos no PR 2). Sem teste unitário novo — a verificação é `lint:tokens` (no-raw-color → 0) + gate.

## Global Constraints

- **Só cor.** NÃO mexer nos warnings `no-raw-typography` (`text-sm`/`text-xl`…) — são da refatoração de componentes, fora deste PR. Manter `text-sm`/`text-xs` onde já existem.
- **Mudança visual:** apenas o **bug fix** (`text-red-500`→`text-destructive`) muda aparência de propósito (vermelho passa a inverter no dark). As tokenizações `on-dark`/`on-light` são **imperceptíveis** (oklch 98.5%/15% vs branco/preto). Não introduzir nenhuma outra mudança visual.
- Os tokens usados já existem (PR 2): `text-on-dark`, `bg-on-dark`, `border-on-dark`, `text-on-light` (classes geradas de `--color-on-*`). `text-destructive` (`--color-destructive`) também existe.
- **Branch `develop`.** Conventional Commits pt-BR; tipo `fix(design-system)`.
- **Gate:** `bun run design:check && bunx tsc --noEmit && bun run lint && bun run test:int` verdes; `bun run lint:tokens` com **0 erros** e **0 warnings `no-raw-color`** (os `no-raw-typography` permanecem).

---

### Task 1: Tokenizar/anotar os 17 vazamentos de cor

**Files (todos Modify):**
- `src/blocks/Form/Error/index.tsx`
- `src/components/ui/scroll-indicator.tsx`
- `src/heros/ProjectHero/DynamicTechBadge.tsx`
- `src/components/AdminBar/index.tsx`
- `src/blocks/Code/Component.client.tsx`
- `src/heros/ProjectHero/DynamicProjectHeroContent.tsx`

**Interfaces:** consome as classes de contraste geradas no PR 2 (`text-on-dark`, `bg-on-dark`, `border-on-dark`, `text-on-light`, todas aceitam modificador de opacidade `/NN`).

- [ ] **Step 1: Form/Error — corrigir o bug de tema**

`src/blocks/Form/Error/index.tsx` linha 11. Trocar:
```tsx
    <div className="mt-2 text-red-500 text-sm">
```
por (mantém `text-sm`):
```tsx
    <div className="mt-2 text-destructive text-sm">
```

- [ ] **Step 2: scroll-indicator — texto sutil sobre hero escuro**

`src/components/ui/scroll-indicator.tsx` linha 13. Trocar:
```tsx
        default: 'text-white/60',
```
por:
```tsx
        default: 'text-on-dark/60',
```

- [ ] **Step 3: TechBadge — chip translúcido sobre mídia**

`src/heros/ProjectHero/DynamicTechBadge.tsx` linha 21. Trocar:
```tsx
      className="text-xs px-2 py-1 rounded bg-white/10 border border-white/20"
```
por (mantém `text-xs`):
```tsx
      className="text-xs px-2 py-1 rounded bg-on-dark/10 border border-on-dark/20"
```

- [ ] **Step 4: AdminBar — texto sobre chrome escuro (tokeniza) + bg-black (anota)**

`src/components/AdminBar/index.tsx`:

Linha 94 — tokeniza `text-white` e anota `bg-black` (contexto JS, dentro de `cn(...)`):
```tsx
        'fixed top-0 left-0 right-0 z-[9999] py-2 bg-black text-on-dark', // design-lint-disable-line bg-black: chrome fixo do admin (sempre escuro, independe do tema)
```
Linha 104:
```tsx
          className="py-2 text-on-dark"
```
Linhas 106–108:
```tsx
            controls: 'font-medium text-on-dark',
            logo: 'text-on-dark',
            user: 'text-on-dark',
```

- [ ] **Step 5: Code — line numbers (tokeniza) + pre bg-black (extrai const + anota)**

`src/blocks/Code/Component.client.tsx`:

(a) Linha 20 — trocar `text-white/25` por `text-on-dark/25`:
```tsx
              <span className="table-cell select-none text-right text-on-dark/25">{i + 1}</span>
```

(b) Extrair o `className` do `<pre>` para uma `const` anotada. Após `if (!code) return null` (linha 12), adicionar:
```tsx
  // O bloco de código usa o tema escuro do prism (vsDark); a superfície é
  // sempre escura, sem token de superfície absoluta que sirva. O text-xs do
  // código também é intencional (fonte mono pequena).
  const preClassName =
    'bg-black p-4 border text-xs border-border rounded overflow-x-auto' // design-lint-disable-line bg-black: superfície de código sempre escura (prism vsDark)
```
E trocar a abertura do `<pre>` (linha 17) de:
```tsx
        <pre className="bg-black p-4 border text-xs border-border rounded overflow-x-auto">
```
para:
```tsx
        <pre className={preClassName}>
```

- [ ] **Step 6: CTA do ProjectHero — botão invertido + ghost (tokeniza, imperceptível)**

`src/heros/ProjectHero/DynamicProjectHeroContent.tsx`:

Linha 74 (botão primário sólido invertido):
```tsx
              className="inline-flex items-center gap-2 rounded-md bg-on-dark text-on-light px-4 py-2 text-sm font-medium hover:bg-on-dark/90"
```
Linha 85 (botão secundário "ghost"):
```tsx
              className="inline-flex items-center gap-2 rounded-md border border-on-dark/30 px-4 py-2 text-sm font-medium hover:bg-on-dark/10"
```

- [ ] **Step 7: Verificar que os warnings de cor zeraram**

Run: `bun run lint:tokens 2>&1 | grep -c no-raw-color || true`
Expected: `0` (nenhum `no-raw-color`). Os `no-raw-typography` permanecem (refatoração futura). `lint:tokens` continua com **0 erros** e exit 0.

- [ ] **Step 8: Gate completo**

Run: `bun run design:check && bunx tsc --noEmit && bun run lint && bun run test:int`
Expected: todos verdes.

- [ ] **Step 9: Commit**

```bash
git add src/blocks/Form/Error/index.tsx src/components/ui/scroll-indicator.tsx src/heros/ProjectHero/DynamicTechBadge.tsx src/components/AdminBar/index.tsx src/blocks/Code/Component.client.tsx src/heros/ProjectHero/DynamicProjectHeroContent.tsx
git commit -m "fix(design-system): elimina vazamentos de cor crua (tokens de contraste)

Zera os 17 warnings no-raw-color. Corrige um bug de tema real: text-red-500 no
erro de formulário não invertia no dark -> text-destructive. Demais ocorrências
sobre mídia/chrome viram tokens de contraste (text-on-dark/text-on-light/bg-on-dark,
imperceptível: on-dark≈branco, on-light≈preto). O bg-black do bloco de código
(superfície sempre escura, tema prism vsDark) e o do AdminBar (chrome fixo) são
anotados com design-lint-disable-line. Tipografia crua segue como warning (refatoração).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Critérios de sucesso (PR 5)

- `bun run lint:tokens` → **0** warnings `no-raw-color` (e 0 erros). `no-raw-typography` permanecem.
- Bug `text-red-500` corrigido (`text-destructive`, inverte no dark).
- Tokenizações imperceptíveis; nenhuma mudança visual além do bug fix.
- Gate verde.

## Revisão (foco do reviewer)

- Cada classe nova existe e é o token correto: `text-destructive`, `text-on-dark`/`bg-on-dark`/`border-on-dark` (≈branco), `text-on-light` (≈preto). Confirmar em `tokens.css` (`--color-destructive`, `--color-on-dark`, `--color-on-light`).
- **Sem mudança visual** exceto o bug fix: `on-dark`/`on-light` são imperceptíveis vs branco/preto; nenhuma superfície reativa ao tema foi introduzida onde a cor precisa ser fixa (o `bg-black` do Code/AdminBar foi mantido e anotado, NÃO trocado por `bg-background-inverse`).
- `design-lint-disable-line` presente e com motivo em: AdminBar:94 (`bg-black`) e na `const preClassName` do Code.
- Só arquivos de cor tocados; nenhum warning `no-raw-typography` "consertado" por engano (exceto o `text-xs` do `<pre>` do Code, suprimido junto pela `const` anotada — aceitável/intencional).
- `lint:tokens` 0 `no-raw-color` / 0 erros; gate verde; commit `fix(design-system)` pt-BR.

# Frente B — Contrato de consumo (`docs/DESIGN-SYSTEM.md`) — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar `docs/DESIGN-SYSTEM.md` — o guia normativo curto de "como estilizar neste projeto" (o vocabulário canônico que a trava do linter passa a cobrar) — e referenciá-lo no `CLAUDE.md`.

**Architecture:** Documento único em `docs/` (mesma categoria e língua — **pt-BR** — de `MIGRATIONS.md`/`TROUBLESHOOTING.md`), mais uma referência em inglês na seção "Design system" do `CLAUDE.md` (arquivo de agente, mantido em inglês). Sem mudança de código; o gate só confirma que nada quebrou.

**Tech Stack:** Markdown. Sem build/test específico (docs).

## Global Constraints

- **`docs/DESIGN-SYSTEM.md` em pt-BR** (consistente com os docs irmãos de desenvolvedor). A referência **dentro do `CLAUDE.md` em inglês** (o CLAUDE.md é arquivo de agente).
- **Vocabulário documentado deve existir de fato** no `tokens.css` gerado — nada de citar classe/token inexistente. Lista autoritativa validada na elaboração do plano (recipes `type-*`, `text-*` semânticos, cores semânticas + contraste `on-dark*`/`on-light*` + `background-inverse`/`foreground-inverse`, `@utility focus-ring`/`glass`).
- **Branch `develop`** (commit direto). Conventional Commits pt-BR; tipo `docs(design-system)`.
- **Gate verde:** `bun run design:check && bun run lint && bunx tsc --noEmit && bun run test:int` (docs não alteram código; serve de sanidade).
- **Não** promover regras do linter aqui (isso é PR 4/refatoração). O doc apenas **registra** que `no-raw-typography`/`no-raw-color` entram como `warning` e viram `error` quando o consumo zerar.

---

### Task 1: Criar `docs/DESIGN-SYSTEM.md` e referenciá-lo no `CLAUDE.md`

**Files:**
- Create: `docs/DESIGN-SYSTEM.md`
- Modify: `CLAUDE.md` (seção "Design system", após a linha do bullet de Framer Motion)

**Interfaces:**
- Consumes: o vocabulário gerado em `src/design-system/tokens.css` (recipes `@utility type-*`, `@utility focus-ring`/`glass`, `--color-*` semânticos + contraste, `text-*`/`font-weight-*`/`leading-*`/`tracking-*`). Nada de novo token.
- Produces: o contrato normativo referenciado pelo `CLAUDE.md` e (no PR 4) pelas mensagens/“definition of done” do linter.

- [ ] **Step 1: Criar `docs/DESIGN-SYSTEM.md` com o conteúdo abaixo (verbatim)**

````markdown
# Contrato de consumo do design system

> **Para que serve:** este é o guia normativo de **como estilizar neste projeto**.
> Define o vocabulário canônico (tipografia, cor, dimensão, motion, foco) e o que a
> trava anti-hardcode (`bun run lint:tokens`) cobra. Ao criar/refatorar componentes,
> blocos, heros e seções, siga este contrato.

## Princípio

Os tokens são **autorados em `src/design-system/tokens/*.json`** (formato DTCG — a
fonte da verdade) e compilados por `scripts/build-tokens.ts` em
`src/design-system/tokens.css` (mapeamento Tailwind v4 `@theme inline` + utilitários
`@utility`) e `tokens/motion.generated.ts`. **Nunca edite os arquivos gerados à mão** —
mude o JSON e rode `bun run design:build`.

Estilizar = **consumir esse vocabulário**, não reintroduzir literais. A regra de ouro:
se você está digitando um `#hex`, um `cubic-bezier(...)`, um `12px`, ou uma classe
Tailwind crua de paleta/escala (`text-white`, `text-5xl`), provavelmente existe um token.

## O contrato (resumo)

| Eixo | Canônico | Proibido (vira `warning` → `error`) |
| --- | --- | --- |
| **Tipografia** | `type-*` (receita completa); escape componível `text-*` semântico / `font-*` / `leading-*` / `tracking-*` | escala crua do Tailwind (`text-5xl`, `text-sm`), `text-[14px]` |
| **Cor** | semânticos shadcn (`text-foreground`, `bg-card`, `text-muted-foreground`, `bg-primary`…); contraste sobre mídia (`text-on-dark*`/`text-on-light*`); superfície invertida (`bg-background-inverse`, `text-foreground-inverse`) | paleta crua (`text-white`, `bg-gray-500`, `text-red-500`), `#hex`, `oklch(...)` solto |
| **Dimensão** | escalas (`rounded-*`/`var(--radius-*)`, ícone `size-*`/`var(--icon-*)`) | `rounded-[12px]`, `text-[14px]` (largura de leitura `max-w-[*rem]` é permitida) |
| **Motion** | `easing.*`/`duration.*` de `@/design-system/tokens/motion`, ou `var(--ease-*)` | `cubic-bezier(...)` literal, array de bézier solto |
| **Foco** | `focus-visible:focus-ring` (anel tokenizado) | `outline`/`ring` com valores literais ad-hoc |
| **Exceção** | `// design-lint-disable-line <motivo>` | exceção sem motivo |

## Tipografia

**Prefira as receitas `type-*`** — cada uma aplica família + peso + tamanho +
line-height + letter-spacing de uma vez, derivadas 100% do JSON:

`type-title-hero`, `type-title`, `type-subtitle`, `type-heading`, `type-subheading`,
`type-body-large`, `type-body`, `type-body-strong`, `type-body-small`, `type-code`.

**Escape componível** (quando uma receita não couber), sempre com utilitários
**semânticos/token**, nunca a escala crua do Tailwind:

- Tamanho: `text-title-hero`, `text-title`/`-sm`/`-lg`, `text-subtitle*`, `text-heading*`,
  `text-subheading*`, `text-body*`, `text-code*`. **Não** use `text-xs/sm/base/lg/xl/2xl…`.
- Peso: `font-thin`, `font-extra-light`, `font-light`, `font-regular`, `font-medium`,
  `font-semibold`, `font-bold`, `font-extra-bold`, `font-black` (todos lastreados em
  `--font-weight-*`).
- Line-height: `leading-none`/`tight`/`snug`/`normal`/`relaxed`/`loose`.
- Letter-spacing: `tracking-tighter`/`tight`/`normal`/`wide`/`wider`/`widest`.

O `prose` (rich text do CMS) é configurado em `tailwind.config.mjs` e já consome esses
tokens via `var(--*)` — não o estilize com literais.

## Cor

Use os **tokens semânticos** (reativos a tema claro/escuro):

- Superfícies/texto base: `bg-background`/`text-foreground`, `bg-card`/`text-card-foreground`,
  `bg-popover`/`text-popover-foreground`, `bg-muted`/`text-muted-foreground`.
- Ação/estado: `bg-primary`/`text-primary-foreground` (+ `-hover`/`-active`),
  `bg-secondary`, `bg-accent`/`text-accent-foreground`, `bg-destructive`/`text-destructive-foreground`,
  e os semânticos estendidos `error`, `success`, `info`, `warning`, `brand` (com
  `-hover` onde aplicável). Para erro de formulário use `text-destructive`/`text-error`
  — **nunca** `text-red-500`.
- Bordas/inputs/foco: `border-border`, `bg-input`, `ring-ring`.

**Texto/superfície sobre mídia** (imagem/vídeo, onde o tema não inverte):

- Contraste absoluto: `text-on-dark` / `on-dark-muted` / `on-dark-subtle` (e a família
  `on-light`). São cores fixas de contraste, não invertem com o tema.
- Superfície invertida: `bg-background-inverse`, `text-foreground-inverse`.

**Proibido:** `text-white`, `bg-black`, `bg-gray-500`, `#hex`/`oklch()` solto. Quando um
caso for genuinamente intencional (ex.: chrome fixo do admin, CTA invertido proposital),
anote `// design-lint-disable-line <motivo>`.

## Dimensão, motion, foco e vidro

- **Radius:** `rounded-sm/md/lg/xl/…` ou `var(--radius-card)`/`var(--radius-panel)`.
  Nada de `rounded-[12px]`.
- **Ícone:** `size-*` (ex.: `size-4`) ou `var(--icon-md)`.
- **Motion:** importe `easing`/`duration` de `@/design-system/tokens/motion` (Framer Motion)
  ou use `var(--ease-*)`/`var(--duration-*)` em CSS. Nada de `cubic-bezier(...)` literal.
- **Foco:** aplique `focus-visible:focus-ring` em elementos interativos custom (os
  primitivos shadcn já têm a própria receita de foco inline).
- **Vidro:** `class="glass"` (fundo translúcido + blur), tunável só por `effects.glass`.

## A trava (linter anti-hardcode)

`bun run lint:tokens` (e `lint:tokens --check` no CI) varre o código de consumo em `src/`.

- **Hoje (bloqueiam o CI — `error`):** `no-literal-color` (`#hex`, `rgb/hsl/oklch`),
  `no-literal-bezier` (`cubic-bezier`, array de easing), `no-literal-dimension`
  (`rounded-[Npx]`, `text-[Npx]`, `border-radius`/`letter-spacing` literais em CSS).
- **Em adoção (`warning`):** `no-raw-typography` (escala/peso cru do Tailwind) e
  `no-raw-color` (paleta crua). Entram como aviso para **guiar** a refatoração de
  componentes sem quebrar o CI.

**Definition of done da consistência:** quando o consumo de tipografia/cor crua zerar,
`no-raw-typography` e `no-raw-color` são promovidas de `warning` para `error` (em
`scripts/lint-tokens.ts`, `RULE_SEVERITY`). A partir daí, o contrato é obrigatório no CI.

**Escape:** para os raros casos legítimos, `// design-lint-disable-line <motivo>` na
própria linha (sempre com o motivo). Arquivos gerados/de infra estão na `FILE_ALLOWLIST`.
````

- [ ] **Step 2: Referenciar o doc no `CLAUDE.md`**

Na seção "Design system" do `CLAUDE.md`, logo após o bullet de Framer Motion
(`- Framer Motion easing/duration constants come from motion.generated.ts …`), adicione:

```markdown
- **Consumption contract:** how to apply these tokens in components — the canonical vocabulary (`type-*` typography, semantic + contrast colors, `focus-ring`, the `design-lint-disable-line` escape) and what the anti-hardcode linter (`bun run lint:tokens`) enforces — lives in **`docs/DESIGN-SYSTEM.md`**. Read it before styling components/blocks/heros.
```

- [ ] **Step 3: Sanidade — links e gate**

Run: `bun run design:check && bunx tsc --noEmit && bun run lint && bun run test:int`
Expected: todos verdes (docs não alteram código). Confirme também que o caminho
`docs/DESIGN-SYSTEM.md` citado no `CLAUDE.md` existe (o arquivo foi criado no Step 1).

- [ ] **Step 4: Commit**

```bash
git add docs/DESIGN-SYSTEM.md CLAUDE.md
git commit -m "docs(design-system): contrato de consumo (docs/DESIGN-SYSTEM.md) + ref no CLAUDE.md

Guia normativo de como estilizar no projeto: vocabulário canônico (type-* na
tipografia, cores semânticas/contraste/inversa, focus-ring, dimensão, motion) e o
que a trava anti-hardcode cobra, incluindo o definition-of-done da promoção
warning->error das regras no-raw-typography/no-raw-color. Referenciado na seção
Design system do CLAUDE.md (em inglês, como o restante do arquivo de agente).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Critérios de sucesso (PR 3)

- `docs/DESIGN-SYSTEM.md` publicado, em pt-BR, citando **apenas** vocabulário que existe
  no `tokens.css` gerado.
- `CLAUDE.md` referencia o doc na seção "Design system" (linha em inglês).
- Gate verde. Sem mudança de código/tokens.

## Revisão (foco do reviewer)

- **Acurácia normativa:** cada classe/token citado no doc existe de fato no `tokens.css`
  gerado? (recipes `type-*`, `text-*` semânticos, `--color-*` semânticos + `on-dark*`/
  `on-light*` + `background-inverse`/`foreground-inverse`, `focus-ring`, `glass`).
- **Descrição do linter** bate com `scripts/lint-tokens.ts` (regras `error` atuais; as
  `warning` ainda não existem — devem ser descritas como "em adoção", não como presentes).
- **Língua:** doc em pt-BR; a referência no `CLAUDE.md` em inglês.
- Link `docs/DESIGN-SYSTEM.md` no `CLAUDE.md` resolve.

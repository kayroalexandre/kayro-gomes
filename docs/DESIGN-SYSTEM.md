# Contrato de consumo do design system

> **Para que serve:** este é o guia normativo de **como estilizar neste projeto**.
> Define o vocabulário canônico (tipografia, cor, dimensão, motion, foco) e o que a
> trava anti-hardcode (`bun run lint:tokens`) cobra. Ao criar/refatorar componentes,
> blocos, heros e seções, siga este contrato.
>
> **Docs do design system:** comece por
> [`DESIGN-SYSTEM-GOVERNANCE.md`](./DESIGN-SYSTEM-GOVERNANCE.md) (processo: analise antes de
> mudar). Este documento é o **vocabulário**; veja também
> [`DESIGN-SYSTEM-COMPONENTS.md`](./DESIGN-SYSTEM-COMPONENTS.md) (uso de componentes +
> receitas por contexto) e [`DESIGN-SYSTEM-LAYOUT.md`](./DESIGN-SYSTEM-LAYOUT.md)
> (estrutura/espaçamento + auditoria por componente).

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

| Eixo | Canônico | Proibido (`error` — bloqueia o CI) |
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

- Contraste absoluto: `text-on-dark` / `text-on-dark-muted` / `text-on-dark-subtle` (e a
  família `text-on-light*`). São cores fixas de contraste, não invertem com o tema.
- Superfície invertida: `bg-background-inverse`, `text-foreground-inverse`.

**Proibido:** `text-white`, `bg-black`, `bg-gray-500`, `#hex`/`oklch()` solto. Quando um
caso for genuinamente intencional (ex.: chrome fixo do admin, CTA invertido proposital),
anote `// design-lint-disable-line <motivo>`.

## Dimensão, motion, foco e vidro

- **Radius:** `rounded-sm/md/lg/xl/…` ou `var(--radius-card)`/`var(--radius-panel)`.
  Nada de `rounded-[12px]`.
- **Ícone:** `size-*` (ex.: `size-4`) ou `var(--icon-md)`.
- **Controles (button/input/select…):** altura/padding/gap canônicos via
  `var(--control-height-*)` / `var(--control-padding-*)` / `var(--control-gap)`.
- **Ritmo de seção/bloco:** `var(--space-section-y)` / `--space-section-y-lg` /
  `--space-block-gap` (detalhes em `DESIGN-SYSTEM-LAYOUT.md`).
- **Motion:** importe `easing`/`duration` de `@/design-system/tokens/motion` (Framer Motion)
  ou use `var(--ease-*)`/`var(--duration-*)` em CSS. Nada de `cubic-bezier(...)` literal.
- **Foco:** aplique `focus-visible:focus-ring` em elementos interativos custom (os
  primitivos shadcn já têm a própria receita de foco inline).
- **Vidro:** `class="glass"` (fundo translúcido + blur), tunável só por `effects.glass`.

## A trava (linter anti-hardcode)

`bun run lint:tokens` (e `bun run lint:tokens:check` no CI) varre o código de consumo em `src/`.

- **Bloqueiam o CI (`error`):** `no-literal-color` (`#hex`, `rgb/hsl/oklch`),
  `no-literal-bezier` (`cubic-bezier`, array de easing), `no-literal-dimension`
  (`rounded-[Npx]`, `text-[Npx]`, `border-radius`/`letter-spacing` literais em CSS),
  `no-raw-typography` (escala de tamanho crua do Tailwind) e `no-raw-color` (paleta crua).

**Definition of done da consistência — atingido (2026-06-19):** `no-raw-typography` e
`no-raw-color` nasceram como `warning` para **guiar** a refatoração sem quebrar o CI;
quando o consumo crú zerou, foram **promovidas a `error`** em `scripts/lint-tokens.ts`
(`RULE_SEVERITY`). O contrato agora é **obrigatório no CI** — tipografia/cor crua quebram
o build; use os tokens semânticos ou o escape `// design-lint-disable-line <motivo>`.

**Escape:** para os raros casos legítimos, `// design-lint-disable-line <motivo>` na
própria linha (sempre com o motivo). Arquivos gerados/de infra estão na `FILE_ALLOWLIST`.

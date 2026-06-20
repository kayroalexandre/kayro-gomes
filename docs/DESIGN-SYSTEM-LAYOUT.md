# Design System — Registro de Layout & Espaçamento

Parte da trilogia do design system, ao lado do [contrato de consumo](./DESIGN-SYSTEM.md)
(**vocabulário**) e do [guia de uso de componentes](./DESIGN-SYSTEM-COMPONENTS.md)
(**uso aplicado + receitas por contexto**). Este documento é o **registro vivo** da
auditoria de **estrutura**: containers, hierarquia de `div`s, padding/margin, gaps,
alinhamento e os padrões de espaçamento por tipo de conteúdo (chrome, cards, seções…).

Vai sendo preenchido componente a componente conforme a auditoria avança.

## Fundamentos

### Mapa de tipografia: Tailwind cru → utilitário semântico

Tabela canônica usada na refatoração anti-hardcode. Substitui-se **apenas o tamanho**
(o utilitário `text-*` semântico vem do token); peso/leading/tracking permanecem como
estavam (`font-*` é token-backed e não é alvo do linter). A escala SDS é harmônica e
com degraus — não tem todos os tamanhos do Tailwind, então alguns mapeiam para o degrau
**mais próximo** (Δ indica a variação em px).

| Cru | px | → Semântico | px | Δ |
|-----|----|-----------|----|----|
| `text-xs` | 12 | `text-body-sm` | 14 | +2 |
| `text-sm` | 14 | `text-body-sm` | 14 | 0 |
| `text-base` | 16 | `text-body` | 16 | 0 |
| `text-lg` | 18 | `text-body-lg` | 20 | +2 |
| `text-xl` | 20 | `text-body-lg` | 20 | 0 |
| `text-2xl` | 24 | `text-heading` | 24 | 0 |
| `text-3xl` | 30 | `text-heading-lg` | 32 | +2 |
| `text-4xl` | 36 | `text-title-sm` | 40 | +4 |
| `text-5xl` | 48 | `text-title` | 48 | 0 |
| `text-6xl` | 60 | `text-title-lg` | 64 | +4 |

**Ideal (futuro):** para fidelidade pixel-perfect dos tamanhos sem degrau (12/18/30/36/60),
o caminho correto NÃO é `text-[Npx]` cru, e sim **adicionar o degrau na escala SDS**
(`scale.json`) e referenciá-lo — mantendo a fonte única. Enquanto não houver, aproxima-se
para o degrau existente (a maioria já é match exato: sm, base, xl, 2xl, 5xl).

### Escala de espaçamento

A escala do Tailwind v4 é ancorada no token **`--spacing: 0.25rem`** (4px). Logo,
**`gap-6`, `py-16`, `px-4`… NÃO são valores crus** — são múltiplos do token
(`gap-6` = 6 × 0.25rem = 1.5rem). Usar a escala numérica do Tailwind é o caminho
canônico; o que **não** se admite é `gap-[13px]`, `p-[7px]` ou `m-[0.9rem]` (fora da grade de 4px).

| Passo | Valor | Uso típico |
|-------|-------|------------|
| `2` | 0.5rem (8px) | gap entre ícones de ação |
| `4` | 1rem (16px) | gap interno de blocos pequenos |
| `6` | 1.5rem (24px) | gap entre itens de nav / colunas |
| `8` | 2rem (32px) | gap de nav em telas md+ |
| `10` | 2.5rem (40px) | gap entre grandes blocos (footer) |
| `16` | 4rem (64px) | padding vertical de seções (footer) |

**Quando promover a token semântico:** a escala numérica do Tailwind é o
default para espaçamento pontual. Mas quando um valor representa uma **intenção
de layout compartilhada** por vários componentes (altura de controle, ritmo de
seção), ele vira um **token semântico nomeado** em `layout.json` (`--control-*`,
`--space-*`) — fonte única + exportável para o Figma. Ver "Dimensões de
controle" e "Ritmo de seção e bloco" abaixo.

### Base `rem` e tamanho de fonte do navegador

A escala tipográfica é **`rem`-based** (1rem = `--text-scale-03`). **Não** fixamos
`font-size` no `<html>`: o root herda o tamanho-base do navegador (default 16px),
de propósito — assim o site **respeita a preferência de acessibilidade** do usuário
e escala junto.

**Consequência diagnóstica:** se o texto aparecer proporcionalmente maior/menor que o
esperado (ex.: nav "16px" renderizando 24px, logo "24px" renderizando 36px — fator
**1.5×**), a causa **não é o CSS**, e sim a preferência *Tamanho da fonte* do navegador
fora de "Médio" (Chrome/Edge: "Muito grande" = 24px → todo `rem` × 1.5). Verificar em
`chrome://settings/appearance` **antes** de suspeitar do código. Decisão registrada
(2026-06-19): **não fixar** o root em px — priorizar acessibilidade; o zoom de página
(Ctrl±) continua disponível para ajuste pontual.

### Container

`.container` ([globals.css](../src/app/(frontend)/globals.css)) — largura 100%,
centralizado (`margin-inline: auto`), com `padding-inline` responsivo via token:

- base: `--container-padding` = **1rem**
- `md+`: `--container-padding-md` = **2rem**
- `max-width` cresce por breakpoint (`--breakpoint-sm…2xl`).

**Regra:** todo conteúdo de página vive dentro de `.container`. Não recriar padding
lateral manualmente (`px-4 md:px-8`) — usar `.container`.

### Altura de chrome

- Header: `--header-h` = **5rem** (80px), aplicado como `h-[var(--header-h)]`.

### Dimensões de controle (button, input, select, textarea)

Os controles interativos têm **dimensões canônicas tokenizadas** em
`layout.json` → grupo `control` → `--control-*`. Antes eram literais Tailwind
espalhados (`h-9`/`h-10`/`h-12`, `px-3`/`4`/`6`/`8`, `py-2`, `gap-2`); agora a
fonte é única e exportável para o Figma. Consumidos no **mesmo idioma `var()`
do `--header-h`** (ex.: `h-[var(--control-height-md)]`). Os valores **espelham
exatamente** a calibração shadcn anterior — tokenizar foi **zero mudança visual**.

| Token | Valor | px | Equiv. Tailwind | Uso |
|-------|-------|----|-----------------|-----|
| `--control-height-sm` | 2.25rem | 36 | `h-9` | input, select, textarea, button `sm` |
| `--control-height-md` | 2.5rem | 40 | `h-10` / `size-10` | button `default`, button `icon` |
| `--control-height-lg` | 3rem | 48 | `h-12` | button `lg` |
| `--control-padding-x-compact` | 0.75rem | 12 | `px-3` | campos de texto (input/select/textarea) |
| `--control-padding-x-sm` | 1rem | 16 | `px-4` | button `sm`; padding reduzido c/ ícone |
| `--control-padding-x-md` | 1.5rem | 24 | `px-6` | button `default` |
| `--control-padding-x-lg` | 2rem | 32 | `px-8` | button `lg` |
| `--control-padding-y` | 0.5rem | 8 | `py-2` | padding vertical padrão de controle |
| `--control-gap` | 0.5rem | 8 | `gap-2` | gap ícone↔label dentro do controle |

**Registro por componente:**

| Componente | Altura | Padding-x | Padding-y | Raio | Tipografia |
|------------|--------|-----------|-----------|------|------------|
| `Button` default | `--control-height-md` | `--control-padding-x-md` | `--control-padding-y` | `rounded-full` | `text-body-sm` |
| `Button` sm | `--control-height-sm` | `--control-padding-x-sm` | — | `rounded-full` | `text-body-sm` |
| `Button` lg | `--control-height-lg` | `--control-padding-x-lg` | — | `rounded-full` | `text-body` |
| `Button` icon | `--control-height-md` (quadrado) | — | — | `rounded-full` | — |
| `Input` | `--control-height-sm` | `--control-padding-x-compact` | `py-1` | `rounded-md` | `text-body` → `md:text-body-sm` |
| `Textarea` | `min-h-16` (multi-linha) | `--control-padding-x-compact` | `--control-padding-y` | `rounded-md` | `text-body` → `md:text-body-sm` |
| `SelectTrigger` | `--control-height-sm` | `--control-padding-x-compact` | `--control-padding-y` | `rounded-md` | `text-body-sm` |
| `Checkbox` | `size-4` (16px) | — | — | `rounded-sm` | indicador `size-3.5` |

> **Nota (Checkbox):** controle pequeno (16px); o alvo de clique efetivo é
> ampliado pelo `Label` associado, não por padding do próprio box. Indicador
> interno (✓) usa `size-3.5` (ícone `lucide`).

### Ritmo de seção e bloco

O **padding vertical de seção** e a **margem entre blocos** são tokenizados em
`layout.json` → grupo `space` → `--space-*`. O padrão `py-16 md:py-24` antes
estava **repetido literalmente em 12+ lugares** (blocos, heros, páginas de
listagem); agora é um par de tokens responsivos consumidos via
`py-[var(--space-section-y)] md:py-[var(--space-section-y-lg)]`. Centraliza o
ritmo da página numa única fonte (e exporta para o Figma).

| Token | Valor | px | Equiv. Tailwind | Uso |
|-------|-------|----|-----------------|-----|
| `--space-section-y` | 4rem | 64 | `py-16` | padding vertical de seção, base (mobile) |
| `--space-section-y-lg` | 6rem | 96 | `py-24` | padding vertical de seção em `md+` |
| `--space-block-gap` | 4rem | 64 | `my-16` | margem vertical entre blocos no `RenderBlocks` |

**Consumidores do ritmo de seção:** `Content`, `CallToAction`, `ArchiveBlock`
(×2), `Form`, `MediumImpact`, `LowImpact`, `search/page`, `posts/page/[n]`.
**Exceção deliberada:** o `HighImpact` mantém seu `py-16` **literal** — sua
geometria é calibrada (full-bleed + offset de header); ver `AGENTS.md`. O
empty-state da busca (`py-16 px-4`) também fica literal (é um card, não o ritmo
de seção responsivo).

**Espaçamentos ainda literais (Tailwind canônico, documentados — não migrados):**
painel do CTA (`p-10 md:p-16`), `Pagination`/`Form Message` (`my-12`), `Banner`
(`my-8`). São casos pontuais; usar a escala numérica do Tailwind aqui é
canônico (ver "Escala de espaçamento" acima) — só viram token se o valor passar
a ser compartilhado por vários componentes.

---

## Componentes auditados

### Header — ✅ auditado (2026-06-19)

Arquivos: [Component.client.tsx](../src/Header/Component.client.tsx),
[Nav/index.tsx](../src/Header/Nav/index.tsx), [Nav/NavItem.tsx](../src/Header/Nav/NavItem.tsx),
[Nav/MobileMenu.tsx](../src/Header/Nav/MobileMenu.tsx),
[Nav/getNavItemHref.ts](../src/Header/Nav/getNavItemHref.ts).

**Estrutura de container:**

```text
<header> fixed, glass, h=--header-h
└── .container  → grid grid-cols-[auto_1fr_auto] items-center
    ├── [auto] Logo (Link)
    ├── [1fr]  <nav> hidden md:flex justify-self-center  → itens HeaderNavItem
    └── [auto] ações: <div> flex gap-2 justify-self-end → Search + ThemeToggle + MobileMenu
```

- **Grid de 3 colunas** `[auto_1fr_auto]`: logo à esquerda, nav perfeitamente
  centralizada (`justify-self-center` na coluna `1fr`), ações à direita
  (`justify-self-end`). Padrão correto para header com centro absoluto.
- **Espaçamentos:** nav `gap-6 md:gap-8`; ações `gap-2`.
- **Ícones de ação (search + toggle, idênticos):** círculo `size-10` (40px)
  `rounded-full` com efeito **`glass` permanente** (estado default, igual ao Header)
  e **borda hairline `border-border/20`** — necessária porque o círculo usa o mesmo
  `--glass-bg` do Header; sem o contorno, o disco não se distingue do fundo (mesma cor)
  e o `backdrop-filter` aninhado não acumula. A borda delineia o disco mantendo o translúcido;
  ícone interno **`size="md"` = 1.25rem (20px)**. **O hover afeta APENAS o ícone**
  (`text-muted-foreground` → `group-hover:text-foreground`, fica branco) — o glass do
  círculo NÃO é um efeito de hover, é o estado base. O toggle usa `variant="link"`
  (único sem `hover:bg-*`) para não introduzir background de hover concorrente.
- **Itens de nav:** componente `HeaderNavItem` (dinâmico). **16px** (`type-body`). Ativo =
  `type-body-strong text-foreground`; inativo = `type-body text-muted-foreground hover:text-foreground`.
- **Logo:** `text-heading` = **24px** (`scale-05`), `font-semibold tracking-tight`.
- **Mobile (`< md`):** o `<nav>` central é `hidden md:flex` (em telas estreitas vazava
  sobre o logo no grid `1fr`). Os links migram para o `MobileMenu`: botão hambúrguer
  `size-10` glass (mesmo footprint das ações) que abre um painel dropdown ancorado em
  `absolute top-full left-0 right-0`. O painel usa superfície **sólida** (`bg-background`),
  **não `glass`** — o vidro tem só ~50% de opacidade e ficaria ilegível sobre o conteúdo.
  Fecha com Escape, clique-fora e ao navegar (`aria-expanded`/`aria-controls`). Os itens
  com estado ativo são computados uma vez em `index.tsx` (`getNavItemHref`) e
  compartilhados entre o nav desktop e o mobile.

**Alinhamento (vertical + horizontal):** o eixo vertical é garantido por `items-center`
em **todos** os níveis — no grid do header, no `<nav>`, na `<div>` de ações e no
`inline-flex` do próprio `<Logo>`. Assim, mesmo com tamanhos de fonte diferentes
(logo 24px, nav 16px, ícones 16px), os **centros** ficam alinhados na mesma linha.
O eixo horizontal vem das 3 colunas do grid: `justify-self-center` na nav (centro
absoluto) e `justify-self-end` nas ações. **Regra:** não usar margens manuais para
posicionar; o alinhamento é responsabilidade do grid + `items-center`.

### Footer — 🟡 parcial (tipografia ✅ 2026-06-19)

Arquivo: [Component.tsx](../src/Footer/Component.tsx). Tipografia já tokenizada; ajustes
estruturais/cor ainda pendentes.

**Estrutura de container:**

```text
<footer> mt-auto, border-t border-border/10, glass
└── .container  → py-16, flex flex-col gap-10 md:flex-row md:justify-between
    ├── <div> flex flex-col gap-4   → Logo + parágrafo
    └── <div> flex flex-col gap-6 md:items-end → <nav> de links
```

**Estado:**

- ✅ `text-sm` cru (parágrafo e nav) → `text-body-sm` (tokenizado em 2026-06-19).
- ✅ Logo: tokenizada (componente compartilhado com o Header).
- ⏳ Opacidades de cor (`border-border/10`) — avaliar token de borda dedicado.
- ⏳ Confirmar `gap-10` vs hierarquia de seções (o `py-16`/`py-24` de seção já
  foi promovido a `--space-section-y*` — ver "Ritmo de seção e bloco").

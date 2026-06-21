# Guia de uso — componentes & receitas por contexto

> **Para que serve:** este é o guia **aplicado** do design system — *o que usar, quando e
> por quê*. Complementa os outros dois documentos da trilogia:
>
> | Documento | Responde |
> | --- | --- |
> | [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) | **vocabulário** — quais tokens existem e o que a trava anti-hardcode cobra |
> | [`DESIGN-SYSTEM-LAYOUT.md`](./DESIGN-SYSTEM-LAYOUT.md) | **estrutura** — containers, espaçamento, alinhamento; auditoria por componente |
> | **este** | **uso** — catálogo de componentes + receitas por situação/necessidade |
>
> Leia o contrato primeiro; aqui assume-se que o vocabulário (`type-*`, cor semântica,
> `focus-ring`, etc.) já é conhecido.

---

## 1. Como escolher rápido (por necessidade)

| Preciso de… | Use | Evite |
| --- | --- | --- |
| Título de página/hero | `type-title-hero` / `type-title` (ou `text-title*`) | `text-4xl/5xl` |
| Cabeçalho de seção/card | `type-heading` / `type-subheading` | `text-2xl` |
| Texto corrido | `type-body` (`-large`/`-small`/`-strong`) | `text-base/sm` |
| Código inline/bloco | `type-code` (`-sm`/`-lg`) | `font-mono text-sm` |
| Rótulo de microconteúdo (badge/pill) | `text-scale-01` (12px) | `text-xs` |
| Botão / CTA | `<Button>` (variante por intenção) | `<a>`/`<button>` estilizado à mão |
| Link de conteúdo (CMS) | `<CMSLink>` (`appearance`) | `<Link>` cru sem tokens |
| Campo de formulário | `<Input>` / `<Textarea>` / `<Select>` + `<Label>` | `<input>` cru |
| Ícone | `<Icon icon={X} size="…" />` | `<X className="w-5 h-5" />` |
| Superfície de conteúdo | `<Card>` ou `bg-card`/`bg-popover` | `bg-white`/`bg-gray-*` |
| Texto/superfície **sobre imagem** | `text-on-dark*` + `<HeroOverlay>` | `text-white` |
| Cor de erro/sucesso/aviso | `text-destructive`/`-error`/`-success`/`-warning` | `text-red-500` |
| Animação (Framer/CSS) | `easing.*`/`duration.*` ou `var(--ease-*)`/`var(--duration-*)` | `cubic-bezier(...)` |
| Vidro/blur (chrome flutuante) | `class="glass"` | `bg-white/50 backdrop-blur` ad-hoc |
| Foco de elemento interativo custom | `focus-visible:focus-ring` | `outline`/`ring` literais |

---

## 2. Catálogo de componentes

Convenções comuns a (quase) todos: estilizados com **`cva`** (variantes) + **`cn()`**
(merge), aceitam **`className`** para override, expõem **`data-slot`** para hooks de
estilo, e os primitivos de formulário já tratam **`aria-invalid`** e **foco** inline.

### Button — `@/components/ui/button`

CTA e ações. Variante = **intenção**; size = **densidade**. `asChild` renderiza via
Radix `Slot` (use para transformar um `<Link>` em botão sem aninhar tags).

| Variante | Quando usar |
| --- | --- |
| `default` | ação primária da tela (marca; só **uma** por contexto) |
| `secondary` | ação secundária com superfície sutil |
| `outline` | ação terciária / contornada sobre fundo claro |
| `ghost` | ação de baixo peso; hover usa `accent` |
| `destructive` | ação irreversível (excluir) |
| `link` | aparência de texto; **único sem `hover:bg-*`** (ideal para wrappers de ícone, ver ThemeToggle) |

| Size | Altura | Uso |
| --- | --- | --- |
| `default` | `h-10` | padrão |
| `sm` | `h-9` | barras densas |
| `lg` | `h-12` (`text-body`) | hero/CTA destaque |
| `icon` | `size-10` | botão só-ícone (40px) |
| `clear` | — | sem padding/altura; quando o tamanho vem do `className` |

- **Não** crie um botão com `<a class="px-4 py-2 …">`; use `<Button asChild><Link/></Button>`.
- Só **um** `default` (primário) por agrupamento de ações.

### CMSLink — `@/components/Link`

Link de conteúdo vindo do CMS (resolve `reference`/`url`). `appearance`:

- `inline` (**default**) → `<Link>` puro; herda a tipografia do contexto. Use em texto
  corrido e navegação (ex.: `HeaderNavItem`).
- variante de Button (`default`/`outline`/…) → renderiza um `<Button asChild>`.

`size` espelha os sizes do Button. **Não** reimplemente resolução de href — o helper
`getNavItemHref` (Header) já segue a mesma lógica para o estado ativo.

### Card — `@/components/ui/card`

Superfície genérica (`bg-card`, `rounded-lg`, `border`, `shadow-sm`). Partes
componíveis: `Card` › `CardHeader` (`CardTitle` `type`≈`heading`, `CardDescription`
`text-body-sm`) › `CardContent` › `CardFooter`.

> **Atenção:** existe também `@/components/Card` (card de Post/listagem) e
> `@/components/ProjectCard` — esses são **de domínio** (layout fixo de mídia+título+
> resumo+tags), não o primitivo. Para um card genérico, use `ui/card`.

### Input / Textarea — `@/components/ui/{input,textarea}`

Campos de texto. Já incluem: borda `border-input`, `placeholder:text-muted-foreground`,
estados `aria-invalid:*` (anel/borda destrutivos) e foco tokenizado. Tamanho de fonte
`text-body` (mobile) → `text-body-sm` (md+). Sempre **pareie com `<Label htmlFor>`**.

### Label — `@/components/ui/label`

Radix Label. `text-body-sm font-medium`; escurece/`cursor-not-allowed` quando o
`peer` está `disabled`. Use o `htmlFor` apontando ao `id` do campo.

### Checkbox — `@/components/ui/checkbox`

Radix Checkbox `size-4`. Marca = `bg-primary`/`text-primary-foreground`. Foco e
`aria-invalid` já tratados.

### Select — `@/components/ui/select`

Radix Select. Partes: `Select` › `SelectTrigger` › `SelectContent` (`bg-popover`) ›
`SelectGroup`/`SelectLabel`/`SelectItem`. Para 0–4 opções mutuamente exclusivas e
simples, considere rádios; `Select` brilha em listas médias/longas.

### Icon — `@/components/ui/icon`

Wrapper **agnóstico de biblioteca** (hoje lucide). Use **sempre** em vez de inserir o
ícone lucide direto — centraliza tamanho e acessibilidade.

| `size` | px | Uso |
| --- | --- | --- |
| `sm` | 16 | inline em texto, botões densos |
| `md` (**default**) | 20 | ações de chrome (search/toggle) |
| `lg` | 24 | destaques |
| `xl`/`2xl` | 32/48 | ilustrativo |

- Decorativo → sem `label` (vira `aria-hidden`). Significativo → passe `label` (vira
  `role="img"` + `aria-label`).
- O tamanho vem de `--icon-*` (rem) — respeita preferência de fonte do usuário.

### Pagination — `@/components/ui/pagination`

Construído sobre `buttonVariants` (ativo = `outline`, demais = `ghost`). Marca a página
atual com `aria-current="page"`. Use nas listagens (blog, projetos).

### ScrollIndicator — `@/components/ui/scroll-indicator`

Ícone de mouse + label, no rodapé de heros. `variant` `default` (`text-on-dark/60`, para
sobre mídia) / `muted`. É **decorativo** (`aria-hidden`) — não o use como controle.

### HeroOverlay — `@/components/ui/hero-overlay`

Overlay escuro + fade inferior sobre mídia de hero. `opacity` (0–100, default 40) e
`bottomFade`. Usa `--overlay-dark`/`--overlay-fade`. **Pré-requisito** para texto legível
sobre imagem — combine com `text-on-dark*`.

### Logo / ThemeToggle

- **Logo** (`@/components/Logo`): `text-heading` (24px) `font-semibold tracking-tight`;
  compartilhado entre Header e Footer.
- **ThemeToggle** (`@/providers/Theme/ThemeToggle`): `Button variant="link"` (sem hover de
  fundo) num círculo `size-10` glass; o hover afeta **só o ícone**. Padrão de referência
  para qualquer ação-ícone de chrome.

---

## 3. Receitas por contexto

### Página (cabeçalho)

```tsx
<div className="container">
  <h1 className="type-title-sm md:type-title text-foreground">Título</h1>
  <p className="type-body-large text-muted-foreground max-w-2xl">Subtítulo…</p>
</div>
```

Conteúdo de página vive **sempre** dentro de `.container` (padding lateral tokenizado).
Não recriar `px-4 md:px-8`. Saltos de tamanho mobile→desktop via breakpoint (`md:`).

### Card / listagem

`<Card>` para superfície genérica; `@/components/Card`/`ProjectCard` para itens de
conteúdo. Título do item ≈ `type-heading`/`text-body-lg`, resumo `text-body-sm
text-muted-foreground`, tags/pills `text-scale-01`.

### Formulário

`<Label htmlFor>` + campo (`Input`/`Textarea`/`Select`) + mensagem de erro com
`text-destructive`/`text-error`. Estados inválidos: deixe o `aria-invalid` do primitivo
trabalhar — não recolora à mão.

### Conteúdo sobre mídia (hero/imagem)

```tsx
<div className="relative">
  <Media … />
  <HeroOverlay opacity={45} />
  <div className="relative">
    <h1 className="text-on-dark">…</h1>
    <p className="text-on-dark-muted">…</p>
  </div>
</div>
```

Sobre mídia o tema **não inverte** — use a família **`text-on-dark*`/`text-on-light*`**
(contraste absoluto) e `bg-background-inverse` para superfícies invertidas. **Nunca**
`text-white`.

### Navegação / chrome (Header, Footer)

`class="glass"` + `border-border/20`; ações-ícone como círculos `size-10` (ver
ThemeToggle). Nav central some em `< md` (`hidden md:flex`) e vira `MobileMenu`
(hambúrguer + painel **`bg-background` sólido**, nunca `glass` — vidro é translúcido
demais para sobrepor texto). Alinhamento por grid + `items-center`, não por margens.

### Motion / animação

```tsx
import { easing, duration } from '@/design-system/tokens/motion'
<motion.div transition={{ duration: 0.6, ease: easing.smooth }} />
```

Em CSS: `transition` com as vars `--ease-*`/`--duration-*` — ex.:
`duration-[var(--duration-normal)]`. Nunca `cubic-bezier(...)` literal. Durations:
`fast` 0.15s · `normal` 0.3s · `slow` 0.5s.

<!-- nota: exemplos de classe Tailwind arbitrária nestes docs devem usar um token
concreto (ex.: --duration-normal), nunca um glob `*` dentro de `prefix-[…]` — o
scanner do Tailwind v4 lê arquivos .md e geraria CSS inválido (`var(--duration-*)`). -->


### Vidro / superfícies flutuantes

`glass` para chrome translúcido **sobre o topo da página** (header/footer/ações). Para
**painéis sobre conteúdo** (dropdowns, menus), use superfície **sólida** (`bg-background`/
`bg-popover`) — o glass tem só ~50% de opacidade. Para empilhamento, `var(--z-dropdown)`
… `var(--z-toast)`.

---

## 4. Boas práticas transversais

- **Tema claro/escuro:** prefira tokens **semânticos** (`bg-card`, `text-foreground`) —
  eles invertem com o tema. Cores de **contraste sobre mídia** (`on-dark*`) e **glass**
  são reativas via `var(--background)`. Não escreva variantes `dark:` para cor de texto
  base; o token já resolve.
- **Acessibilidade & foco:** `focus-visible:focus-ring` em interativos custom; ícones
  significativos com `label`; decorativos com `aria-hidden`. A escala é `rem`-based de
  propósito (respeita o tamanho de fonte do navegador) — **não** fixar `font-size` no
  `<html>`.
- **Responsividade:** breakpoints tokenizados (`sm` 40rem … `2xl` 96rem). Espaçamento é a
  escala numérica do Tailwind (múltiplos de `--spacing` 0.25rem) — `gap-6`/`py-16` são
  canônicos; `gap-[13px]` não.
- **Composição:** `cn()` para mesclar classes (já estende o `tailwind-merge` para os
  utilitários de tamanho semântico — ver `utilities/ui.ts`); `cva` para variantes;
  `asChild`/`data-slot` para compor sem aninhar tags.
- **Receita vs. escape:** prefira a receita `type-*` (família+peso+tamanho+leading+
  tracking de uma vez). Só decomponha em `text-*`/`font-*`/`leading-*`/`tracking-*`
  quando a receita não couber.

---

## 5. Anti-padrões (nunca faça)

| ❌ | ✅ |
| --- | --- |
| `text-5xl`, `text-sm` | `type-title` / `type-body-small` ou `text-title`/`text-body-sm` |
| `text-white`, `bg-gray-100` | `text-on-dark` / `bg-muted` |
| `text-red-500` (erro) | `text-destructive` / `text-error` |
| `#3b82f6`, `oklch(...)` solto | token de cor (`bg-primary`, `var(--…)`) |
| `rounded-[12px]`, `text-[14px]` | `rounded-lg`/`var(--radius-*)`, `text-body-sm` |
| `cubic-bezier(0.4,0,0.2,1)` | `easing.easeInOut` / `var(--ease-in-out)` |
| `<X className="w-5 h-5"/>` | `<Icon icon={X} size="md"/>` |
| `<a class="px-4 py-2 bg-primary">` | `<Button asChild><Link/></Button>` |
| `glass` num dropdown sobre texto | `bg-background`/`bg-popover` sólido |
| editar `tokens.css`/`*.generated.ts` | editar o JSON + `bun run design:build` |

Exceções legítimas: `// design-lint-disable-line <motivo>` na linha (sempre com motivo).

---

## 6. Catálogo de tokens (referência rápida)

Fonte: `src/design-system/tokens/*.json` → `bun run design:build` → `tokens.css`.

- **Tipografia** — receitas: `type-title-hero/title/subtitle/heading/subheading/
  body-large/body/body-strong/body-small/code`. Escala `scale-01`(0.75rem)…`scale-10`
  (4.5rem). Pesos `thin`…`black` (`font-*`). Famílias `--font-sans` (Google Sans Flex) /
  `--font-mono` (Google Sans Code), donas do `next/font`.
- **Cor** (3 camadas: primitive oklch → semantic light/dark/contrast → component shadcn):
  superfícies `background/card/popover/muted/secondary`; ação `primary/accent/destructive`
  (+ `-hover`/`-active`); status `error/success/warning/info/brand`; contraste `on-dark*`/
  `on-light*`; invertido `background-inverse`/`foreground-inverse`; bordas/foco
  `border/input/ring`.
- **Motion** — `duration` instant/fast/normal/slow/slower/slowest; `easing` linear/easeIn/
  easeOut/easeInOut/smooth/snappy/emphasized; `delay` none/xs…xl.
- **Efeitos** — `shadow` 2xs…2xl; `blur` none…3xl; `alpha` 0…100; compostos `glass`,
  `overlay` (`--overlay-dark`/`--overlay-fade`).
- **Dimensão** — `radius` none/sm/base/md/lg/xl/2xl/3xl + semânticos `card`(20px)/`panel`
  (32px)/`full`; `icon` xs…2xl (`--icon-*`); `stroke` border 1px / focus-ring 2px.
- **Layout** — chrome `--header-h` (5rem), `--sidebar-w`, `--sheet-w`; `.container`
  padding 1rem→2rem (md); breakpoints sm…2xl; `z-index` dropdown…toast.
- **Espaçamento** — multiplicador único `--spacing` 0.25rem; toda a escala numérica do
  Tailwind deriva dele.

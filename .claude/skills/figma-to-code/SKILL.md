---
name: figma-to-code
description: >-
  Use when implementing a Figma design into this codebase (design-to-code):
  "Implement this design from Figma", a pasted figma.com node URL, the output of
  get_design_context / use_figma, or any task that turns a Figma component,
  screen, or token into code here. The Figma file almost always covers only part
  of what the code already has — this skill enforces partial fidelity (apply only
  what Figma confirms, never invent the rest, don't rewrite what already matches),
  makes you report Implemented / Kept / Not-implemented, AND recommends the exact
  Figma variables/styles/values to create next to close each gap. Trigger even if
  the user only pastes a Figma link or says "build this button/card from the
  design" without naming fidelity.
---

# Figma → code (partial-fidelity implementation)

The Figma file and the code are **not** mirror images. The code is the source of
truth and usually has a much richer system (cva variants, multiple sizes,
`asChild`, focus, disabled, icons) than a single Figma node, which typically shows
one variant, one size, and a couple of states. That asymmetry is normal — it is
**not** a license to fill the gaps yourself. Guessing the missing parts corrupts
the traceability the user relies on to grow the design system deliberately, and
silently changing shared variants/sizes breaks things.

So the contract is: **apply only what Figma confirms, keep everything else, and
say exactly what you did.** Then hand the user a concrete shopping list of what to
add in Figma so the design catches up to the code on its own terms.

## The rule

1. **Apply only what Figma confirms.** A property counts as "confirmed" only when
   the Figma node states it *and* the matching token/class exists in the code
   (verify — see below). Everything else stays as the code already has it.
2. **Never invent.** If Figma is silent on something, or applying it would change
   a shared variant/size/base and break other usages, do not implement it. Leave
   the code as is and report it as a gap.
3. **Don't rewrite what already matches.** If a code token already resolves to the
   Figma value, use it — don't swap it for a same-value synonym. Example in this
   repo: `--primary: var(--background-brand)` and
   `--primary-foreground: var(--foreground-on-brand)`, so `bg-primary` /
   `text-primary-foreground` *are* the brand color from Figma — keep them, don't
   change to `bg-background-brand`.
4. **Confirm before applying.** Grep the generated tokens and the DTCG source for
   the token/class the Figma code references — never assume a class exists:
   ```bash
   grep -oE "\-\-color-<name>" src/design-system/tokens.css      # color vars
   grep -nE "@utility (type-[a-z-]+)" src/design-system/tokens.css # type recipes
   ```
   The canonical consumption vocabulary lives in `docs/DESIGN-SYSTEM.md`.

## Workflow

1. **Read the Figma node** — `get_design_context` on the node URL/id. Note every
   visual property it states (color, hover, radius, typography, dimensions,
   states) and which Figma variables/styles it binds.
2. **Read the target component** in the code (e.g. `src/components/ui/<name>.tsx`).
   Map each Figma property to a code token/class.
3. **Classify each property** into one of the four buckets below. For anything you
   intend to implement, confirm the token/class exists (step 4 of the rule).
4. **Apply only the confirmed divergences**, surgically. Don't touch variants,
   sizes, or states the Figma node says nothing about.
5. **Validate**: `bunx tsc --noEmit` and `bun run lint:tokens` (the anti-hardcode
   linter — a new raw class will fail it). Both must be clean.
6. **Report in four buckets** (next section), in **pt-BR** (the user's language).

## The report — always four buckets

Deliver this every time, in Brazilian Portuguese. The first three are the
fidelity record; the fourth is the Figma shopping list the user asked for.

```
### ✅ Implementado            — o que o Figma confirmou E divergia do código
### ↔️ Mantido / já correspondia — não reescrito (token do código já = valor do Figma)
### ⛔ Não implementado          — sem correspondência: o Figma não informa
                                   (outras variantes/tamanhos/estados/foco/ícones/animação)
### 🎨 Recomendado criar no Figma — para cada lacuna do balde ⛔, o que adicionar
                                   no Figma (variável/estilo/valor ou variant property)
```

## Bucket 4 — what to recommend creating in Figma

This is the part that lets the user grow the Figma file to match the code. For
each gap in bucket ⛔, recommend the **concrete Figma artifact** to create, using
this repo's DTCG↔Figma mapping (the bridge: `scripts/figma/README.md`). Two cases:

- **The code uses a token with no Figma variable yet** → name the variable to
  create: which **collection**, **mode**, **name** (slash-separated), and **value**
  (alias to a Primitive where possible). Use the table below.
- **The variable exists but the Figma component lacks the variant/size/state** →
  recommend the **variant property** (or component state) to add to the Figma
  component, and which existing variables it should bind (e.g. "add a `Size`
  property with `sm/md/lg`, binding height/padding to `Layout`/`Spacing`/`Size`
  variables; add a `disabled` state at `--alpha-50` opacity").

Be specific and copy-pasteable: give the exact name and value, not "add a size
token". Recommend in **rem/px and oklch as the code authors them** so the user can
create them faithfully.

### Figma variable/style reference (what may be created, by collection)

| Collection  | Mode(s)      | Naming (slash)                          | Holds |
|-------------|--------------|-----------------------------------------|-------|
| Primitives  | Value        | `blue/500`, `brand/500`, `grey/900`…    | Raw color ramps (oklch→RGBA), hidden, no codeSyntax — aliasable |
| Color       | Light, Dark  | `background/*`, `foreground/*`, `border/*` | Semantic colors, **alias** to Primitives (per mode) |
| Contrast    | Absolute     | `text-on-dark*`, `text-on-light*`       | On-media contrast colors |
| Typography  | Value        | `scale/*`, `weight/*`, `line-height/*`, `letter-spacing/*`, `family/*` | Type primitives |
| Spacing     | Value        | `base`                                  | Base spacing unit (4px) |
| Size        | Value        | `icon/*`, `radius/*`, `stroke/*`        | Icon sizes, radii, stroke widths |
| Layout      | Value        | `container/*`, `structure/*`, `z/*`     | Container paddings, structural sizes, z-index |
| Effects     | Value        | `blur/*`, `alpha/*`                      | Blur radii, alpha stops |
| Motion      | Value        | `duration/*`, `delay/*`                 | Durations/delays in ms |
| **Text Styles**   | —      | `type/body`, `type/heading`, `type/body-strong`… | Bind family/weight/size/line-height/letter-spacing |
| **Effect Styles** | —      | `shadow/sm` … `shadow/2xl`              | Drop-shadow stacks |

**Do NOT recommend creating** (deliberately code-only, documented in the bridge):
`component.*` (shadcn semantic layer), `motion.easing` (cubic-bezier),
`effects.glass` / `effects.overlay` (composed `color-mix`/`var`),
`size.radius.*` authored as `calc(var(--radius)…)`, `layout.breakpoint`. If a gap
maps only to one of these, say so — the user keeps it in code on purpose.

## Worked example (the Button test, for calibration)

Figma node showed one brand button, states Default/hover.
- **✅ Implementado:** hover went from `hover:opacity-90` to
  `hover:bg-background-brand-hover` (#005dab) — Figma confirms a *color* hover, not
  opacity; class confirmed in `tokens.css`.
- **↔️ Mantido:** `rounded-full`, `bg-primary` (= `--background-brand` = #0079d8),
  `text-primary-foreground` (= `--foreground-on-brand`) — already matched.
- **⛔ Não implementado:** `type-body-strong` (16px/600) and 48px/px-16 dimensions
  belong to the `size` system, which the single Figma node doesn't map; the other
  5 variants, 5 sizes, `asChild`, focus-ring, disabled, icons, `active:scale` —
  Figma is silent.
- **🎨 Recomendado criar no Figma:** add a `Variant` property to the Button
  component with `destructive/outline/secondary/ghost/link` (bind to existing
  `Color` vars `background/destructive`, `border/*`, `background/secondary`…); add
  a `Size` property `sm/md/lg` binding height to `Layout/structure` or fixed px and
  padding to `Spacing`/`container`; add `disabled` state at `--alpha-50`; add a
  `focus` state using `border/focus` + `stroke/focus-ring`. No new *variables*
  needed for these — they already exist; only the component's properties/states do.
```

# Design System Governance

> **Read this first.** This is the entry point to the design-system docs. It defines
> *how to decide* before you touch the design system — the rules of engagement that keep
> the system consistent as it evolves. The other three docs are the **vocabulary and
> catalog**; this one is the **process**.
>
> **The quartet:**
> - **`DESIGN-SYSTEM-GOVERNANCE.md`** (this file) — process: analyze before you change.
> - [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) — consumption contract (typography, color, dimension, motion, focus).
> - [`DESIGN-SYSTEM-COMPONENTS.md`](./DESIGN-SYSTEM-COMPONENTS.md) — component catalog + recipes by context.
> - [`DESIGN-SYSTEM-LAYOUT.md`](./DESIGN-SYSTEM-LAYOUT.md) — structure/spacing + per-component audit.

The design system is the single source of truth for styling. It takes precedence over
personal preference, framework defaults, external examples, and implementation
convenience. Governance here is **lean by design**: enough discipline to prevent drift,
not so much that it blocks evolution. Scale the ceremony to the change.

## Core principle

**Reuse > extend > create.** Before adding anything — a token, component, variant,
utility, or pattern — confirm an equivalent does not already exist and cannot be reached
by composing what does. Creation is the last resort, not the first.

## Before you change anything

For any non-trivial change to the design system, run this pre-flight. It is a *lookup*,
not a ritual — most answers take seconds because the artifacts are centralized.

1. **Tokens** — is there already a token? Audit `src/design-system/tokens/*.json` (the
   DTCG source of truth) and the generated `src/design-system/tokens.css`.
2. **Components** — can an existing primitive in `src/components/ui/` be reused or composed?
3. **Utilities** — does `src/utilities/ui.ts` (`cn`), an `@utility` in `tokens.css`, or an
   existing recipe (`type-*`, `glass`, `focus-ring`) already cover it?
4. **Conventions** — does the change follow the naming already documented in the trilogy
   (semantic color, `type-*` typography, `size-*` icons, `rounded-*` radius)?
5. **Impact** — what consumes the thing you are changing? A token feeds recipes and
   `@theme`; a primitive feeds blocks/heros. Check before you alter a shared edge.

Only then implement. When the answer is "this already exists," use it.

## Token governance

Tokens are authored in JSON and compiled — **never hand-edit `tokens.css` or
`motion.generated.ts`**; change the JSON and run `bun run design:build`.

**Do not create a token reflexively.** First audit existing tokens, confirm none can be
reused, and justify the new one (what requirement the current structure cannot express).

**Prune policy — verify indirect consumption before deleting.** A token with zero *direct*
hits in `src/**/*.{tsx,css}` is **not** necessarily unused. Tokens are consumed indirectly
through:
- `@utility type-*` recipes (typography primitives: `line-height`, `letter-spacing`, `text-scale`),
- the `@theme inline` mapping and theme-reactive aliases (`semantic.dark.*`, `radius-card/panel`),
- `{…}` references from other tokens inside the JSON.

Before removing a token, grep the **generated** `tokens.css` and the JSON for its name, and
confirm it is not referenced by a recipe, `@theme`, or another token. A complete-but-
not-yet-consumed *scale* (e.g. the full `z-index`, `blur`, `alpha`, `delay` ramps) is
**designed vocabulary**, not dead weight — removing it would impede evolution. Prune only
proven dead tokens, and document the removal.

## Component governance

A new feature needing a UI element is **not** a reason to create a component. In order:

1. **Reuse** an existing primitive (`src/components/ui/`).
2. **Compose** primitives (e.g. `Card` parts, `asChild` via Radix `Slot`).
3. Add a **variant** to an existing component (`cva`) when the difference is stylistic.
4. Only then create a new component — and document why composition/variant was insufficient.

Avoid component proliferation. Style with `cn` + the design tokens; do not fork a primitive
to tweak one class.

## Lightweight change proposal

Scale the proposal to the change. A typo fix or a one-class tweak needs none. For anything
that adds/removes a token, alters a primitive's API, or introduces a pattern, state briefly:

- **Current state** — what exists (files, tokens, components, dependencies).
- **Proposed change** — what changes, why, and why existing solutions are insufficient.
- **Risk** — regressions, compatibility, consistency impact.

Then proceed. The goal is a paper trail for non-obvious decisions, not a gate on trivia.

## Regression checklist

Before considering a design-system change done, confirm it introduces no regression across:
visual · functional · accessibility · responsiveness · design consistency · naming ·
token consistency · documentation.

## Enforcement (already in place — pointers, not duplication)

This governance is backed by tooling. Details live in the trilogy and the scripts; do not
restate them here.

- **Anti-hardcode linter** — `bun run lint:tokens` (5 rules, all `error`). It blocks raw
  color, literal bezier, literal dimension, raw typography, and raw palette color. See
  [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) for the contract.
- **CI gate** — `bun run lint:tokens:check` and `bun run design:check` run in CI
  (`.github/workflows/ci.yml`); `design:check` fails if generated files are stale.
- **Escape hatch** — `// design-lint-disable-line <reason>` on the line, always with a
  reason, for the rare legitimate literal. Generated/infra files are in the linter allowlist.

## Hard constraints elsewhere

Some areas carry calibrated, inviolable rules that override convenience. The
**HighImpact hero geometry** is one: do not change CSS classes in
`src/heros/HighImpact/index.tsx` without reading the dedicated section in
[`AGENTS.md`](../AGENTS.md). When a doc says a region is deliberately calibrated, treat it
as a contract, not a suggestion.

# Ponte de tokens Figma ↔ Código

Sincronização **bidirecional** entre os tokens DTCG (`src/design-system/tokens/*.json`, a
**fonte da verdade**) e variáveis/estilos do Figma. O código manda: o Figma nunca regride o
código — o pull importa apenas edições de design deliberadas, sempre revisadas e barradas por
gates.

> **Por que toda a lógica mora aqui (e não num CLI que fala com o Figma):** a Variables REST API
> de escrita do Figma é Enterprise-only; o team é tier *student*. Logo a mutação do Figma passa
> pelo MCP `use_figma` (Plugin API, mediada pelo agente). Este módulo só produz/consome
> **artefatos JSON** determinísticos; o agente faz o I/O do estado do Figma. Isso mantém a
> transformação testável (`tests/int/figma-sync.int.spec.ts`).

## Comandos

```bash
bun run design:figma:plan          # JSON DTCG → tokens.figma-plan.json (VariablePlan)
bun run design:figma:diff <dump>   # relatório add/update/remove (plano vs dump do Figma)
bun run design:figma:pull <dump>   # merge cirúrgico do dump nos JSON (reescreve só o que mudou)
```

Os artefatos (`tokens.figma-plan.json`, `tokens.figma-dump.json`) são gitignored.

## Módulos

| Arquivo | Papel |
|---|---|
| `dtcg.ts` | Carrega/percorre a árvore DTCG; caminhos dotted, refs `{…}`. |
| `oklch.ts` | oklch ↔ sRGB (lossy fora do gamut) e rem/em ↔ px/%. |
| `mapping.ts` | **Spec declarativa** DTCG ↔ Figma (coleções, modos, scopes, codeSyntax, renames). Única fonte das regras de naming — derivadas de `build-tokens.ts`. |
| `plan-types.ts` | Contrato agente ↔ código: `VariablePlan` (push) e `FigmaDump` (pull). |
| `tokens-to-figma-plan.ts` | DTCG → `VariablePlan` determinístico (+ parsing de shadow). |
| `figma-to-tokens.ts` | `FigmaDump` → merge cirúrgico (canonical-echo + detecção de divergência). |
| `sync.ts` | CLI `plan`/`diff`/`pull` + `dumpFromPlan` + serializador DTCG. |

## Mapa (foundations)

- `colors.primitive.*` → coleção **Primitives** (oklch→RGBA, ocultas, sem codeSyntax — aliasáveis).
- `colors.semantic.light/dark.*` → coleção **Color** (modos Light/Dark), valor = **alias** p/ Primitives.
- `colors.semantic.contrast.*` → coleção **Contrast** (modo Absolute), alias.
- `typography.{family,scale,weight,line-height,letter-spacing}` → **Typography**; semânticos (`body`/`heading`/…) → **Text Styles** (`type-*`).
- `spacing`/`size`/`layout`/`effects.{blur,alpha}`/`motion.{duration,delay}` → coleções homônimas.
- `effects.shadow.*` → **Effect Styles**.
- **Fora** (code-only, documentado): `colors.component.*` (shadcn), `motion.easing`, `effects.glass/overlay`, `size.radius.*` em `calc()`, `layout.breakpoint`.

## Fluxo do agente (push/pull via MCP)

**Push (código → Figma):**
1. `bun run design:figma:plan` → `tokens.figma-plan.json`.
2. Agente carrega `/figma-use` + `/figma-generate-library`, lê o estado (`get_variable_defs`).
3. `bun run design:figma:diff tokens.figma-dump.json` → revisar.
4. Aplica via `use_figma` em ordem de dependência: **Primitives → Color/Contrast/… → Text/Effect Styles**. Idempotente por lookup de nome. Deletes só com confirmação explícita.

**Pull (Figma → código):**
1. Agente lê todas as variáveis → `tokens.figma-dump.json`.
2. `bun run design:figma:pull tokens.figma-dump.json` → merge só do que divergiu.
3. **Gates obrigatórios** antes de commitar: `design:build && design:check && lint:tokens:check && test:int`.

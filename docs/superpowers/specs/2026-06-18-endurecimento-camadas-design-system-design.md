# Endurecimento das camadas de tokens + contrato de consumo

**Data:** 2026-06-18
**Status:** Aprovado (brainstorming) — pronto para o plano de implementação
**Escopo:** camadas de tokens, pipeline de build, Tailwind v4 e a trava de consumo.
**Fora de escopo:** refatoração visual de componentes/blocos/heros (etapa seguinte).

## Contexto e motivação

O objetivo declarado é deixar as camadas de **tokens** e **Tailwind v4** robustas e
consistentes **antes** de refatorar componentes, blocos, layouts e seções.

A auditoria do estado atual mostrou que a **infra de tokens já é madura**:

- Pipeline DTCG (`scripts/build-tokens.ts`) com resolução de `{refs}` com guarda de
  ciclo, pré-validação agregada de referências, dedup com detecção de conflito,
  ordenação determinística, guarda de órfãos (`REQUIRED_VARS`), aliases shadcn
  validados em light **e** dark, `motion.generated.ts` tipado e modo `--check` no CI.
- Três camadas de cor coerentes (primitive oklch → semantic light/dark/contrast →
  component shadcn) com estados `-hover`/`-active`.
- Cobertura ampla: radius (com `card`/`panel` semânticos), icon, stroke, z-index
  semântico, shadow, blur, alpha, glass, overlay, breakpoints, container.
- Linter anti-hardcode estrito (`scripts/lint-tokens.ts`) com núcleo puro testável.
- Estado verde hoje: `design:check` sincronizado e `lint:tokens` com 0 violações.

O gap real **não é a infra** — é o **contrato de consumo** e o **ponto cego da trava**:

1. **Tipografia semântica criada, mas com adoção zero.** As receitas `@utility type-*`
   (`type-title-hero`, `type-body`…) têm **0 usos**. O código aplica classes Tailwind
   cruas de tamanho/peso: `text-sm` (23×), `font-medium` (11×), `text-5xl`,
   `font-extrabold`… (~75 ocorrências).
2. **Cor: adoção semântica boa (~140 usos), mas com vazamentos crus** (~20): `text-white`
   (7×), `bg-white` (5×), `text-black`, `bg-black`, `border-white`, e um `text-red-500`
   solto (bug de tema: não inverte no dark).
3. **O linter tem ponto cego.** Ele bloqueia literais (`#hex`, `cubic-bezier`, `px`
   arbitrário), mas **não** barra classes Tailwind que driblam a semântica
   (`text-5xl`, `text-white`). Por isso `lint:tokens` está verde apesar das
   inconsistências acima.
4. **Dois micro-acoplamentos internos do pipeline:** as receitas `type-*` fixam
   `leading`/`tracking` no script (e não no JSON), e o `prose` (`tailwind.config.mjs`)
   hardcoda `fontWeight`/`letterSpacing` em vez de consumir os tokens de peso/tracking.

**Tese:** a robustez estrutural já existe; falta o **contrato de consumo** (vocabulário
canônico) e a **trava que o protege** (linter fechando o ponto cego), além de eliminar
os micro-acoplamentos para que a tipografia seja 100% definida no JSON.

## Decisões tomadas (brainstorming)

| Decisão | Escolha |
| --- | --- |
| Alvo do trabalho | **Auditoria completa**: endurecer a infra **e** estabelecer contrato + trava. |
| Tipografia canônica | **`type-*` como padrão**, com escape componível via `text-*`/`font-*`/`leading-*`/`tracking-*`. |
| Estratégia de entrega | **Gradual / progressiva**: novas regras do linter como `warning`, promovidas a `error` quando o consumo zerar. CI verde em cada passo. |
| Cor "sobre mídia/invertido" | **Híbrido**: tokenizar onde há contrapartida semântica; anotar com `design-lint-disable-line <motivo>` os intencionais. |

## Princípios de design

- **JSON é a única fonte da verdade.** Nenhum estilo tipográfico canônico (família,
  peso, tamanho, line-height, letter-spacing) pode ser decidido fora do JSON após este
  trabalho.
- **A trava guia, não bloqueia.** As regras novas entram como `warning` para que a
  refatoração de componentes seja conduzida pela lista de avisos, sem quebrar o CI.
- **YAGNI.** Não adicionar tokens que não têm consumidor imediato (shadow semântico,
  estados disabled/selected) — o relatório `--report` já vigia órfãos de cor.
- **PRs pequenos, CI verde em cada um.** Branch de trabalho: `develop`.

## Frente A — Endurecer a infra (JSON + pipeline + prose)

### A1. Mover `leading`/`tracking` das receitas para o JSON

**Hoje:** `TYPE_RECIPES` em `scripts/build-tokens.ts` fixa `leading`/`tracking` por
receita (ex.: `title-hero` → `leading: 'tight'`, `tracking: 'tight'`).

**Mudança:** cada grupo semântico de `src/design-system/tokens/typography.json` (`body`,
`code`, `heading`, `subheading`, `subtitle`, `title-page`, `title-hero`) passa a declarar
`line-height` e `letter-spacing` como sub-tokens referenciando os primitivos via `var()`
(mesmo padrão já usado por `font-family`/`font-weight`/`size-*`). Exemplo para
`title-hero`:

```json
"title-hero": {
  "font-family": { "$type": "fontFamily", "$value": "var(--font-sans)" },
  "font-weight": { "$type": "fontWeight", "$value": "var(--weight-bold)" },
  "size": { "$type": "dimension", "$value": "var(--text-scale-10)" },
  "line-height": { "$type": "number", "$value": "var(--line-height-tight)" },
  "letter-spacing": { "$type": "dimension", "$value": "var(--letter-spacing-tight)" }
}
```

O `build-tokens.ts` passa a derivar as receitas `@utility type-*` lendo `line-height` e
`letter-spacing` do grupo semântico no JSON, em vez do array hardcoded. O mapeamento
size→receita já existente é preservado.

**Resultado:** `type-*` (recipe), `leading-*`/`tracking-*` (utilities) e o `prose`
derivam todos do mesmo nó semântico no JSON. Última fonte dupla de verdade tipográfica
eliminada.

### A2. Desacoplar o `prose`

Em `tailwind.config.mjs`, trocar os literais por CSS vars de token:

- `fontWeight: '800'` → `var(--weight-extra-bold)`
- `fontWeight: '600'` → `var(--weight-semibold)`
- `fontWeight: '500'` (link) → `var(--weight-medium)`
- `letterSpacing: '-0.025em'` → `var(--letter-spacing-tight)`

O prose passa a consumir os **mesmos** tokens de peso/tracking que o resto (hoje só
consome os de tamanho via `--text-scale-*`). Mantém a regra do projeto: o
`tailwind.config.mjs` referencia CSS vars, nunca a forma interna do JSON.

### A3. `@utility focus-ring` (gap de cobertura com valor real)

Adicionar ao `build-tokens.ts` um utilitário composto que combina cor de anel (`ring`)
e espessura (`stroke.focus-ring`, 2px), para padronizar foco/acessibilidade na
refatoração:

```css
@utility focus-ring {
  outline: var(--stroke-focus-ring) solid var(--ring);
  outline-offset: var(--stroke-focus-ring);
}
```

(Forma final validada na implementação — pode usar `box-shadow`/`ring` conforme o padrão
shadcn já adotado no projeto.) **Não** adicionar shadow semântico nem tokens de estado
disabled/selected nesta fase.

## Frente B — Contrato de consumo (doc normativo)

Criar **`docs/DESIGN-SYSTEM.md`**: guia curto e normativo de "como estilizar neste
projeto", que define o que a trava do linter passa a cobrar.

| Eixo | Canônico | Proibido (vira warning → error) |
| --- | --- | --- |
| Tipografia | `type-*` (padrão); escape componível `text-*`/`font-*`/`leading-*`/`tracking-*` | `text-5xl`, `font-bold` crus |
| Cor | semânticos shadcn (`text-foreground`, `bg-card`, `text-muted-foreground`…); contraste (`--text-on-dark`) / superfície invertida sobre mídia | `text-white`, `bg-gray-500` crus |
| Dimensão | escalas (`rounded-*`/`var(--radius-card)`, `size-*` de ícone) | `rounded-[12px]`, `text-[14px]` |
| Motion | `easing.*`/`duration.*` (`@/design-system/tokens/motion`) ou `var(--ease-*)` | `cubic-bezier(...)` literal |
| Exceção | `// design-lint-disable-line <motivo>` | exceção sem motivo |

O doc também registra o **"definition of done" da consistência**: as regras
`no-raw-typography` e `no-raw-color` são promovidas de `warning` a `error` quando o
consumo zerar.

Referenciar `docs/DESIGN-SYSTEM.md` em `CLAUDE.md` (seção "Design system") como a fonte
do contrato.

## Frente C — Trava do linter (gradual) + vazamentos baratos

### C1. Duas regras novas em `scripts/lint-tokens.ts` (severidade `warning`)

- **`no-raw-typography`** — em `.tsx`, classes Tailwind cruas de tamanho de fonte
  (`text-(xs|sm|base|lg|xl|2xl…9xl)`) e de peso (`font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)`).
  Mensagem: "use `type-*` ou os utilitários semânticos `text-*`/`font-*`".
- **`no-raw-color`** — em `.tsx`, classes de paleta Tailwind crua
  (`(text|bg|border|ring|fill|stroke|from|to|via)-(white|black|gray|grey|zinc|slate|neutral|stone|red|green|blue|yellow|emerald|sky…)(-[0-9]{2,3})?`).
  Mensagem: "use token semântico (`text-foreground`, `bg-card`…) ou de contraste
  (`--text-on-dark`)".

Ambas respeitam o escape `design-lint-disable-line` e a `FILE_ALLOWLIST` existentes.
Cuidados de calibração:

- **Não** sinalizar os utilitários **semânticos** permitidos: `text-foreground`,
  `text-muted-foreground`, `text-primary`, `text-body`, `text-heading`, `type-*`,
  `font-sans`/`font-mono` etc. (a regra mira apenas a paleta crua e os tamanhos/pesos
  nativos do Tailwind).
- **Não** sinalizar `text-on-*` (tokens de contraste) nem variações de opacidade
  semântica.
- Larguras de medida (`max-w-[*rem]`) permanecem fora, como já é hoje.

### C2. Corrigir os vazamentos baratos e inequívocos agora

- **`src/blocks/Form/Error/index.tsx:11`** — `text-red-500` → `text-error` (ou
  `text-destructive`, conforme o token semântico de erro de formulário). **Bug de tema
  real** (não inverte no dark).
- **Casos "sobre mídia/invertido"** (tratamento **híbrido**):
  - **Tokenizar** onde há contrapartida semântica clara — usar `background.inverse` /
    `foreground.inverse` (já existentes em `colors.json`) e os tokens de contraste
    `--text-on-dark` / `on-dark-muted` / `on-dark-subtle`. Candidatos:
    `src/components/ui/scroll-indicator.tsx` (`text-white/60`),
    `src/heros/ProjectHero/DynamicTechBadge.tsx` (`bg-white/10 border-white/20`),
    `src/blocks/Code/Component.client.tsx` (`bg-black`, `text-white/25`).
  - **Anotar** com `// design-lint-disable-line <motivo>` os genuinamente intencionais:
    `src/heros/ProjectHero/DynamicProjectHeroContent.tsx` (CTA invertido, **já
    comentado como proposital**), `src/components/AdminBar/index.tsx` (chrome preto fixo
    do admin).
  - A decisão tokenizar-vs-anotar de cada ocorrência é validada na implementação; o
    spec fixa apenas a política (híbrida) e os candidatos.

### C3. Checklist viva + promoção

As ~95 ocorrências restantes (tipografia crua + cor crua não tratadas agora) ficam como
**warnings** — a lista que guia a refatoração de componentes. Quando o consumo zerar,
virar `RULE_SEVERITY` das duas regras para `error` (registrado no `docs/DESIGN-SYSTEM.md`).

## Testes

- Estender `tests/int/lint-tokens.int.spec.ts`:
  - `no-raw-typography`: positivos (`text-5xl`, `font-bold`) e negativos (`type-body`,
    `text-foreground`, `text-heading`, escape inline, arquivo da allowlist).
  - `no-raw-color`: positivos (`text-white`, `bg-gray-500`, `text-red-500`) e negativos
    (`text-muted-foreground`, `bg-card`, `text-on-dark`, escape inline).
- Guard tipográfico: teste que valida que **todo** grupo semântico de tipografia possui
  `line-height` e `letter-spacing` após a migração ao JSON (evita regressão A1).
- Gate final por PR: `bun run design:check`, `bun run lint`, `bun run lint:tokens`,
  `bunx tsc --noEmit`, `bun run test:int` — todos verdes.

## Sequência de entrega (5 PRs, branch `develop`)

1. `refactor(design-system)`: A1 (leading/tracking → JSON + build lê do JSON) + A2 (prose
   desacoplado) + guard tipográfico de teste. Rodar `design:build` e commitar gerados.
2. `feat(design-system)`: A3 (`@utility focus-ring`) + eventual token/utilitário de
   superfície invertida usado em C2.
3. `docs(design-system)`: B (`docs/DESIGN-SYSTEM.md`) + referência no `CLAUDE.md`.
4. `feat(design-system)`: C1 (2 regras do linter como `warning`) + testes.
5. `fix(design-system)`: C2 (vazamentos baratos: `text-red-500` + tokenização/anotação
   dos casos sobre mídia).

Etapa seguinte (fora deste spec): refatoração de componentes guiada pelos warnings,
encerrando com a promoção do linter para `error`.

## Critérios de sucesso

- `design:check`, `lint`, `lint:tokens`, `tsc --noEmit`, `test:int` verdes em cada PR.
- Tipografia semântica 100% definida no JSON; **nenhum** literal de
  leading/tracking/weight no `build-tokens.ts` nem no `tailwind.config.mjs`.
- `docs/DESIGN-SYSTEM.md` publicado e referenciado no `CLAUDE.md`.
- Linter detecta tipografia/cor crua (`warning`), com testes de positivo e negativo.
- `text-red-500` corrigido; casos sobre-mídia tokenizados ou anotados com motivo.
- `type-*` adotado nos pontos que hoje usam `text-5xl`/`text-4xl` (heros), como prova de
  uso do canônico.

## Riscos e mitigações

- **Migração A1 altera o `tokens.css` gerado** → `design:check` falharia se os gerados
  não forem recommitados. Mitigação: rodar `design:build` e commitar no mesmo PR; o guard
  de CI valida.
- **Falsos-positivos do `no-raw-color`** (ex.: classes que contêm `to`/`via` em outro
  contexto) → calibrar as regex com fronteira de palavra e testes de negativo antes de
  ligar; começar como `warning` limita o impacto.
- **`@utility focus-ring` divergir do padrão shadcn** já usado (`ring`/`ring-offset`) →
  alinhar a forma final ao que os componentes shadcn do projeto já esperam.

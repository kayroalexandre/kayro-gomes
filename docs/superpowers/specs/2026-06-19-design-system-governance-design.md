# Design — Governança do Design System + saneamento mínimo

**Data:** 2026-06-19
**Branch base:** `develop` (worktree `ds-governance`)
**Escopo aprovado:** Opção A — governança + 4 fixes seguros; poda de tokens vira *política documentada*, não deleção.

## Contexto / problema

A proposta de "Design System Governance and Enforcement Rules" pede um regime de
governança (analise-antes-de-mudar, no-duplication, justifique novo token/componente,
change-proposal, regression-prevention). A auditoria mostrou que a **camada técnica já
existe e é madura**:

- Pipeline de tokens DTCG (`tokens/*.json` → `build-tokens.ts` → `tokens.css` + `motion.generated.ts`).
- Linter anti-hardcode `scripts/lint-tokens.ts` com **5 regras, todas `error`**, gated no CI (`lint:tokens:check`).
- 11 primitivos `src/components/ui/` (cva + `cn`), `src/utilities/ui.ts`.
- Trilogia `docs/DESIGN-SYSTEM{,-COMPONENTS,-LAYOUT}.md`.

**A lacuna real é de processo**, não de código: nenhum documento canônico codifica *como
decidir* antes de tocar no DS. A proposta também expõe 3 inconsistências menores.

### Falsos positivos rejeitados (proteção anti-regressão)

A auditoria de "órfãos" reportou ~41% dos tokens sem uso. **Rejeitado:** a maioria é
consumo **indireto** — `semantic.dark.*`, primitivos `line-height`/`letter-spacing`/
`text-scale` e `radius-card/panel` são consumidos *dentro* do CSS gerado (receitas
`@utility type-*`, `@theme inline`, aliases reativos a tema). Deletá-los quebraria tema
escuro e tipografia. Não serão tocados.

Também **não** se mexe em: variantes "não usadas" do Button (API pública shadcn —
removê-las impede personalização) e `FONT_SIZE_TOKENS` (não é bug: `text-*` = tamanho,
`type-*` = receita; a lista está correta para o `tailwind-merge`).

## Deliverables

### 1. `docs/DESIGN-SYSTEM-GOVERNANCE.md` (novo, em inglês)

Documento de governança conciso — o **"leia primeiro"** da trilogia (vira quarteto). Em
inglês porque é instrução de agente/contribuidor (regra do `CLAUDE.md`). **Não duplica** a
trilogia: linka para ela. Estrutura:

1. **Core principle** — reuse > extend > create; o DS precede preferência/conveniência.
2. **Before you change anything (pre-flight)** — checklist curto mapeado aos artefatos
   reais (onde auditar tokens, componentes, utilitários, docs, naming).
3. **Token governance** — auditar antes de criar; **prune policy**: como verificar
   consumo *indireto* (grep no `tokens.css` gerado + `@theme` + referências `{…}`) antes de
   remover; tokens de escala completos mas não consumidos = vocabulário projetado, não
   removível por padrão.
4. **Component governance** — reuse → compose → variant → (só então) novo; cite cva/`cn`/asChild.
5. **Lightweight change proposal** — o que apresentar antes de mudanças não triviais
   (current state / proposed change / risk). Escala com o tamanho da mudança — mudanças
   triviais não exigem proposta formal.
6. **Regression checklist** — visual/funcional/a11y/responsivo/consistência/naming/token/doc.
7. **Enforcement já existente** — ponteiros para linter (`lint:tokens`), CI, `design-lint-disable-line`, trilogia. (Referência, não reescrita.)

Tom: imperativo e curto. Meta: caber em ~1 leitura; reduzir custo cognitivo, não criar burocracia.

### 2. Fix `.github/workflows/ci.yml:26`

`name: Design tokens lint (uso — cor/bezier bloqueiam, dimensão avisa)` está **stale**
(`no-literal-dimension` é `error` desde 2026-06-19, assim como tipografia/cor crua).
Trocar para refletir que as 5 regras bloqueiam o CI.

### 3. Fix `docs/DESIGN-SYSTEM-LAYOUT.md:140`

Nota `useHeaderContrast.ts parece órfão` referencia arquivo **inexistente** no código.
Resolver a pendência: remover a nota (o arquivo já não existe — TODO concluído).

### 4. Simplificar `src/components/ui/label.tsx`

`labelVariants = cva('…')` **sem nenhuma variante** — over-engineering. Trocar por
constante string simples e remover o import de `cva`/`VariantProps`. Comportamento e
classes idênticos (zero mudança visual). Reduz complexidade.

### 5. Ligações cruzadas

Adicionar 1 linha de ponteiro para o novo doc no topo da trilogia
(`DESIGN-SYSTEM.md`) e em `AGENTS.md`, para que seja descoberto. Sem reescrever conteúdo.

## Risk assessment

- **Regressão visual:** nula. (3) e (4) não mudam classes renderizadas; (1)(2)(5) são docs/comentário.
- **Divergência shadcn:** evitada — não tocamos no padrão de focus-ring/aria-invalid dos primitivos (ficou fora da Opção A).
- **Proliferação de docs:** mitigada — doc único, conciso, que *substitui* dispersão por um ponto de entrada e linka o resto.
- **Naming/token consistency:** preservada — nenhum token criado/removido.

## Verificação

- `bun run design:check` e `bun run lint:tokens:check` → verde (garante que (4) não introduz literal).
- `bunx tsc --noEmit` → verde (garante que remover `cva`/`VariantProps` de `label.tsx` não quebra tipos).
- `bun run lint` → verde.
- Revisão visual: nenhuma esperada; confirmar que `Label` renderiza idêntico.

## Fora de escopo (vira política no doc, não ação)

- Poda de `delay-*`/`alpha-*`/`blur-*`/`z-index-*` (vocabulário projetado).
- Extração de `@utility` para form-control (custo de divergência shadcn).
- Auditoria de layout dos componentes ainda pendentes no `LAYOUT.md` (Footer 🟡, etc.).

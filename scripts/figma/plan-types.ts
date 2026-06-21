/* =========================================================================
   Contrato agente ↔ código: o "VariablePlan" (push) e o "FigmaDump" (pull).
   -------------------------------------------------------------------------
   O código TS produz o VariablePlan a partir dos JSON DTCG; o agente o traduz
   1:1 em chamadas use_figma (cria/atualiza coleções, variáveis, estilos). Na
   volta, o agente lê o estado do Figma e entrega um FigmaDump, que o código
   funde de volta nos JSON (merge cirúrgico). Nenhuma decisão de mapeamento
   mora no agente — só I/O do estado do Figma.
   ========================================================================= */
import type { TokenFile } from './dtcg'

export const PLAN_VERSION = 1

export type FigmaVarType = 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN'

/** Valor de uma variável em um modo específico. */
export type PlanValue =
  | { kind: 'alias'; collection: string; name: string } // VARIABLE_ALIAS
  | { kind: 'color'; rgba: [number, number, number, number] }
  | { kind: 'float'; value: number }
  | { kind: 'string'; value: string }

export type PlanVariable = {
  /** Nome slash-separated dentro da coleção (ex. "background/primary"). */
  name: string
  type: FigmaVarType
  scopes: string[]
  codeSyntax?: { WEB: string }
  hiddenFromPublishing?: boolean
  /** Procedência DTCG p/ o merge reverso: arquivo + caminho dotted da folha. */
  source: { file: TokenFile; path: string }
  /** Literal $value DTCG original (string|number) — âncora do round-trip lossless. */
  canonical: string | number
  valuesByMode: Record<string, PlanValue>
  checksum: string
}

export type PlanCollection = {
  name: string
  modes: string[]
  variables: PlanVariable[]
}

/** Estilos de texto (type-*) — push-only no v1 (não participam do merge reverso). */
export type PlanTextStyle = {
  name: string // "type/body", "type/heading", …
  fontFamilyVar: string // nome da variável Typography a bindar
  fontWeightVar: string
  fontSizeVar: string
  lineHeightVar: string
  letterSpacingVar: string
}

/** Estilos de efeito (shadow/*) — push-only no v1. */
export type PlanEffectStyle = {
  name: string // "shadow/md"
  source: { file: TokenFile; path: string }
  canonical: string
  layers: ShadowLayer[]
}
export type ShadowLayer = {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: [number, number, number, number] // rgba 0–1
}

/** Token deliberadamente fora do Figma (documentado, não sincronizado). */
export type ExcludedToken = {
  source: { file: TokenFile; path: string }
  canonical: string | number
  reason: string
}

export type VariablePlan = {
  version: number
  /** Hash de todos os JSON fonte — paridade global pós-push. */
  sourceChecksum: string
  collections: PlanCollection[]
  textStyles: PlanTextStyle[]
  effectStyles: PlanEffectStyle[]
  excluded: ExcludedToken[]
}

/* ------------------------------- Pull --------------------------------- */

/** Uma variável lida do Figma pelo agente (via get_variable_defs / script). */
export type FigmaDumpVariable = {
  collection: string
  name: string
  /** Valor de exibição por modo, como o Figma o reporta. */
  valuesByMode: Record<string, PlanValue>
}

export type FigmaDump = {
  variables: FigmaDumpVariable[]
}

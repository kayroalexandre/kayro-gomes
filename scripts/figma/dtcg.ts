/* =========================================================================
   Leitura e travessia da árvore DTCG (fonte da verdade).
   -------------------------------------------------------------------------
   Espelha as primitivas de build-tokens.ts (isLeaf/isMeta), mas expõe o
   caminho DOTTED completo de cada folha (ex. "primitive.brand.500") — o
   build-tokens achata em kebab; aqui precisamos do caminho estrutural para o
   mapa Figma e para o merge cirúrgico reverso.
   ========================================================================= */
import fs from 'fs'
import path from 'path'

export type Leaf = { $value: string | number; $type?: string; $description?: string }

export const isMeta = (k: string) => k.startsWith('$')
export const isLeaf = (n: unknown): n is Leaf =>
  !!n && typeof n === 'object' && '$value' in (n as Record<string, unknown>)

export const TOKEN_FILES = [
  'colors.json',
  'typography.json',
  'motion.json',
  'spacing.json',
  'size.json',
  'layout.json',
  'effects.json',
] as const
export type TokenFile = (typeof TOKEN_FILES)[number]

export function tokensDir(): string {
  return path.resolve('src/design-system/tokens')
}

export function loadTokenFile(file: TokenFile): Record<string, any> {
  return JSON.parse(fs.readFileSync(path.join(tokensDir(), file), 'utf-8'))
}

export function loadAllTokens(): Record<TokenFile, Record<string, any>> {
  const out = {} as Record<TokenFile, Record<string, any>>
  for (const f of TOKEN_FILES) out[f] = loadTokenFile(f)
  return out
}

export type WalkedLeaf = { file: TokenFile; path: string; leaf: Leaf }

/** Percorre uma árvore de tokens emitindo cada folha com seu caminho dotted. */
export function walkLeaves(tree: Record<string, any>, file: TokenFile): WalkedLeaf[] {
  const out: WalkedLeaf[] = []
  const recurse = (node: Record<string, any>, prefix: string) => {
    for (const [key, child] of Object.entries(node)) {
      if (isMeta(key)) continue
      const p = prefix ? `${prefix}.${key}` : key
      if (isLeaf(child)) out.push({ file, path: p, leaf: child })
      else if (child && typeof child === 'object') recurse(child, p)
    }
  }
  recurse(tree, '')
  return out
}

/** Resolve um nó por caminho dotted dentro de uma árvore. */
export function getNode(tree: Record<string, any>, dotted: string): unknown {
  let cur: any = tree
  for (const part of dotted.split('.')) {
    if (cur && typeof cur === 'object' && part in cur) cur = cur[part]
    else return undefined
  }
  return cur
}

/** Extrai o alvo de uma referência DTCG "{primitive.grey.50}" → "primitive.grey.50". */
export function refTarget(value: string | number): string | null {
  if (typeof value !== 'string') return null
  const m = value.match(/^\{([^}]+)\}$/)
  return m ? m[1] : null
}

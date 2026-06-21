/* =========================================================================
   CLI orquestrador da ponte de tokens Figma. NÃO fala com o Figma — só produz/
   consome artefatos JSON (o agente faz o I/O via use_figma).
   -------------------------------------------------------------------------
     plan            → gera tokens.figma-plan.json (VariablePlan determinístico)
     diff <dump>     → relatório add/update/remove (plano atual vs dump do Figma)
     pull <dump>     → merge cirúrgico do dump nos JSON DTCG (reescreve só o que mudou)
   ========================================================================= */
import fs from 'fs'
import path from 'path'

import { TOKEN_FILES, type TokenFile, loadTokenFile } from './dtcg'
import { mergeDumpIntoTokens, type TokenTrees } from './figma-to-tokens'
import type { FigmaDump, FigmaDumpVariable, VariablePlan } from './plan-types'
import { buildPlan } from './tokens-to-figma-plan'

const PLAN_PATH = path.resolve('tokens.figma-plan.json')

/** Converte um VariablePlan no FigmaDump equivalente (valores de exibição). */
export function dumpFromPlan(plan: VariablePlan): FigmaDump {
  const variables: FigmaDumpVariable[] = []
  for (const col of plan.collections) {
    for (const v of col.variables) {
      variables.push({ collection: col.name, name: v.name, valuesByMode: v.valuesByMode })
    }
  }
  return { variables }
}

function loadTrees(): TokenTrees {
  const trees = {} as TokenTrees
  for (const f of TOKEN_FILES) trees[f] = loadTokenFile(f)
  return trees
}

/* ---------- Serializador DTCG: folhas inline, grupos multi-linha --------- */
export function stringifyDtcg(obj: unknown): string {
  return render(obj, 0) + '\n'
}
function render(node: unknown, indent: number): string {
  if (node === null || typeof node !== 'object') return JSON.stringify(node)
  if (Array.isArray(node)) return JSON.stringify(node)
  const entries = Object.entries(node as Record<string, unknown>)
  const allPrimitive = entries.every(([, v]) => v === null || typeof v !== 'object')
  if (allPrimitive) {
    // Folha (ou nó só de metadados): inline.
    return `{ ${entries.map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(', ')} }`
  }
  const pad = '  '.repeat(indent + 1)
  const close = '  '.repeat(indent)
  const body = entries
    .map(([k, v]) => `${pad}${JSON.stringify(k)}: ${render(v, indent + 1)}`)
    .join(',\n')
  return `{\n${body}\n${close}}`
}

/* ------------------------------- Comandos -------------------------------- */
function cmdPlan() {
  const plan = buildPlan()
  fs.writeFileSync(PLAN_PATH, JSON.stringify(plan, null, 2) + '\n', 'utf-8')
  const nVars = plan.collections.reduce((n, c) => n + c.variables.length, 0)
  console.log(`✓ Plano gerado: ${path.relative(process.cwd(), PLAN_PATH)}`)
  console.log(`  coleções: ${plan.collections.length} | variáveis: ${nVars}`)
  console.log(`  text styles: ${plan.textStyles.length} | effect styles: ${plan.effectStyles.length}`)
  console.log(`  excluídos (code-only): ${plan.excluded.length}`)
  console.log(`  sourceChecksum: ${plan.sourceChecksum}`)
  for (const c of plan.collections) {
    console.log(`    - ${c.name} [${c.modes.join(', ')}]: ${c.variables.length} vars`)
  }
}

function readDump(file: string): FigmaDump {
  return JSON.parse(fs.readFileSync(path.resolve(file), 'utf-8'))
}

function cmdDiff(dumpFile: string) {
  const plan = buildPlan()
  const want = dumpFromPlan(plan)
  const got = readDump(dumpFile)
  const wantKeys = new Map(want.variables.map((v) => [`${v.collection}/${v.name}`, v]))
  const gotKeys = new Map(got.variables.map((v) => [`${v.collection}/${v.name}`, v]))

  const toCreate = [...wantKeys.keys()].filter((k) => !gotKeys.has(k))
  const toRemove = [...gotKeys.keys()].filter((k) => !wantKeys.has(k))
  const toUpdate = [...wantKeys.keys()].filter(
    (k) => gotKeys.has(k) && JSON.stringify(wantKeys.get(k)!.valuesByMode) !== JSON.stringify(gotKeys.get(k)!.valuesByMode),
  )

  console.log(`Diff plano → Figma:`)
  console.log(`  criar:    ${toCreate.length}`)
  console.log(`  atualizar:${toUpdate.length}`)
  console.log(`  remover (órfãos no Figma): ${toRemove.length}`)
  for (const k of toCreate) console.log(`    + ${k}`)
  for (const k of toUpdate) console.log(`    ~ ${k}`)
  for (const k of toRemove) console.log(`    - ${k} (use --prune p/ remover)`)
}

function cmdPull(dumpFile: string) {
  const dump = readDump(dumpFile)
  const trees = loadTrees()
  const { changes, orphans } = mergeDumpIntoTokens(dump, trees)

  if (orphans.length) {
    console.warn(`⚠ ${orphans.length} variáveis do Figma sem caminho DTCG (ignoradas):`)
    for (const o of orphans) console.warn(`    ${o}`)
  }
  if (!changes.length) {
    console.log('✓ Sem divergências: o Figma está alinhado ao código (no-op).')
    return
  }

  const byFile = new Map<TokenFile, typeof changes>()
  for (const ch of changes) {
    const list = byFile.get(ch.file) ?? []
    list.push(ch)
    byFile.set(ch.file, list)
  }
  for (const [file, fileChanges] of byFile.entries()) {
    fs.writeFileSync(
      path.resolve('src/design-system/tokens', file),
      stringifyDtcg(trees[file]),
      'utf-8',
    )
    console.log(`✎ ${file}: ${fileChanges.length} token(s) atualizado(s)`)
    for (const ch of fileChanges) console.log(`    ${ch.path}: ${ch.from} → ${ch.to}`)
  }
  console.log('\n⚠ Revise o diff e rode os gates antes de commitar:')
  console.log('   bun run design:build && bun run design:check && bun run lint:tokens:check && bun run test:int')
}

// Só executa o CLI quando invocado diretamente (bun scripts/figma/sync.ts …).
// Importado por testes/outros módulos, NÃO dispara o dispatch.
if (import.meta.main) {
  const [cmd, arg] = process.argv.slice(2)
  try {
    if (cmd === 'plan') cmdPlan()
    else if (cmd === 'diff') {
      if (!arg) throw new Error('uso: sync.ts diff <dump.json>')
      cmdDiff(arg)
    } else if (cmd === 'pull') {
      if (!arg) throw new Error('uso: sync.ts pull <dump.json>')
      cmdPull(arg)
    } else {
      console.error('Comandos: plan | diff <dump> | pull <dump>')
      process.exit(1)
    }
  } catch (e) {
    console.error('Falha:', (e as Error).message)
    process.exit(1)
  }
}

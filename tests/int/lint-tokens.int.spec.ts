import { describe, it, expect } from 'vitest'

import { lintContent, type Violation } from '../../scripts/lint-tokens'

/**
 * Especificação executável do linter de design tokens.
 *
 * Calibração ESTRITA (após tokenização completa do código):
 *   - cor literal    → severity 'error' (bloqueia o CI)
 *   - bezier literal → severity 'error' (bloqueia o CI; preventivo)
 *   - dimensão solta → severity 'error' (bloqueia o CI; exceções via disable inline)
 *
 * O núcleo testado é a função pura `lintContent(filePath, content)`: sem I/O,
 * recebe o caminho (para decidir allowlist por arquivo) e o conteúdo.
 */

const rules = (vs: Violation[]) => vs.map((v) => v.rule)
const bySeverity = (vs: Violation[], s: Violation['severity']) => vs.filter((v) => v.severity === s)

describe('lintContent — cor literal (error)', () => {
  it('sinaliza cor hex em .tsx', () => {
    const vs = lintContent('src/components/Foo.tsx', `<div style={{ color: '#fff' }} />`)
    expect(rules(vs)).toContain('no-literal-color')
    expect(bySeverity(vs, 'error')).toHaveLength(1)
    expect(vs[0].match).toContain('#fff')
  })

  it('sinaliza rgba() em .tsx', () => {
    const vs = lintContent('src/components/Foo.tsx', `const c = 'rgba(255,255,255,0.7)'`)
    expect(rules(vs)).toContain('no-literal-color')
    expect(vs[0].severity).toBe('error')
  })

  it('sinaliza oklch() em .css fora da allowlist', () => {
    const vs = lintContent('src/app/(frontend)/globals.css', `.x { color: oklch(50% 0.1 240deg); }`)
    expect(rules(vs)).toContain('no-literal-color')
  })

  it('ignora cor em arquivo da allowlist (contrast.ts é o parser de cor)', () => {
    const vs = lintContent('src/utilities/contrast.ts', `if (bg.includes('oklch(99%')) return rgba(0,0,0,0)`)
    expect(vs).toHaveLength(0)
  })

  it('ignora cor em arquivo gerado (tokens.css)', () => {
    const vs = lintContent('src/design-system/tokens.css', `--background: oklch(99% 0 0deg);`)
    expect(vs).toHaveLength(0)
  })

  it('ignora cor dentro de comentário de linha', () => {
    const vs = lintContent('src/components/Foo.tsx', `// fundo aproximado: #0a0a0a\nconst x = 1`)
    expect(vs).toHaveLength(0)
  })

  it('ignora cor dentro de comentário de bloco', () => {
    const vs = lintContent('src/components/Foo.tsx', `/*\n * exemplo: rgba(255,255,255,0.5)\n */\nconst x = 1`)
    expect(vs).toHaveLength(0)
  })

  it('não confunde var(--token) com cor literal', () => {
    const vs = lintContent('src/components/Foo.tsx', `className="bg-[var(--background)] text-foreground"`)
    expect(vs).toHaveLength(0)
  })

  it('respeita o disable inline na própria linha', () => {
    const vs = lintContent(
      'src/components/Foo.tsx',
      `const c = '#fff' // design-lint-disable-line motivo justificado`,
    )
    expect(vs).toHaveLength(0)
  })
})

describe('lintContent — bezier literal (error)', () => {
  it('sinaliza cubic-bezier() em .css', () => {
    const vs = lintContent('src/app/(frontend)/globals.css', `.x { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }`)
    expect(rules(vs)).toContain('no-literal-bezier')
    expect(vs[0].severity).toBe('error')
  })

  it('sinaliza array de easing quando a linha menciona ease (padrão Framer)', () => {
    const vs = lintContent('src/heros/Foo.tsx', `transition={{ ease: [0.25, 0.1, 0.25, 1] }}`)
    expect(rules(vs)).toContain('no-literal-bezier')
  })

  it('ignora array de 4 números sem contexto de easing', () => {
    const vs = lintContent('src/components/Foo.tsx', `const coords = [1, 2, 3, 4]`)
    expect(vs).toHaveLength(0)
  })

  it('ignora array com forma fora de bezier mesmo mencionando ease', () => {
    // x1 e x2 precisam estar em [0,1] para ser um bezier de easing plausível
    const vs = lintContent('src/components/Foo.tsx', `const released = [1, 2, 3, 4]`)
    expect(vs).toHaveLength(0)
  })

  it('ignora bezier no arquivo gerado de motion', () => {
    const vs = lintContent('src/design-system/tokens/motion.generated.ts', `smooth: [0.25, 0.1, 0.25, 1],`)
    expect(vs).toHaveLength(0)
  })
})

describe('lintContent — dimensão literal (error)', () => {
  it('sinaliza rounded-[20px] como error', () => {
    const vs = lintContent('src/components/Card/index.tsx', `className="rounded-[20px] border"`)
    expect(rules(vs)).toContain('no-literal-dimension')
    expect(vs[0].severity).toBe('error')
  })

  it('sinaliza text-[10px] (font-size arbitrário) como error', () => {
    const vs = lintContent('src/components/ui/scroll-indicator.tsx', `className="text-[10px]"`)
    expect(bySeverity(vs, 'error').map((v) => v.rule)).toContain('no-literal-dimension')
  })

  it('permite max-w-[48rem] (medida de leitura é semântica de layout)', () => {
    const vs = lintContent('src/heros/LowImpact/index.tsx', `<div className="max-w-[48rem]">`)
    expect(vs).toHaveLength(0)
  })

  it('sinaliza border-radius literal em .css', () => {
    const vs = lintContent('src/app/(frontend)/globals.css', `.x { border-radius: 4px; }`)
    expect(rules(vs)).toContain('no-literal-dimension')
    expect(vs[0].severity).toBe('error')
  })

  it('sinaliza letter-spacing literal em .css', () => {
    const vs = lintContent('src/app/(frontend)/globals.css', `.x { letter-spacing: -0.02em; }`)
    expect(rules(vs)).toContain('no-literal-dimension')
  })

  it('permite border-radius: var(--radius) (uso correto)', () => {
    const vs = lintContent('src/app/(frontend)/globals.css', `.x { border-radius: var(--radius); }`)
    expect(vs).toHaveLength(0)
  })
})

describe('lintContent — severidade e localização', () => {
  it('reporta o número de linha correto (1-based)', () => {
    const vs = lintContent('src/components/Foo.tsx', `const a = 1\nconst b = 2\nconst c = '#fff'`)
    expect(vs).toHaveLength(1)
    expect(vs[0].line).toBe(3)
  })

  it('detecta cor e dimensão (ambas error) na mesma varredura', () => {
    const vs = lintContent('src/components/Foo.tsx', `<div className="rounded-[20px]" style={{ color: '#fff' }} />`)
    const errorRules = bySeverity(vs, 'error').map((v) => v.rule)
    expect(errorRules).toContain('no-literal-color')
    expect(errorRules).toContain('no-literal-dimension')
  })

  it('respeita disable inline para dimensão (caso do hero/micro-label)', () => {
    const vs = lintContent(
      'src/components/ui/scroll-indicator.tsx',
      `sm: 'text-[10px]', // design-lint-disable-line micro-label decorativo`,
    )
    expect(vs).toHaveLength(0)
  })
})

import fs from 'fs/promises'
import path from 'path'

const TOKENS_DIR = path.resolve('src/design-system/tokens')
const OUTPUT_FILE = path.resolve('src/design-system/tokens.css')

async function loadJSON(filename: string) {
  const filepath = path.join(TOKENS_DIR, filename)
  const content = await fs.readFile(filepath, 'utf-8')
  return JSON.parse(content)
}

async function main() {
  console.log('Building design tokens...')

  // Load files
  const colors = await loadJSON('colors.json')
  const typography = await loadJSON('typography.json')
  const motion = await loadJSON('motion.json')
  const spacing = await loadJSON('spacing.json')

  const allTokens: Record<string, any> = {
    colors,
    typography,
    motion,
    spacing,
  }

  // Token resolution helper
  function getTokenValue(pathStr: string): string {
    const parts = pathStr.split('.')
    for (const category of Object.keys(allTokens)) {
      let current = allTokens[category]
      let found = true
      for (const part of parts) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part]
        } else {
          found = false
          break
        }
      }
      if (found && current && typeof current === 'object' && 'value' in current) {
        return resolveValue(current.value)
      }
    }
    throw new Error(`Token reference not found: ${pathStr}`)
  }

  function resolveValue(value: any): string {
    if (typeof value !== 'string') return String(value)
    const regex = /\{([^}]+)\}/g
    return value.replace(regex, (_, pathStr) => getTokenValue(pathStr))
  }

  let cssOutput = `/* =========================================================================
   ESTE ARQUIVO É GERADO AUTOMATICAMENTE POR scripts/build-tokens.ts.
   NÃO O EDITE DIRETAMENTE. TODAS AS ALTERAÇÕES DEVEM SER NO JSON DOS TOKENS.
   ========================================================================= */

:root {
  /* Spacing */
  --spacing: ${resolveValue(spacing.spacing.base.value)};

  /* Radius */
  --radius: ${resolveValue(spacing.radius.base.value)};

  /* Layout */
  --header-h: ${resolveValue(spacing.layout['header-h'].value)};

  /* Font Families */
  --font-sans: ${resolveValue(typography.font.sans.value)};
  --font-heading: ${resolveValue(typography.font.heading.value)};
  --font-mono: ${resolveValue(typography.font.mono.value)};

  /* Breakpoints */
  --breakpoint-sm: ${resolveValue(spacing.breakpoint.sm.value)};
  --breakpoint-md: ${resolveValue(spacing.breakpoint.md.value)};
  --breakpoint-lg: ${resolveValue(spacing.breakpoint.lg.value)};
  --breakpoint-xl: ${resolveValue(spacing.breakpoint.xl.value)};
  --breakpoint-2xl: ${resolveValue(spacing.breakpoint.xxl.value)};

  /* Light Theme Semantic Colors */
`

  // Add light semantic colors
  for (const [key, token] of Object.entries(colors.semantic.light)) {
    const val = resolveValue((token as any).value)
    cssOutput += `  --${key}: ${val};\n`
  }

  cssOutput += `}

[data-theme='dark'] {
  /* Dark Theme Semantic Colors */
`

  // Add dark semantic colors
  for (const [key, token] of Object.entries(colors.semantic.dark)) {
    const val = resolveValue((token as any).value)
    cssOutput += `  --${key}: ${val};\n`
  }

  cssOutput += `}

@theme inline {
  /* Theme mapping to semantic variables */
`

  // Map theme colors to CSS variables
  for (const key of Object.keys(colors.semantic.light)) {
    cssOutput += `  --color-${key}: var(--${key});\n`
  }

  // Radius mappings
  cssOutput += `
  /* Radius Mapping */
  --radius-sm: calc(var(--radius) - 6px);
  --radius-md: calc(var(--radius) - 4px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 8px);

  /* Font Families Mapping */
  --font-sans: var(--font-sans);
  --font-heading: var(--font-heading);
  --font-mono: var(--font-mono);

  /* Breakpoints Mapping */
  --breakpoint-sm: ${resolveValue(spacing.breakpoint.sm.value)};
  --breakpoint-md: ${resolveValue(spacing.breakpoint.md.value)};
  --breakpoint-lg: ${resolveValue(spacing.breakpoint.lg.value)};
  --breakpoint-xl: ${resolveValue(spacing.breakpoint.xl.value)};
  --breakpoint-2xl: ${resolveValue(spacing.breakpoint.xxl.value)};

  /* Motion Animation */
  --animate-scroll-dot: scroll-dot 2s ease-in-out infinite;
}
`

  // Ensure output directory exists
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true })
  await fs.writeFile(OUTPUT_FILE, cssOutput, 'utf-8')
  console.log(`✓ Design tokens compiled successfully to ${OUTPUT_FILE}`)
}

main().catch((err) => {
  console.error('Failed to compile design tokens:', err)
  process.exit(1)
})
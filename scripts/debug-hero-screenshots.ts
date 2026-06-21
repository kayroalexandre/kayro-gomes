/**
 * Captura screenshots da home em diferentes momentos para identificar
 * os artefatos visuais reportados.
 *
 * Uso: bun run scripts/debug-hero-screenshots.ts
 */
import { chromium } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const URL = process.env.URL || 'http://localhost:3000'
const OUT = join(process.cwd(), '.tmp', 'debug-screenshots')

mkdirSync(OUT, { recursive: true })

const log = (msg: string) => console.log(`[debug] ${msg}`)

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  })
  const page = await context.newPage()

  log(`Abrindo ${URL} (colorScheme: dark)...`)

  // 1. Intercept network para slow down imagens
  await page.route('**/*.{webp,jpg,jpeg,png,avif}', async (route) => {
    // Atraso de 2s para vermos o estado de loading
    await new Promise((r) => setTimeout(r, 2000))
    await route.continue()
  })

  // 2. Inicia navegação
  const navigationPromise = page.goto(URL, { waitUntil: 'domcontentloaded' })

  // 3. Logo após DOMContentLoaded, antes da imagem carregar
  await navigationPromise
  await page.waitForTimeout(300) // pequeno delay pra estabilizar
  await page.screenshot({ path: join(OUT, '01-during-load.png'), fullPage: false })
  log('Screenshot 1: durante load (imagens atrasadas)')

  // 4. Aguarda 1s mais para ver o estado intermediário
  await page.waitForTimeout(1500)
  await page.screenshot({ path: join(OUT, '02-mid-load.png'), fullPage: false })
  log('Screenshot 2: mid load')

  // 5. Aguarda tudo carregar
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(OUT, '03-loaded.png'), fullPage: false })
  log('Screenshot 3: loaded')

  // 6. Scroll para baixo
  await page.evaluate(() => window.scrollTo(0, 300))
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(OUT, '04-scrolled.png'), fullPage: false })
  log('Screenshot 4: scrolled')

  // 7. Identifica elementos no topo da página (header e arredores)
  const topElements = await page.evaluate(() => {
    const elements: Array<{
      tag: string
      id?: string
      className?: string
      bg?: string
      width?: number
      height?: number
      rect?: { top: number; left: number; right: number; bottom: number }
    }> = []

    // Itera todos os elementos no topo da página
    const all = document.querySelectorAll('body *')
    for (const el of Array.from(all).slice(0, 200)) {
      const rect = el.getBoundingClientRect()
      // Só elementos visíveis no topo da página
      if (rect.top > 200) continue
      if (rect.width === 0 || rect.height === 0) continue

      const style = window.getComputedStyle(el)
      elements.push({
        tag: el.tagName,
        id: el.id || undefined,
        className: (el as HTMLElement).className?.toString().slice(0, 100),
        bg: style.backgroundColor !== 'rgba(0, 0, 0, 0)' ? style.backgroundColor : undefined,
        width: rect.width,
        height: rect.height,
        rect: { top: rect.top, left: rect.left, right: rect.right, bottom: rect.bottom },
      })
    }
    return elements
  })

  log(`Elementos no topo (top < 200px): ${topElements.length}`)
  for (const e of topElements) {
    log(`  ${e.tag}#${e.id || ''}.${(e.className || '').slice(0, 50)} | bg=${e.bg || 'transparent'} | ${e.width}x${e.height} | top=${e.rect?.top?.toFixed(0)} left=${e.rect?.left?.toFixed(0)}`)
  }

  await browser.close()
  log(`Screenshots em ${OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

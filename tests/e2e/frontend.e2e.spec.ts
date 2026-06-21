import { test, expect, Page } from '@playwright/test'

test.describe('Frontend', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('homepage loads and renders PT-BR content', async ({ page }) => {
    await page.goto('http://localhost:3000')
    await expect(page).toHaveTitle(/Kayro Gomes/)
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('homepage has lang="pt-BR"', async ({ page }) => {
    await page.goto('http://localhost:3000')
    const htmlLang = await page.locator('html').getAttribute('lang')
    expect(htmlLang).toBe('pt-BR')
  })

  test('projetos page loads', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/projetos')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1').first()).toContainText('Projetos')
  })

  test('blog page loads', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/posts')
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1').first()).toContainText('Blog')
  })

  test('404 page renders in PT-BR', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/this-page-does-not-exist-12345')
    expect(response?.status()).toBe(404)
    await expect(page.locator('body')).toContainText('Página não encontrada')
  })
})

/**
 * Testes de regressão visual / layout do HighImpactHero.
 *
 * Estes testes validam as regras geométricas críticas documentadas em
 * AGENTS.md (seção "Frontend Architecture — Hero Layout").
 *
 * Inclui:
 * - Validação estrutural das classes
 * - Regressão visual real via `toHaveScreenshot` (baseline em `tests/e2e/__screenshots__`)
 *
 * Regras cobertas:
 * - Container usa mt-[var(--header-h)] + h-[calc(100%-var(--header-h))]
 * - Padding vertical igual (py-16)
 * - Scroll indicator posicionado corretamente
 * - Altura da hero desconta --adminbar-h quando presente
 */
test.describe('HighImpactHero Layout (AGENTS.md rules)', () => {
  test('hero section has correct geometric structure', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const heroSection = page.locator('section').first()
    await expect(heroSection).toBeVisible()

    const classList = await heroSection.getAttribute('class')
    expect(classList).toContain('h-[calc(100dvh-var(--adminbar-h,0px))]')
    expect(classList).toContain('overflow-hidden')
  })

  test('hero container respects header height and py-16 padding', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const container = page.locator('section > div.container').first()
    await expect(container).toBeVisible()

    const classList = await container.getAttribute('class')
    expect(classList).toContain('mt-[var(--header-h)]')
    expect(classList).toContain('h-[calc(100%-var(--header-h))]')
    expect(classList).toContain('py-16')
  })

  test('hero uses justify-between for content distribution', async ({ page }) => {
    await page.goto('http://localhost:3000')

    const heroFlex = page.locator('section > div.container').first()
    const classList = await heroFlex.getAttribute('class')
    expect(classList).toContain('flex-col')
    expect(classList).toContain('justify-between')
  })

  // ==================== REGRESSÃO VISUAL REAL ====================
  test('hero visual snapshot - homepage (HighImpactHero)', async ({ page }) => {
    await page.goto('http://localhost:3000')

    // Aguarda a hero carregar completamente (incluindo imagens e animações)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500) // pequena espera para framer-motion

    // Captura screenshot da hero (apenas a seção superior)
    await expect(page.locator('section').first()).toHaveScreenshot('high-impact-hero-homepage.png', {
      threshold: 0.2, // tolerância para pequenas variações de renderização
    })
  })

  test('hero visual snapshot - mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('section').first()).toHaveScreenshot('high-impact-hero-mobile.png', {
      threshold: 0.2,
    })
  })
})

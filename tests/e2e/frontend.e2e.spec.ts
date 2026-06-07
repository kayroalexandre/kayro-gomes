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

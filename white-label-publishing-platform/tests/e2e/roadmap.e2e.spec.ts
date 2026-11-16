import { test, expect } from '@playwright/test'

for (const width of [1440, 375, 320]) {
  test(`topic details stay inside the roadmap at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    const map = page.locator('#roadmap')
    await map.getByRole('button', { name: /Linux e linha de comando/ }).click()
    const before = await map.boundingBox()
    await map.getByRole('button', { name: 'Terminal e navegação', exact: false }).click()
    const panel = map.getByRole('dialog', { name: 'Detalhes: Terminal e navegação' })
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('link', { name: /Continuar no roadmap.sh/ })).toHaveAttribute(
      'href',
      'https://roadmap.sh/devops/terminal-knowledge@wjJPzrFJBNYOD3SJLzW2M',
    )
    await expect(panel.getByText('Objetivo da semana')).toHaveCount(0)
    const after = await map.boundingBox()
    const details = await panel.boundingBox()
    expect(Math.abs(after!.height - before!.height)).toBeLessThan(2)
    expect(details!.y).toBeGreaterThanOrEqual(after!.y)
    expect(details!.y + details!.height).toBeLessThanOrEqual(after!.y + after!.height)
    expect(await panel.evaluate((element) => getComputedStyle(element).position)).toBe('absolute')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.keyboard.press('Escape')
    await expect(panel).toHaveCount(0)
    // Verify the fallback used by browsers that deny the native fullscreen API.
    await page.evaluate(() => {
      Object.defineProperty(Element.prototype, 'requestFullscreen', {
        value: undefined,
        configurable: true,
      })
    })
    await map.getByRole('button', { name: 'Abrir em tela cheia' }).click()
    const expanded = page.getByRole('dialog', { name: 'Mapa de estudos DevOps', exact: true })
    await expect(expanded).toBeVisible()
    const fullscreenBounds = await expanded.boundingBox()
    expect(fullscreenBounds!.height).toBeLessThanOrEqual(900)
    await expanded.getByRole('button', { name: 'Terminal e navegação', exact: false }).click()
    const fullscreenPanel = expanded.getByRole('dialog', { name: 'Detalhes: Terminal e navegação' })
    await expect(fullscreenPanel).toBeVisible()
    const bounds = await fullscreenPanel.boundingBox()
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(900)
    await page.keyboard.press('Escape')
    await expect(fullscreenPanel).toHaveCount(0)
    await expect(expanded).toBeVisible()
  })
}

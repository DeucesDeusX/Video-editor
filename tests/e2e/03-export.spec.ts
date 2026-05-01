import { test, expect } from '@playwright/test'
import { loadApp, importFile, waitForClip, FIXTURE } from './helpers/app'

// Reel Lab's native export flow: "Export ▾" button → dropdown → "Render MP4"
test.describe('Export', () => {
  test.beforeEach(async ({ page }) => {
    await loadApp(page)
  })

  test('Export button is visible in topbar', async ({ page }) => {
    await expect(page.locator('button:has-text("Export")')).toBeVisible()
  })

  test('Export menu opens and shows Render MP4 option', async ({ page }) => {
    await page.click('button:has-text("Export")')
    await expect(page.locator('.menu')).toBeVisible({ timeout: 5_000 })
    await expect(page.locator('.menu-title').filter({ hasText: 'MP4' })).toBeVisible()
    // Close
    await page.keyboard.press('Escape')
  })

  test('Render MP4 triggers FFmpeg processing after import', async ({ page }) => {
    await importFile(page, FIXTURE)  // adds asset + double-clicks to put on timeline
    await waitForClip(page)          // wait for clip to appear in lane
    await page.click('button:has-text("Export")')
    await expect(page.locator('.menu')).toBeVisible({ timeout: 5_000 })
    await page.click('.menu-title:has-text("MP4")')
    // Reel Lab shows .modal-backdrop with h2 "Rendering MP4…" and a .progress-bar
    await expect(page.locator('.modal-backdrop')).toBeVisible({ timeout: 15_000 })
  })
})

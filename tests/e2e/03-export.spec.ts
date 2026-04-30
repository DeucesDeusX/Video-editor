import { test, expect } from '@playwright/test'
import { loadApp, FIXTURE } from './helpers/app'

test.describe('FFmpeg Export (Spike 2)', () => {
  test.beforeEach(async ({ page }) => {
    await loadApp(page)
  })

  test('FFmpeg panel exists and can be expanded', async ({ page }) => {
    const panel = page.locator('.spike-toggle, button:has-text("FFmpeg")')
    await expect(panel).toBeVisible()
    await panel.click()
    await expect(page.locator('.spike-body, .spike-controls')).toBeVisible()
  })

  test('Load FFmpeg succeeds within 30s', async ({ page }) => {
    await page.locator('.spike-toggle, button:has-text("FFmpeg")').click()
    await page.click('button:has-text("Load FFmpeg")')
    await expect(page.locator('.spike-log, .log-line')).toContainText('ready to convert', { timeout: 30_000 })
  })

  test('Convert test fixture to H.264 within 60s', async ({ page }) => {
    await page.locator('.spike-toggle, button:has-text("FFmpeg")').click()
    await page.click('button:has-text("Load FFmpeg")')
    await expect(page.locator('.spike-log')).toContainText('ready', { timeout: 30_000 })
    const [fc] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.click('label.spike-file-label, .spike-controls label')
    ])
    await fc.setFiles(FIXTURE)
    await page.click('button:has-text("Convert to H.264")')
    await expect(page.locator('a:has-text("Download output.mp4"), .spike-btn--success')).toBeVisible({ timeout: 60_000 })
  })
})

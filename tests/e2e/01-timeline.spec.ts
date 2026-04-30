import { test, expect } from '@playwright/test'
import { loadApp, importFile, waitForClip, FIXTURE } from './helpers/app'
import * as fs from 'fs'

test.describe('Timeline & UI', () => {
  test.beforeEach(async ({ page }) => {
    await loadApp(page)
  })

  test('fixture file exists', () => {
    expect(fs.existsSync(FIXTURE), `Missing fixture: ${FIXTURE}`).toBe(true)
  })

  test('import video — clip appears on main lane', async ({ page }) => {
    await importFile(page, FIXTURE)
    await waitForClip(page)
    const clip = page.locator('.lane-clips .clip-block').first()
    await expect(clip).toBeVisible()
  })

  test('imported clip has non-zero duration label', async ({ page }) => {
    await importFile(page, FIXTURE)
    await waitForClip(page)
    const clip = page.locator('.lane-clips .clip-block').first()
    const text = await clip.textContent()
    expect(text).not.toMatch(/^0\.?0*s$/)
  })

  test('drag clip to new position', async ({ page }) => {
    await importFile(page, FIXTURE)
    await waitForClip(page)
    const clip = page.locator('.lane-clips .clip-block').first()
    const box = await clip.boundingBox()
    if (!box) throw new Error('Clip not found')
    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX + 100, startY, { steps: 10 })
    await page.mouse.up()
    const newBox = await clip.boundingBox()
    expect(newBox!.x).toBeGreaterThan(box.x + 50)
  })
})

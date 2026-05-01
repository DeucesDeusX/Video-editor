import { test, expect } from '@playwright/test'
import { loadApp, importFile, waitForClip, FIXTURE } from './helpers/app'
import * as fs from 'fs'

test.describe('Timeline & UI', () => {
  test.beforeEach(async ({ page }) => {
    await loadApp(page)
  })

  test('fixture file exists', () => {
    expect(fs.existsSync(FIXTURE), `Missing fixture at: ${FIXTURE}`).toBe(true)
  })

  test('import video — clip appears on timeline', async ({ page }) => {
    await importFile(page, FIXTURE)
    await waitForClip(page)
    const clip = page.locator('.lane-track .clip').first()
    await expect(clip).toBeVisible()
  })

  test('imported clip has non-zero duration label', async ({ page }) => {
    await importFile(page, FIXTURE)
    await waitForClip(page)
    const clip = page.locator('.lane-track .clip').first()
    const text = await clip.textContent()
    expect(text?.length).toBeGreaterThan(0)
    expect(text).not.toMatch(/^0\.0+s$/)
  })

  test('drag clip to new position', async ({ page }) => {
    await importFile(page, FIXTURE)
    await waitForClip(page)
    const clip = page.locator('.lane-track .clip').first()
    const box = await clip.boundingBox()
    if (!box) throw new Error('Clip bounding box not found')
    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2
    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.mouse.move(startX + 200, startY, { steps: 20 })
    await page.mouse.up()
    await page.waitForTimeout(200)
    const newBox = await clip.boundingBox()
    expect(newBox!.x).toBeGreaterThan(box.x + 20)
  })
})

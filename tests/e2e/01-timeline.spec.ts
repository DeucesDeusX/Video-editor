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

  test('right trim handle shortens clip width', async ({ page }) => {
    await importFile(page, FIXTURE)
    await waitForClip(page)
    const clip = page.locator('.lane-track .clip').first()
    const origBox = await clip.boundingBox()
    if (!origBox) throw new Error('Clip bounding box not found')
    // Drag the right trim handle inward (left) to shorten the clip
    const handle = clip.locator('.clip-handle.right')
    const hBox = await handle.boundingBox()
    if (!hBox) throw new Error('Right trim handle not found')
    await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + hBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(hBox.x - 80, hBox.y + hBox.height / 2, { steps: 15 })
    await page.mouse.up()
    await page.waitForTimeout(200)
    const newBox = await clip.boundingBox()
    // Clip should be narrower after trimming
    expect(newBox!.width).toBeLessThan(origBox.width - 20)
  })
})

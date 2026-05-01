import { Page } from '@playwright/test'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dir = path.dirname(fileURLToPath(import.meta.url))
export const FIXTURE = path.resolve(__dir, '../../fixtures/test-clip.mp4')

/** Navigate to app and wait for Reel Lab to finish loading */
export async function loadApp(page: Page) {
  await page.goto('/')
  await page.waitForSelector('.topbar .brand', { timeout: 20_000 })
}

/** Import a file and add it to the timeline.
 *  Reel Lab flow: pick file → appears in library → double-click to add to main lane */
export async function importFile(page: Page, filePath: string) {
  // Open file picker
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('.rail-head label.btn')
  ])
  await fileChooser.setFiles(filePath)
  // Wait for asset to appear in library grid
  await page.waitForSelector('.asset-grid .asset', { timeout: 10_000 })
  // Double-click the first asset to add it to the main timeline lane
  await page.dblclick('.asset-grid .asset')
}

/** Wait for at least one clip on the timeline (main-clip, overlay-clip, or music-clip) */
export async function waitForClip(page: Page) {
  await page.waitForSelector('.lane-track .clip', { timeout: 10_000 })
}

/** Click the play button */
export async function clickPlay(page: Page) {
  await page.click('button[title="Play"]')
}

/** Toggle play/pause (Reel Lab uses the same button) */
export async function clickPause(page: Page) {
  await page.click('button[title="Play"], button[title="Pause"]')
}

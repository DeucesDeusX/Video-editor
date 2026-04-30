import { Page } from '@playwright/test'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __dir = path.dirname(fileURLToPath(import.meta.url))
export const FIXTURE = path.resolve(__dir, '../../fixtures/test-clip.mp4')

/** Navigate to app and wait for Reel Lab to finish loading */
export async function loadApp(page: Page) {
  await page.goto('/')
  await page.waitForSelector('.topbar .brand', { timeout: 15_000 })
}

/** Import a file via the library file input */
export async function importFile(page: Page, filePath: string) {
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('label:has-text("+ Add")')
  ])
  await fileChooser.setFiles(filePath)
}

/** Wait for at least one clip block to appear on any lane */
export async function waitForClip(page: Page) {
  await page.waitForSelector('.lane-clips .clip-block', { timeout: 10_000 })
}

/** Click the play button */
export async function clickPlay(page: Page) {
  await page.click('.controls button:has-text("▶"), button[title*="lay"]:not([disabled])')
}

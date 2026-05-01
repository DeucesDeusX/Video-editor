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

/** Import a file via the library file input */
export async function importFile(page: Page, filePath: string) {
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('.rail-head label.btn')
  ])
  await fileChooser.setFiles(filePath)
}

/** Wait for at least one clip to appear in any lane-track */
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

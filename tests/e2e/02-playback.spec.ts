import { test, expect } from '@playwright/test'
import { loadApp, importFile, waitForClip, clickPlay, clickPause, FIXTURE } from './helpers/app'
import { getVideoTime } from './helpers/canvas'

test.describe('Playback', () => {
  test.beforeEach(async ({ page }) => {
    await loadApp(page)
    await importFile(page, FIXTURE)
    await waitForClip(page)
    // Give video element time to load metadata
    await page.waitForTimeout(1000)
  })

  test('stage-video has decoded dimensions after import', async ({ page }) => {
    const { videoWidth, videoHeight } = await page.evaluate(() => {
      const v = document.querySelector('.stage-video') as HTMLVideoElement
      return { videoWidth: v?.videoWidth ?? 0, videoHeight: v?.videoHeight ?? 0 }
    })
    expect(videoWidth).toBeGreaterThan(0)
    expect(videoHeight).toBeGreaterThan(0)
  })

  test('video currentTime advances during play', async ({ page }) => {
    const t0 = await getVideoTime(page)
    await clickPlay(page)
    await page.waitForTimeout(2000)
    const t1 = await getVideoTime(page)
    expect(t1).toBeGreaterThan(t0 + 0.5)
  })

  test('pause stops playback', async ({ page }) => {
    await clickPlay(page)
    await page.waitForTimeout(800)
    await clickPause(page)
    await page.waitForTimeout(300)
    const paused = await page.evaluate(() => {
      const v = document.querySelector('.stage-video') as HTMLVideoElement
      return v?.paused ?? true
    })
    expect(paused).toBe(true)
  })
})

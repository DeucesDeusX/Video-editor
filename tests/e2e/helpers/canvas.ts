import { Page } from '@playwright/test'

/** Returns true if the .stage-video element has decoded at least one non-black frame */
export async function hasVideoFrame(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const video = document.querySelector('.stage-video') as HTMLVideoElement
    if (!video || video.videoWidth === 0 || video.readyState < 2) return false
    const canvas = document.createElement('canvas')
    canvas.width = 10
    canvas.height = 10
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    ctx.drawImage(video, 0, 0, 10, 10)
    const px = ctx.getImageData(0, 0, 10, 10).data
    return Array.from(px).some((v, i) => i % 4 !== 3 && v > 10)
  })
}

/** Returns current video currentTime from the stage video element */
export async function getVideoTime(page: Page): Promise<number> {
  return page.evaluate(() => {
    const v = document.querySelector('.stage-video') as HTMLVideoElement
    return v ? v.currentTime : -1
  })
}

import { createWriteStream, existsSync } from 'fs'
import { mkdir } from 'fs/promises'
import https from 'https'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const dest = join(__dir, 'test-clip.mp4')

// Small public domain H.264 clip (~1MB, 5s, 1280x720)
const URL = 'https://www.w3schools.com/html/mov_bbb.mp4'

if (existsSync(dest)) {
  console.log('Fixture already exists:', dest)
  process.exit(0)
}

await mkdir(__dir, { recursive: true })
console.log('Downloading test fixture...')

const file = createWriteStream(dest)
https.get(URL, (res) => {
  res.pipe(file)
  file.on('finish', () => {
    file.close()
    console.log('✓ Fixture saved:', dest)
  })
}).on('error', (e) => {
  console.error('Download failed:', e.message)
  process.exit(1)
})

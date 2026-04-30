import { useRef, useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
import './FFmpegSpike.css'

type Status = 'idle' | 'loading' | 'ready' | 'converting' | 'done' | 'error'

interface LogEntry {
  type: 'info' | 'ffmpeg' | 'success' | 'error'
  text: string
  time?: number
}

// Use ESM build — Vite spawns module workers so importScripts() fails,
// the library falls back to dynamic import(), which needs an ES module default export
const FFMPEG_CORE_CDN = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'

export default function FFmpegSpike() {
  const [status, setStatus] = useState<Status>('idle')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loadMs, setLoadMs] = useState<number | null>(null)
  const [convertMs, setConvertMs] = useState<number | null>(null)
  const [outputURL, setOutputURL] = useState<string | null>(null)
  const [inputName, setInputName] = useState<string>('')
  const [open, setOpen] = useState(false)

  const ffmpegRef = useRef<FFmpeg | null>(null)
  const fileRef = useRef<File | null>(null)

  const log = (text: string, type: LogEntry['type'] = 'info', time?: number) =>
    setLogs((prev) => [...prev, { text, type, time }])

  const loadFFmpeg = async () => {
    setStatus('loading')
    setLogs([])
    setLoadMs(null)
    setOutputURL(null)

    const ffmpeg = new FFmpeg()
    ffmpegRef.current = ffmpeg

    ffmpeg.on('log', ({ message }) => {
      setLogs((prev) => [...prev, { text: message, type: 'ffmpeg' }])
    })

    ffmpeg.on('progress', ({ progress, time }) => {
      const pct = Math.round(progress * 100)
      setLogs((prev) => {
        const last = prev[prev.length - 1]
        const entry: LogEntry = { text: `Converting… ${pct}% (${(time / 1_000_000).toFixed(1)}s encoded)`, type: 'info' }
        // Replace last progress line instead of appending
        if (last?.text.startsWith('Converting…')) return [...prev.slice(0, -1), entry]
        return [...prev, entry]
      })
    })

    try {
      log('Loading FFmpeg.wasm core from CDN…')
      const t0 = performance.now()

      // Pass URLs directly — CORS/CORP headers on unpkg allow this, and the
      // direct path preserves "/umd/" so the library's ESM fallback works correctly
      await ffmpeg.load({
        coreURL: `${FFMPEG_CORE_CDN}/ffmpeg-core.js`,
        wasmURL: `${FFMPEG_CORE_CDN}/ffmpeg-core.wasm`,
      })

      const elapsed = Math.round(performance.now() - t0)
      setLoadMs(elapsed)
      setStatus('ready')
      log(`FFmpeg loaded in ${elapsed}ms — ready to convert`, 'success')
    } catch (err) {
      setStatus('error')
      log(`Load failed: ${String(err)}`, 'error')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    fileRef.current = file
    setInputName(file.name)
    setOutputURL(null)
    setConvertMs(null)
    const mb = file.size / 1024 / 1024
    const sizeStr = mb > 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`
    const warn = mb > 500 ? ' ⚠️ File too large — fetchFile loads into memory. Use a clip under 200MB.' : ''
    setLogs((prev) => [...prev, { text: `Selected: ${file.name} (${sizeStr})${warn}`, type: mb > 500 ? 'error' : 'info' }])
  }

  const runConvert = async () => {
    const ffmpeg = ffmpegRef.current
    const file = fileRef.current
    if (!ffmpeg || !file) return

    setStatus('converting')
    setOutputURL(null)
    setConvertMs(null)
    log('Writing input file to FFmpeg virtual FS…')

    try {
      const t0 = performance.now()

      await ffmpeg.writeFile('input.mp4', await fetchFile(file))
      log('Running: ffmpeg -i input.mp4 -c:v libx264 -preset fast -crf 23 output.mp4')

      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '23',
        '-c:a', 'aac',
        '-movflags', 'faststart',
        'output.mp4',
      ])

      const elapsed = Math.round(performance.now() - t0)
      setConvertMs(elapsed)

      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })
      setOutputURL(URL.createObjectURL(blob))

      setStatus('done')
      log(`Done in ${elapsed}ms (${(elapsed / 1000).toFixed(1)}s) — ${(blob.size / 1024 / 1024).toFixed(1)} MB output`, 'success')
    } catch (err) {
      setStatus('error')
      log(`Convert failed: ${String(err)}`, 'error')
    }
  }

  const canLoad = status === 'idle' || status === 'error'
  const canConvert = status === 'ready' || status === 'done'

  return (
    <div className="ffmpeg-spike">
      <button className="spike-toggle" onClick={() => setOpen((o) => !o)}>
        <span className="spike-badge">SPIKE 2</span>
        FFmpeg.wasm Preprocessing
        <span className="spike-chevron">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="spike-body">
          {/* Controls */}
          <div className="spike-controls">
            <button
              className="spike-btn"
              onClick={loadFFmpeg}
              disabled={!canLoad}
            >
              {status === 'loading' ? 'Loading…' : 'Load FFmpeg'}
            </button>

            <label className={`spike-file-label ${status !== 'ready' && status !== 'done' ? 'disabled' : ''}`}>
              {inputName || 'Pick video file'}
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={status !== 'ready' && status !== 'done'}
              />
            </label>

            <button
              className="spike-btn spike-btn--accent"
              onClick={runConvert}
              disabled={!canConvert || !fileRef.current}
            >
              {status === 'converting' ? 'Converting…' : 'Convert to H.264'}
            </button>

            {outputURL && (
              <a className="spike-btn spike-btn--success" href={outputURL} download="output.mp4">
                Download output.mp4
              </a>
            )}
          </div>

          {/* Timing */}
          {(loadMs !== null || convertMs !== null) && (
            <div className="spike-metrics">
              {loadMs !== null && (
                <div className="metric">
                  <span className="metric-label">FFmpeg load</span>
                  <span className="metric-value">{loadMs}ms</span>
                </div>
              )}
              {convertMs !== null && (
                <div className="metric">
                  <span className="metric-label">Convert time</span>
                  <span className={`metric-value ${convertMs < 30000 ? 'good' : 'warn'}`}>
                    {(convertMs / 1000).toFixed(1)}s
                  </span>
                </div>
              )}
              {convertMs !== null && (
                <div className="metric">
                  <span className="metric-label">Spike 2 target</span>
                  <span className={`metric-value ${convertMs < 300000 ? 'good' : 'warn'}`}>
                    {convertMs < 300000 ? '✓ < 5 min' : '✗ > 5 min'}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Log */}
          <div className="spike-log">
            {logs.length === 0 && (
              <div className="log-placeholder">Logs will appear here…</div>
            )}
            {logs.map((entry, i) => (
              <div key={i} className={`log-line log-${entry.type}`}>
                {entry.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

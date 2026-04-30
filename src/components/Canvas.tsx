import { useRef, useEffect, useState, useCallback } from 'react'
import { useEditorStore } from '../store/editorStore'
import './Canvas.css'

const CANVAS_W = 1080
const CANVAS_H = 1920

// Cache video elements — must be in the DOM or browsers won't load them
const videoCache = new Map<string, HTMLVideoElement>()

function getVideoEl(clip: { id: string; objectURL: string }, onReady: () => void): HTMLVideoElement {
  if (!videoCache.has(clip.id)) {
    const el = document.createElement('video')
    el.src = clip.objectURL
    el.preload = 'auto'
    el.muted = true
    el.playsInline = true
    // Must be in the DOM — browsers won't load detached video elements
    el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none'
    document.body.appendChild(el)
    el.load()
    el.addEventListener('loadeddata', onReady, { once: false })
    videoCache.set(clip.id, el)
  }
  return videoCache.get(clip.id)!
}

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)

  const clips = useEditorStore((s) => s.clips)
  const playheadPosition = useEditorStore((s) => s.playheadPosition)
  const isPlaying = useEditorStore((s) => s.isPlaying)
  const tick = useEditorStore((s) => s.tick)
  const setIsPlaying = useEditorStore((s) => s.setIsPlaying)

  // Fit canvas to container on mount / resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const fit = () => {
      const { width, height } = container.getBoundingClientRect()
      const s = Math.min((width - 40) / CANVAS_W, (height - 40) / CANVAS_H, 1)
      setScale(s)
      setOffset({ x: (width - CANVAS_W * s) / 2, y: (height - CANVAS_H * s) / 2 })
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // Draw one frame to the canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = CANVAS_W
    canvas.height = CANVAS_H
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    // Find the video clip at the current playhead position
    const activeClip = clips
      .filter(
        (c) =>
          c.type === 'video' &&
          playheadPosition >= c.position &&
          playheadPosition < c.position + c.duration
      )
      .sort((a, b) => b.trackIndex - a.trackIndex)[0] // highest track wins

    if (activeClip) {
      const videoEl = getVideoEl(activeClip, draw)
      const localTime = playheadPosition - activeClip.position

      if (Math.abs(videoEl.currentTime - localTime) > 0.05) {
        videoEl.currentTime = localTime
        // Redraw once seek completes
        videoEl.onseeked = draw
      }

      if (videoEl.readyState >= 2) {
        const vw = videoEl.videoWidth || CANVAS_W
        const vh = videoEl.videoHeight || CANVAS_H
        const r = Math.min(CANVAS_W / vw, CANVAS_H / vh)
        const dw = vw * r
        const dh = vh * r
        const dx = (CANVAS_W - dw) / 2
        const dy = (CANVAS_H - dh) / 2
        ctx.drawImage(videoEl, dx, dy, dw, dh)
      }
    } else if (clips.length === 0) {
      // Empty state
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.font = '48px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Drop videos to get started', CANVAS_W / 2, CANVAS_H / 2)
    }

    // Rule-of-thirds grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 2
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo((CANVAS_W / 3) * i, 0); ctx.lineTo((CANVAS_W / 3) * i, CANVAS_H); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, (CANVAS_H / 3) * i); ctx.lineTo(CANVAS_W, (CANVAS_H / 3) * i); ctx.stroke()
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.3)'
      ctx.beginPath(); ctx.arc(CANVAS_W / 2, CANVAS_H / 2, 12, 0, Math.PI * 2); ctx.stroke()
    }
  }, [clips, playheadPosition, showGrid])

  // Playback loop
  useEffect(() => {
    if (!isPlaying) {
      cancelAnimationFrame(rafRef.current)
      draw()
      return
    }

    const loop = (timestamp: number) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp
      const delta = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp
      tick(delta)
      draw()
      rafRef.current = requestAnimationFrame(loop)
    }

    lastTimeRef.current = 0
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, tick, draw])

  // Redraw when playhead changes while paused
  useEffect(() => {
    if (!isPlaying) draw()
  }, [playheadPosition, isPlaying, draw])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setOffset((prev) => ({ x: prev.x + e.clientX - dragStart.x, y: prev.y + e.clientY - dragStart.y }))
    setDragStart({ x: e.clientX, y: e.clientY })
  }
  const handleMouseUp = () => setIsDragging(false)

  return (
    <div
      className="canvas-container"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div
        className="canvas-wrapper"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
      >
        <canvas ref={canvasRef} className="stage-canvas" style={{ width: CANVAS_W, height: CANVAS_H }} />
      </div>

      <button className="play-btn" onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? '⏸' : '▶'}
      </button>
      <button className="grid-toggle" onClick={() => setShowGrid((g) => !g)} title="Toggle grid">
        {showGrid ? '⊞' : '◻'}
      </button>
    </div>
  )
}

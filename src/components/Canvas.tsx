import { useRef, useEffect, useState } from 'react'
import './Canvas.css'

interface CanvasSize {
  width: number
  height: number
  scale: number
  offsetX: number
  offsetY: number
}

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [size, setSize] = useState<CanvasSize>({
    width: 1080,
    height: 1920,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)

  // Fit canvas to container
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      const containerWidth = rect.width - 40 // padding
      const containerHeight = rect.height - 40

      const scaleX = containerWidth / size.width
      const scaleY = containerHeight / size.height
      const scale = Math.min(scaleX, scaleY, 1)

      const scaledWidth = size.width * scale
      const scaledHeight = size.height * scale
      const offsetX = (rect.width - scaledWidth) / 2
      const offsetY = (rect.height - scaledHeight) / 2

      setSize((prev) => ({
        ...prev,
        scale,
        offsetX,
        offsetY,
      }))
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = size.width
    canvas.height = size.height

    // Black background (video frame)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, size.width, size.height)

    // Rule of thirds grid overlay (if enabled)
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.lineWidth = 1

      // Vertical lines
      const vStep = size.width / 3
      ctx.beginPath()
      ctx.moveTo(vStep, 0)
      ctx.lineTo(vStep, size.height)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(vStep * 2, 0)
      ctx.lineTo(vStep * 2, size.height)
      ctx.stroke()

      // Horizontal lines
      const hStep = size.height / 3
      ctx.beginPath()
      ctx.moveTo(0, hStep)
      ctx.lineTo(size.width, hStep)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, hStep * 2)
      ctx.lineTo(size.width, hStep * 2)
      ctx.stroke()

      // Center crosshair
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
      ctx.beginPath()
      const centerX = size.width / 2
      const centerY = size.height / 2
      ctx.arc(centerX, centerY, 9, 0, Math.PI * 2)
      ctx.stroke()
    }
  }, [size, showGrid])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - dragStart.x
    const deltaY = e.clientY - dragStart.y

    setSize((prev) => ({
      ...prev,
      offsetX: prev.offsetX + deltaX,
      offsetY: prev.offsetY + deltaY,
    }))

    setDragStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

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
        style={{
          transform: `translate(${size.offsetX}px, ${size.offsetY}px) scale(${size.scale})`,
        }}
      >
        <canvas
          ref={canvasRef}
          className="stage-canvas"
          style={{
            width: `${size.width}px`,
            height: `${size.height}px`,
          }}
        />
      </div>
      <button
        className="grid-toggle"
        onClick={() => setShowGrid(!showGrid)}
        title="Toggle rule-of-thirds grid (G)"
      >
        {showGrid ? '⊞' : '◻'}
      </button>
    </div>
  )
}

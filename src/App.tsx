import { useEffect, useState } from 'react'
import Canvas from './components/Canvas'
import Timeline from './components/Timeline'
import './App.css'

export default function App() {
  const [fps, setFps] = useState(0)

  // FPS counter
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()

    const measureFps = () => {
      frameCount++
      const now = performance.now()
      const elapsed = now - lastTime

      if (elapsed >= 1000) {
        setFps(Math.round(frameCount))
        frameCount = 0
        lastTime = now
      }

      requestAnimationFrame(measureFps)
    }

    const rafId = requestAnimationFrame(measureFps)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return (
    <div className="app">
      <Canvas />
      <Timeline />
      <div className="fps-counter">FPS: {fps}</div>
    </div>
  )
}

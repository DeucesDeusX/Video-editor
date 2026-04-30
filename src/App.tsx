import { useEffect, useState } from 'react'
import Canvas from './components/Canvas'
import Timeline from './components/Timeline'
import Topbar from './components/Topbar'
import MediaLibrary from './components/MediaLibrary'
import FFmpegSpike from './components/FFmpegSpike'
import './App.css'

export default function App() {
  const [fps, setFps] = useState(0)
  const [railOpen, setRailOpen] = useState(true)

  useEffect(() => {
    let count = 0
    let last = performance.now()
    const loop = () => {
      count++
      const now = performance.now()
      if (now - last >= 1000) { setFps(Math.round(count)); count = 0; last = now }
      requestAnimationFrame(loop)
    }
    const id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="app">
      <Topbar railOpen={railOpen} onToggleRail={() => setRailOpen((o) => !o)} />

      <div className="app-body">
        <MediaLibrary open={railOpen} />

        <div className="app-center">
          <Canvas />
          <Timeline />
          <FFmpegSpike />
        </div>
      </div>

      <div className="fps-counter">FPS: {fps}</div>
    </div>
  )
}

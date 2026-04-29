import { useState, useCallback, useRef } from 'react'
import './Timeline.css'

interface Clip {
  id: string
  name: string
  duration: number
  type: 'video' | 'audio' | 'text'
  trackIndex: number
  position: number
}

const MOCK_CLIPS: Clip[] = Array.from({ length: 20 }, (_, i) => ({
  id: `clip-${i}`,
  name: `Clip ${i + 1}`,
  duration: 3 + Math.random() * 4, // 3-7 seconds
  type: ['video', 'video', 'audio', 'text'][Math.floor(Math.random() * 4)] as 'video' | 'audio' | 'text',
  trackIndex: i % 3,
  position: (i % 3) * 2,
}))

const TRACKS = [
  { id: 'video', name: 'Video', hue: 218 },
  { id: 'overlay', name: 'Overlay', hue: 162 },
  { id: 'audio', name: 'Audio', hue: 40 },
]

export default function Timeline() {
  const [clips, setClips] = useState<Clip[]>(MOCK_CLIPS)
  const [draggedClip, setDraggedClip] = useState<string | null>(null)
  const [playheadPosition, setPlayheadPosition] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  const handleClipDragStart = (clipId: string) => {
    setDraggedClip(clipId)
  }

  const handleClipDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleClipDrop = (targetTrackId: string, targetPosition: number) => {
    if (!draggedClip) return

    setClips((prev) =>
      prev.map((clip) => {
        if (clip.id === draggedClip) {
          const trackIndex = TRACKS.findIndex((t) => t.id === targetTrackId)
          return {
            ...clip,
            trackIndex,
            position: Math.max(0, targetPosition),
          }
        }
        return clip
      })
    )

    setDraggedClip(null)
  }

  const handleTimelineClick = (e: React.MouseEvent) => {
    const timeline = timelineRef.current
    if (!timeline) return

    const rect = timeline.getBoundingClientRect()
    const x = e.clientX - rect.left
    const position = (x / rect.width) * 30 // 30 second timeline
    setPlayheadPosition(Math.max(0, Math.min(30, position)))
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(1)
    return `${mins}:${secs}`
  }

  return (
    <div className="timeline">
      <div className="timeline-header">
        <div className="timeline-label">Timeline</div>
        <div className="timeline-ruler">
          {Array.from({ length: 31 }, (_, i) => (
            <div key={i} className="ruler-tick">
              {i === 0 || i % 5 === 0 ? formatTime(i) : ''}
            </div>
          ))}
        </div>
      </div>

      <div
        className="timeline-tracks"
        ref={timelineRef}
        onClick={handleTimelineClick}
      >
        {TRACKS.map((track) => (
          <div key={track.id} className="track">
            <div className="track-label" style={{ '--hue': track.hue } as any}>
              {track.name}
            </div>
            <div
              className="track-content"
              onDragOver={handleClipDragOver}
              onDrop={(e) => {
                e.preventDefault()
                const timeline = timelineRef.current
                if (!timeline) return
                const rect = timeline.getBoundingClientRect()
                const x = e.clientX - rect.left
                const position = (x / rect.width) * 30
                handleClipDrop(track.id, position)
              }}
            >
              {clips
                .filter((clip) => track.id === TRACKS[clip.trackIndex].id)
                .map((clip) => (
                  <div
                    key={clip.id}
                    className={`clip ${draggedClip === clip.id ? 'dragging' : ''}`}
                    style={{
                      left: `${(clip.position / 30) * 100}%`,
                      width: `${(clip.duration / 30) * 100}%`,
                      '--hue': track.hue,
                    } as any}
                    draggable
                    onDragStart={() => handleClipDragStart(clip.id)}
                    title={`${clip.name} - ${formatTime(clip.duration)}`}
                  >
                    <span className="clip-name">{clip.name}</span>
                    <span className="clip-duration">{formatTime(clip.duration)}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}

        {/* Playhead */}
        <div
          className="playhead"
          style={{
            left: `${(playheadPosition / 30) * 100}%`,
          }}
        />
      </div>

      <div className="timeline-footer">
        <span className="playhead-time">{formatTime(playheadPosition)}</span>
        <span className="total-duration">/ {formatTime(30)}</span>
      </div>
    </div>
  )
}

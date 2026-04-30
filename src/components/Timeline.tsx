import { useState, useRef, useCallback } from 'react'
import './Timeline.css'

interface Clip {
  id: string
  name: string
  duration: number
  type: 'video' | 'audio' | 'text'
  trackIndex: number
  position: number
}

interface DragState {
  clipId: string
  startPointerX: number
  startPosition: number
  clipDuration: number
}

const TOTAL_DURATION = 30 // seconds
const FIXED_DURATIONS = [4.9, 3.9, 4.9, 4.0, 4.3, 2.3, 2.5, 3.2, 3.1, 3.8, 2.9, 3.4]

// Build clips per track with deterministic cumulative positioning (no overlaps)
const clipsByTrack: Record<number, Clip[]> = { 0: [], 1: [], 2: [] }
const trackPositions: Record<number, number> = { 0: 0, 1: 0, 2: 0 }

for (let i = 0; i < 20; i++) {
  const trackIndex = i % 3
  const duration = FIXED_DURATIONS[i % FIXED_DURATIONS.length]
  const position = trackPositions[trackIndex]
  if (position + duration <= TOTAL_DURATION - 1) {
    clipsByTrack[trackIndex].push({
      id: `clip-${i}`,
      name: `Clip ${i + 1}`,
      duration,
      type: (['video', 'video', 'audio', 'text'] as const)[i % 4],
      trackIndex,
      position,
    })
    trackPositions[trackIndex] += duration
  }
}

const MOCK_CLIPS: Clip[] = Object.values(clipsByTrack).flat()

const TRACKS = [
  { id: 'video', name: 'Video', hue: 218 },
  { id: 'overlay', name: 'Overlay', hue: 162 },
  { id: 'audio', name: 'Audio', hue: 40 },
]

export default function Timeline() {
  const [clips, setClips] = useState<Clip[]>(MOCK_CLIPS)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [playheadPosition, setPlayheadPosition] = useState(0)
  const trackAreaRef = useRef<HTMLDivElement>(null)

  // Ref holds live drag data — no stale closure issues in move handler
  const dragRef = useRef<DragState | null>(null)

  const getTrackAreaRect = () => trackAreaRef.current?.getBoundingClientRect() ?? null

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(1)
    return `${mins}:${secs.padStart(4, '0')}`
  }

  const handleTrackAreaClick = (e: React.MouseEvent) => {
    // Ignore clicks that originated from a clip (they start drags, not scrubs)
    if ((e.target as HTMLElement).closest('.clip')) return
    const rect = getTrackAreaRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const time = (x / rect.width) * TOTAL_DURATION
    setPlayheadPosition(Math.max(0, Math.min(TOTAL_DURATION, time)))
  }

  const handleClipPointerDown = useCallback((e: React.PointerEvent, clip: Clip) => {
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = {
      clipId: clip.id,
      startPointerX: e.clientX,
      startPosition: clip.position,
      clipDuration: clip.duration,
    }
    setDraggingId(clip.id)
  }, [])

  const handleClipPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const rect = getTrackAreaRect()
    if (!rect) return
    const deltaX = e.clientX - drag.startPointerX
    const deltaTime = (deltaX / rect.width) * TOTAL_DURATION
    const newPosition = Math.max(
      0,
      Math.min(TOTAL_DURATION - drag.clipDuration, drag.startPosition + deltaTime)
    )
    setClips((prev) =>
      prev.map((c) => (c.id === drag.clipId ? { ...c, position: newPosition } : c))
    )
  }, [])

  const handleClipPointerUp = useCallback(() => {
    dragRef.current = null
    setDraggingId(null)
  }, [])

  return (
    <div className="timeline">
      {/* Header: label spacer + time ruler */}
      <div className="timeline-header">
        <div className="timeline-label-spacer">Timeline</div>
        <div className="timeline-ruler">
          {Array.from({ length: 31 }, (_, i) => (
            <div key={i} className="ruler-tick">
              {i === 0 || i % 5 === 0 ? formatTime(i) : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Body: track labels column + scrollable track content area */}
      <div className="timeline-body">
        <div className="track-labels">
          {TRACKS.map((track) => (
            <div key={track.id} className="track-label" style={{ '--hue': track.hue } as React.CSSProperties}>
              {track.name}
            </div>
          ))}
        </div>

        {/* All clip positioning and the playhead share this coordinate space */}
        <div
          className="track-area"
          ref={trackAreaRef}
          onClick={handleTrackAreaClick}
          style={{ cursor: draggingId ? 'grabbing' : undefined }}
        >
          {TRACKS.map((track) => (
            <div key={track.id} className="track-content">
              {clips
                .filter((clip) => TRACKS[clip.trackIndex].id === track.id)
                .map((clip) => (
                  <div
                    key={clip.id}
                    className={`clip ${draggingId === clip.id ? 'dragging' : ''}`}
                    style={{
                      left: `${(clip.position / TOTAL_DURATION) * 100}%`,
                      width: `${(clip.duration / TOTAL_DURATION) * 100}%`,
                      '--hue': track.hue,
                    } as React.CSSProperties}
                    onPointerDown={(e) => handleClipPointerDown(e, clip)}
                    onPointerMove={handleClipPointerMove}
                    onPointerUp={handleClipPointerUp}
                    title={`${clip.name} — ${formatTime(clip.duration)}`}
                  >
                    <span className="clip-name">{clip.name}</span>
                    <span className="clip-duration">{formatTime(clip.duration)}</span>
                  </div>
                ))}
            </div>
          ))}

          {/* Playhead shares track-area coordinate space — aligns exactly with clips */}
          <div
            className="playhead"
            style={{ left: `${(playheadPosition / TOTAL_DURATION) * 100}%` }}
          />
        </div>
      </div>

      <div className="timeline-footer">
        <span className="playhead-time">{formatTime(playheadPosition)}</span>
        <span className="total-duration">/ {formatTime(TOTAL_DURATION)}</span>
      </div>
    </div>
  )
}

import { useRef, useCallback } from 'react'
import { useEditorStore } from '../store/editorStore'
import './Timeline.css'

interface DragState {
  clipId: string
  startPointerX: number
  startPosition: number
  clipDuration: number
}

const TRACKS = [
  { id: 0, name: 'Video', hue: 218 },
  { id: 1, name: 'Overlay', hue: 162 },
  { id: 2, name: 'Audio', hue: 40 },
]

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(1).padStart(4, '0')
  return `${m}:${s}`
}

export default function Timeline() {
  const clips = useEditorStore((s) => s.clips)
  const playheadPosition = useEditorStore((s) => s.playheadPosition)
  const totalDuration = useEditorStore((s) => s.totalDuration)
  const moveClip = useEditorStore((s) => s.moveClip)
  const setPlayheadPosition = useEditorStore((s) => s.setPlayheadPosition)
  const isPlaying = useEditorStore((s) => s.isPlaying)

  const trackAreaRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)

  // How many ruler ticks to show (every 5s up to totalDuration)
  const tickCount = Math.ceil(totalDuration / 5) + 1
  const tickInterval = 5

  const getTrackAreaRect = () => trackAreaRef.current?.getBoundingClientRect() ?? null

  const handleTrackAreaClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.clip')) return
    const rect = getTrackAreaRect()
    if (!rect) return
    const time = ((e.clientX - rect.left) / rect.width) * totalDuration
    setPlayheadPosition(time)
  }

  const handleClipPointerDown = useCallback((e: React.PointerEvent, clipId: string, clipPosition: number, clipDuration: number) => {
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { clipId, startPointerX: e.clientX, startPosition: clipPosition, clipDuration }
  }, [])

  const handleClipPointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current
    if (!drag) return
    const rect = getTrackAreaRect()
    if (!rect) return
    const deltaTime = ((e.clientX - drag.startPointerX) / rect.width) * totalDuration
    const newPos = Math.max(0, Math.min(totalDuration - drag.clipDuration, drag.startPosition + deltaTime))
    moveClip(drag.clipId, newPos, clips.find((c) => c.id === drag.clipId)?.trackIndex ?? 0)
  }, [clips, moveClip, totalDuration])

  const handleClipPointerUp = useCallback(() => { dragRef.current = null }, [])

  const isDragging = dragRef.current !== null

  return (
    <div className="timeline">
      {/* Header */}
      <div className="timeline-header">
        <div className="timeline-label-spacer">Timeline</div>
        <div className="timeline-ruler">
          {Array.from({ length: tickCount }, (_, i) => (
            <div key={i} className="ruler-tick" style={{ left: `${(i * tickInterval / totalDuration) * 100}%` }}>
              {formatTime(i * tickInterval)}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="timeline-body">
        <div className="track-labels">
          {TRACKS.map((t) => (
            <div key={t.id} className="track-label" style={{ '--hue': t.hue } as React.CSSProperties}>
              {t.name}
            </div>
          ))}
        </div>

        <div
          className="track-area"
          ref={trackAreaRef}
          onClick={handleTrackAreaClick}
          style={{ cursor: isDragging ? 'grabbing' : undefined }}
          onPointerMove={handleClipPointerMove}
          onPointerUp={handleClipPointerUp}
        >
          {TRACKS.map((track) => (
            <div key={track.id} className="track-content">
              {clips.filter((c) => c.trackIndex === track.id).map((clip) => (
                <div
                  key={clip.id}
                  className="clip"
                  style={{
                    left: `${(clip.position / totalDuration) * 100}%`,
                    width: `${(clip.duration / totalDuration) * 100}%`,
                    '--hue': track.hue,
                  } as React.CSSProperties}
                  onPointerDown={(e) => handleClipPointerDown(e, clip.id, clip.position, clip.duration)}
                  title={`${clip.name} — ${formatTime(clip.duration)}`}
                >
                  <span className="clip-name">{clip.name}</span>
                  <span className="clip-duration">{formatTime(clip.duration)}</span>
                </div>
              ))}

              {/* Empty state */}
              {clips.length === 0 && track.id === 0 && (
                <div className="track-empty">Drop videos here or use the import button above</div>
              )}
            </div>
          ))}

          {/* Playhead */}
          <div
            className={`playhead ${isPlaying ? 'playing' : ''}`}
            style={{ left: `${(playheadPosition / totalDuration) * 100}%` }}
          />
        </div>
      </div>

      <div className="timeline-footer">
        <span className="playhead-time">{formatTime(playheadPosition)}</span>
        <span className="total-duration">/ {formatTime(totalDuration)}</span>
        <span className="clip-count">{clips.length} clip{clips.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

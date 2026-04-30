import { useRef, useState } from 'react'
import { useEditorStore, Clip } from '../store/editorStore'
import './MediaLibrary.css'

function ClipThumb({ clip }: { clip: Clip }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  if (clip.type === 'audio') {
    return (
      <div className="asset-thumb asset-thumb--audio">
        <span>♪</span>
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      className="asset-thumb"
      src={clip.objectURL}
      muted
      preload="metadata"
      onLoadedMetadata={(e) => {
        const v = e.currentTarget
        v.currentTime = Math.min(0.5, v.duration * 0.1)
      }}
    />
  )
}

function formatDur(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

interface Props {
  open: boolean
}

export default function MediaLibrary({ open }: Props) {
  const clips = useEditorStore((s) => s.clips)
  const addFiles = useEditorStore((s) => s.addFiles)
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setLoading(true)
    await addFiles(files)
    setLoading(false)
  }

  return (
    <aside
      className={`rail ${open ? '' : 'collapsed'} ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files) }}
    >
      {open && (
        <>
          <div className="rail-head">
            <span className="sec-label">Library</span>
            <label className="btn tiny" style={{ cursor: 'pointer' }}>
              {loading ? '…' : '+ Add'}
              <input
                ref={inputRef}
                type="file"
                multiple
                accept="video/*,audio/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          </div>

          <div className="rail-body">
            {clips.length === 0 ? (
              <div className="rail-empty">
                <div className="rail-empty-icon">⊕</div>
                <div className="micro" style={{ textAlign: 'center' }}>
                  Drop videos here<br />or click + Add
                </div>
              </div>
            ) : (
              <div className="shelf">
                <div className="shelf-head">
                  <span className="sec-label">Clips ({clips.length})</span>
                </div>
                <div className="asset-grid">
                  {clips.map((clip) => (
                    <div
                      key={clip.id}
                      className={`asset ${selectedId === clip.id ? 'selected' : ''}`}
                      onClick={() => setSelectedId(clip.id === selectedId ? null : clip.id)}
                      title={`${clip.name}\n${formatDur(clip.duration)}\ndbl-click to jump to clip`}
                      onDoubleClick={() => {
                        useEditorStore.getState().setPlayheadPosition(clip.position)
                      }}
                    >
                      <ClipThumb clip={clip} />
                      <span className="kind">
                        {clip.type === 'audio' ? 'AUD' : 'VID'} · {formatDur(clip.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {!open && (
        <div className="rail-collapsed-icons">
          <span title="Media library" style={{ fontSize: 16, color: 'var(--muted)' }}>⊞</span>
        </div>
      )}
    </aside>
  )
}

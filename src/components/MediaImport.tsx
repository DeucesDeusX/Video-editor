import { useRef, useState } from 'react'
import { useEditorStore } from '../store/editorStore'
import './MediaImport.css'

export default function MediaImport() {
  const addFiles = useEditorStore((s) => s.addFiles)
  const clips = useEditorStore((s) => s.clips)
  const [isDragOver, setIsDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setLoading(true)
    await addFiles(files)
    setLoading(false)
  }

  return (
    <div
      className={`media-import ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files) }}
    >
      <button
        className="import-btn"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
      >
        {loading ? 'Loading…' : '+ Import Videos'}
      </button>

      {clips.length > 0 && (
        <span className="import-hint">or drag files anywhere onto the timeline</span>
      )}

      {clips.length === 0 && !isDragOver && (
        <span className="import-hint">or drag & drop video files</span>
      )}

      {isDragOver && (
        <span className="import-hint drop-active">Drop to add clips</span>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*,audio/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}

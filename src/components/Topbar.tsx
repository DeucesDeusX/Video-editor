import { useEditorStore } from '../store/editorStore'
import './Topbar.css'

interface Props {
  railOpen: boolean
  onToggleRail: () => void
}

export default function Topbar({ railOpen, onToggleRail }: Props) {
  const projectName = useEditorStore((s) => s.projectName)
  const setProjectName = useEditorStore((s) => s.setProjectName)
  const clips = useEditorStore((s) => s.clips)
  const playheadPosition = useEditorStore((s) => s.playheadPosition)
  const totalDuration = useEditorStore((s) => s.totalDuration)

  const pct = totalDuration > 0 ? Math.round((playheadPosition / totalDuration) * 100) : 0

  return (
    <header className="topbar">
      <button className="btn ghost icon" onClick={onToggleRail} title="Toggle media library">
        {railOpen ? '◂' : '▸'}
      </button>

      <div className="topbar-brand">Video Editor</div>
      <div className="topbar-divider" />

      <input
        className="topbar-project-name"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Untitled project"
        spellCheck={false}
      />

      <div className="topbar-divider" />

      <span className="chip">
        {clips.length} clip{clips.length !== 1 ? 's' : ''}
      </span>

      {clips.length > 0 && (
        <span className="chip chip-progress">
          {pct}%
        </span>
      )}

      <div style={{ flex: 1 }} />

      <button className="btn primary" disabled={clips.length === 0} title="Export (coming in Phase 5)">
        Export ▾
      </button>
    </header>
  )
}

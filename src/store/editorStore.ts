import { create } from 'zustand'

export interface Clip {
  id: string
  name: string
  duration: number
  type: 'video' | 'audio'
  trackIndex: number
  position: number
  objectURL: string
}

interface EditorState {
  clips: Clip[]
  playheadPosition: number
  isPlaying: boolean
  totalDuration: number
  projectName: string

  addFiles: (files: FileList | File[]) => Promise<void>
  moveClip: (id: string, position: number, trackIndex: number) => void
  setPlayheadPosition: (pos: number) => void
  setIsPlaying: (playing: boolean) => void
  setProjectName: (name: string) => void
  tick: (delta: number) => void
}

function getMediaDuration(url: string, isVideo: boolean): Promise<number> {
  return new Promise((resolve) => {
    const el = document.createElement(isVideo ? 'video' : 'audio')
    el.src = url
    el.onloadedmetadata = () => { resolve(el.duration); el.src = '' }
    el.onerror = () => resolve(30)
  })
}

export const useEditorStore = create<EditorState>((set, get) => ({
  clips: [],
  playheadPosition: 0,
  isPlaying: false,
  totalDuration: 120,
  projectName: '',

  addFiles: async (files) => {
    const accepted = Array.from(files).filter(
      (f) => f.type.startsWith('video/') || f.type.startsWith('audio/')
    )
    if (!accepted.length) return

    const newClips: Clip[] = await Promise.all(
      accepted.map(async (file) => {
        const objectURL = URL.createObjectURL(file)
        const isVideo = file.type.startsWith('video/')
        const duration = await getMediaDuration(objectURL, isVideo)

        // Place sequentially on the video track after existing clips
        const { clips } = get()
        const trackClips = clips
          .filter((c) => c.trackIndex === 0)
          .sort((a, b) => a.position - b.position)
        const last = trackClips[trackClips.length - 1]
        const position = last ? last.position + last.duration : 0

        return {
          id: `clip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          name: file.name.replace(/\.[^.]+$/, ''),
          duration: Math.round(duration * 10) / 10,
          type: isVideo ? 'video' : 'audio',
          trackIndex: 0,
          position,
          objectURL,
        }
      })
    )

    set((state) => {
      const allClips = [...state.clips, ...newClips]
      const maxEnd = allClips.reduce((m, c) => Math.max(m, c.position + c.duration), 0)
      return {
        clips: allClips,
        totalDuration: Math.max(state.totalDuration, maxEnd + 10),
      }
    })
  },

  moveClip: (id, position, trackIndex) =>
    set((state) => ({
      clips: state.clips.map((c) =>
        c.id === id ? { ...c, position: Math.max(0, position), trackIndex } : c
      ),
    })),

  setPlayheadPosition: (pos) =>
    set((state) => ({ playheadPosition: Math.max(0, Math.min(state.totalDuration, pos)) })),

  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setProjectName: (projectName) => set({ projectName }),

  // Called each animation frame while playing — advances playhead by delta seconds
  tick: (delta) =>
    set((state) => {
      const next = state.playheadPosition + delta
      if (next >= state.totalDuration) return { playheadPosition: 0, isPlaying: false }
      return { playheadPosition: next }
    }),
}))

# Video Editor — Project Index

#status/active #priority/1

## Goal

Replace CapCut with an opinionated, template-driven video editor for small ecommerce creators (jewelry, fashion, handmade goods). Build for 9:16 vertical Reels/TikTok. Self-hosted, local-first MVP.

## Status

✅ **Spec phase complete** (2026-04-29). Architecture decided, MVP features scoped, tech stack chosen. Ready to begin implementation spikes.

**See:** `SPEC.md` for full specification, decisions, and feature breakdown.

## Key Decisions (Made 2026-04-29)

### Platform & deployment
- **Primary:** React web app (Vite) for instant cross-platform access.
- **Secondary:** Electron wrapper v1.1+ if market validates.
- **Rejected:** Native desktop (Qt/Swift/C++); too slow for solo founder.

### MVP Features
- Multi-track timeline (video + audio + text).
- Clip editing: split, trim, move, delete, snap.
- Transforms: opacity, scale, position, rotation.
- Basic transitions: crossfade (+ slide/zoom optional).
- Text overlays with fade in/out.
- Simple color controls: exposure, contrast, saturation.
- Export: 9:16 MP4 via FFmpeg.wasm preprocessing + WebCodecs encoding.

### Render Pipeline
- **Hybrid:** FFmpeg.wasm for codec preprocessing (normalize incoming media).
- **Export:** WebCodecs VideoEncoder for final render (faster, GPU-accelerated).
- Fallback to FFmpeg.wasm if WebCodecs unavailable.

### Tech Stack
- Frontend: React 18 + TypeScript + Vite.
- Media: FFmpeg.wasm + Web Audio API + WebCodecs (all browser-native).
- Storage: IndexedDB for local project persistence (no backend for MVP).
- UI: shadcn/ui or Mantine for components.
- Drag-and-drop: dnd-kit for timeline interactions.

### Differentiator
- **Template system:** Pre-designed 9:16 templates (hero + hand + closeup + pricing).
- **Brand kits:** Save fonts, colors, logo positions, apply across projects.
- **Guided workflow:** "Import clips → pick template → customize text → export."
- **Not:** generic CapCut clone; purpose-built for ecommerce speed.

### Multi-user
- Single-user MVP (everything local browser).
- Project schema designed for backend future (v2.0+).
- Cloud + auth deferred; no real-time collaboration for v1.

## Next Immediate Steps

### Validation spikes (3–4 days total)
1. **Spike: Canvas + timeline prototype**
   - React canvas preview + clip drag-and-drop.
   - Measure timeline performance with 20+ clips.
   - Goal: Prove the UI won't be janky.

2. **Spike: FFmpeg.wasm preprocessing**
   - Test codec normalization in a Web Worker.
   - Measure load time + preprocessing speed.
   - Goal: Prove preprocessing pipeline works.

3. **Spike: WebCodecs export**
   - Render a simple 5-clip timeline to WebCodecs.
   - Measure encode time for 30-second 9:16 video.
   - Goal: Prove export speed is acceptable.

### Then: Phase 0 (core canvas + timeline)
- React + Vite scaffold.
- Canvas preview + playhead.
- Multi-track timeline UI.
- See `SPEC.md` § 5 for full phase breakdown.

## Notes

- **Decision record:** All decisions documented in `SPEC.md` with rationale and risk mitigation.
- **Scope:** See `SPEC.md` § 9 for explicit out-of-scope items (live streaming, mobile, AI, collab).
- **Performance baseline:** Target <5 min to export a 30-second reel; expect 5–10 min with current tech.

## Decisions log

- **2026-04-29:** Spec finalized. Platform, features, stack, differentiator, and multi-user scope all decided. Ready to spike implementation.

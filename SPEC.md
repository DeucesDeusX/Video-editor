# Video Editor — Project Specification

#status/active #priority/1

**Last updated:** 2026-04-29  
**Phase:** Pre-implementation (spec finalized, architecture decided)

---

## Executive Summary

A browser-first video editor designed for small ecommerce sellers (jewelry, fashion, handmade goods). Replaces CapCut with an opinionated, template-driven workflow optimized for 9:16 vertical Reels/TikTok clips. Self-hosted, local-first for MVP. Electron desktop wrapper planned for v1.1+.

---

## 1. Platform & Architecture

### Primary: Web App (React + Vite)
- **Why:** Instant cross-platform access (no installers), fast iteration, proven ecosystem for timeline UIs.
- **Target browsers:** Modern Chrome/Edge/Firefox/Safari; assume WebCodecs + IndexedDB support.

### Secondary: Electron Wrapper (v1.1+)
- Same React/Vite codebase, wrapped in Electron shell for "native" feel if market demands it.
- Low-lift once web app is solid; Electron is mature and widely used.

### Anti-pattern: Native desktop (Qt/Swift/C++)
- Deferred indefinitely; complexity vs. value not justified for MVP.

---

## 2. Feature Scope: MVP vs. Nice-to-Have

### MUST HAVE (MVP cut line):

#### Multi-track timeline
- **1 main video track + 1 overlay video track + 1 audio track** minimum.
- Support: drag, trim, split, move clips.
- Snap to playhead for alignment.

#### Basic editing operations
- **Split:** cut clip at playhead.
- **Trim:** drag clip edges to shorten.
- **Move:** drag clip left/right on timeline.
- **Delete:** remove clip from track.

#### Visual transform controls
- Per-clip opacity (0–100%).
- Per-clip scale (zoom in/out).
- Per-clip position (X/Y offset).
- Per-clip rotation (0–360°, useful for product angles).

#### Transitions
- **Crossfade** (essential).
- **Slide** (optional but easy, nice for flow).
- Optional: **zoom in/out** (common in CapCut-style editing).

#### Color controls (basic)
- Per-clip: exposure, contrast, saturation.
- No LUT packs or advanced grading; keep it simple.

#### Audio controls
- Per-clip volume fader (0–100%, mute).
- One music track (separate from clip audio).
- No mixing, panning, or EQ for MVP.

#### Text overlay track
- At least 1 text overlay layer.
- Styling: font family, size, color, bold/italic.
- Animations: fade in, fade out (preset, no keyframing yet).
- Position on canvas (drag-to-place).

#### Import & export
- **Import:** Drag local video/audio/image files onto canvas.
- **Export:** Render to 9:16 (1080×1920) vertical video.
- Format: MP4 (H.264 + AAC).
- Progress feedback during export.

### NICE-TO-HAVE (defer to v1.1+):
- Massive effect/transition library (CapCut's hundreds of effects).
- Advanced keyframing on multiple properties.
- Auto-captions, AI beat-sync, template marketplace.
- Mobile app or responsive mobile editing.
- LUT packs, color grading tools.

---

## 3. Render Pipeline

### Hybrid approach: FFmpeg.wasm + WebCodecs

#### Preprocessing (FFmpeg.wasm)
- Normalize incoming clips: convert to H.264 MP4, align frame rates, ensure compatible codecs.
- Run in a Web Worker to avoid blocking the UI.
- Output: ready-to-slice, ready-to-composite MP4s.

#### Export/Encoding (WebCodecs VideoEncoder)
- Assemble timeline into a single video stream (composite all tracks, render text, apply effects).
- Encode final output using WebCodecs (faster, GPU-accelerated in modern browsers).
- Fallback to FFmpeg.wasm encoding if WebCodecs unavailable (older browsers).

#### Why this split:
- FFmpeg.wasm handles codec normalization (users upload weird formats).
- WebCodecs handles the final render (faster, native browser API).
- Pattern used in production: Capcut-like web editors (descript, adobe express).

---

## 4. Tech Stack

### Frontend
- **React 18** (TypeScript) + **Vite** for bundling.
- **No SSR needed;** client-only SPA.
- State: Consider **Zustand** or **Redux Toolkit** for timeline/project state (lots of nested clip data).
- Drag-and-drop: **dnd-kit** or **react-beautiful-dnd** for timeline interactions.
- Canvas/preview: **Canvas API** or **Three.js** (lightweight) for frame scrubbing and playback.
- UI components: **shadcn/ui** or **Mantine** for buttons, panels, modals.

### Media processing
- **FFmpeg.wasm** (@ffmpeg/ffmpeg) for preprocessing.
- **WebCodecs API** (native browser) for encoding.
- **Web Audio API** (native browser) for audio playback and mixing.

### Storage
- **IndexedDB** for local project persistence (JSON schema).
- **File System Access API** (optional, for direct file import) if browser supports it.
- No backend, no database for MVP.

### Build & deployment
- **Vite** for dev server and production builds.
- **GitHub Pages** or **Vercel** for static hosting (optional, or self-host as a local-only app).

---

## 5. MVP Feature Set (Ruthless Cut)

### Phase 0: Core canvas + timeline
- [ ] React + Vite project scaffold.
- [ ] Canvas preview window with playhead scrub and play/pause.
- [ ] Multi-track timeline UI (drag, snap, basic visual feedback).
- [ ] Track types: video, audio, text.

### Phase 1: Media import & clip ops
- [ ] Drag-drop import (video, audio, image files).
- [ ] FFmpeg.wasm preprocessing pipeline (normalize codecs).
- [ ] Clip operations: split, trim, move, delete, snap.
- [ ] Clip visibility toggle (eye icon).

### Phase 2: Visual & audio controls
- [ ] Per-clip opacity slider.
- [ ] Per-clip scale/position transform (simple drag-to-place on canvas).
- [ ] Per-clip rotation (small UI).
- [ ] Per-clip volume fader (audio clips).
- [ ] Basic color: exposure, contrast, saturation sliders (per clip).

### Phase 3: Transitions & effects
- [ ] Crossfade transition (default, drag-to-apply).
- [ ] Slide & zoom transitions (optional if time).
- [ ] Apply transition UI: drag transition icon onto clip boundary.

### Phase 4: Text overlays
- [ ] Text track with add/remove text boxes.
- [ ] Text styling: font, size, color, bold/italic.
- [ ] Text animations: fade in/out presets.
- [ ] Drag-to-position on canvas.

### Phase 5: Export
- [ ] Render final timeline to WebCodecs VideoEncoder.
- [ ] Progress bar during encode.
- [ ] Download MP4 (1080×1920 vertical).
- [ ] Fallback to FFmpeg.wasm if WebCodecs unavailable.

---

## 6. Differentiator: Template-Driven, Niche Workflow

### Beyond "I own it"—target ecommerce creators:

#### Template system
- Pre-designed 9:16 templates for product shots:
  - **Hero shot + hand demonstration + closeup + pricing text.**
  - **Before/after styling product.**
  - **Carousel: multiple angles with auto-timing to music.**
- Users: "Pick a template, drop in 5 clips, auto-arrange to beat." Massive time saver.
- v1 scope: 3–5 hardcoded templates; v1.1+ marketplace for community templates.

#### Brand kit feature
- Save project-level brand settings:
  - Font family, color palette, logo asset, text position defaults.
  - Export across multiple projects with one click; every reel looks on-brand.
- Solves: "I make 10 product reels a week and they all need the same fonts/colors."

#### Guided workflow (not freeform)
- "Import product clips → Pick template → Customize text → Export for TikTok/Etsy."
- Opinionated UX that guides small sellers instead of overwhelming them with generic editing power.
- Much faster than CapCut for this specific use case.

### Why this matters:
- CapCut is a generic editor; this is purpose-built for ecommerce.
- Niche focus = faster workflows = real time savings.
- Brand kits + templates = repeat users who build libraries over time.

---

## 7. Multi-user Scope: Single-user MVP

### v1.0 (this project)
- **Single-user only:** Everything local to the browser, no auth.
- Projects stored in IndexedDB (JSON structure).
- Export/import projects as `.json` files for sharing (manual, no sync).
- No accounts, no cloud backup, no real-time collaboration.

### v2.0+ (future)
- Add backend (Node/Postgres) for:
  - User accounts & authentication.
  - Cloud project storage (backup, share links).
  - Very light collaboration: share project link, comment on clips (not Google Docs–style simultaneous editing).
- Real-time multi-user timelines = too complex for v1; defer.

### Why single-user for MVP:
- Eliminates auth, cloud infra, sync/conflict logic.
- You can still *design* the project schema to be backend-compatible (don't paint yourself into a corner).
- Focus on great editing, not great ops.

---

## 8. Success Metrics

### Launch (v1.0)
- [ ] Import, edit, export a simple 30-second product reel in under 5 minutes.
- [ ] Exports look professional: 9:16, smooth playback, text overlays readable.
- [ ] No browser crashes on 5-minute timelines with 20+ clips.

### Post-launch (v1.1+)
- [ ] Templates reduce time-to-export by 50% vs. freeform editing.
- [ ] Brand kit adoption: 80%+ of repeat users set up a brand kit.
- [ ] Electron wrapper adopted by 30%+ of users (signal to invest further).

---

## 9. Out of Scope (Explicitly)

- **Live streaming:** No real-time broadcast.
- **Mobile editing:** Desktop/web only for MVP.
- **Collaboration:** Single user per project.
- **360° video, VR, advanced motion graphics:** Out of scope.
- **Social integrations:** Direct upload to TikTok/Instagram (users export, then upload manually).
- **AI:** No auto-captions, auto-sync, or generative effects for v1.

---

## 10. Known Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| WebCodecs browser support | Can't export on older browsers | Fallback to FFmpeg.wasm encoding (slower, but works). |
| FFmpeg.wasm size (~30MB) | Slow initial load | Lazy-load FFmpeg only when user imports media. Show progress. |
| Timeline performance (20+ clips) | UI lag, poor playback | Use React.memo, virtual scrolling for timeline, Web Workers for heavy compute. |
| Codec incompatibility | Import failures on weird formats | FFmpeg.wasm preprocessing catches 99% of issues. Provide clear error messages. |
| Export time (5–10 min for 30s video) | User frustration | Progress bar + ETA. Document that encoding is slow; sell Electron version later as "faster." |

---

## 11. Project Structure (Planned)

```
01-Video-Editor/
├── _index.md                 (this file's intro)
├── SPEC.md                   (this file — decisions + details)
├── IMPLEMENTATION.md         (phase breakdown, sprint plan)
├── /src
│   ├── /components           (Canvas, Timeline, ControlPanel, etc.)
│   ├── /store                (Zustand or Redux Toolkit for project state)
│   ├── /hooks                (useTimeline, useExport, etc.)
│   ├── /workers              (FFmpeg preprocessing in Web Worker)
│   ├── /utils                (video helpers, canvas utils, etc.)
│   └── App.tsx               (main entry)
├── package.json
├── vite.config.ts
└── /public                   (static assets, templates)
```

---

## 12. Next Steps

1. **Spike: Canvas + timeline prototype** (2–3 days)
   - Prove React canvas preview + clip drag work smoothly.
   - Get a feel for timeline performance.

2. **Spike: FFmpeg.wasm preprocessing** (1 day)
   - Test codec normalization pipeline in Web Worker.
   - Measure load time + preprocessing speed.

3. **Spike: WebCodecs export** (1 day)
   - Render a simple timeline to WebCodecs.
   - Measure encode time for a 30-second 9:16 video.

4. **Start Phase 0 (core canvas + timeline)** once spikes are green.

---

## Decisions Log

- **2026-04-29:** Spec finalized.
  - ✅ Platform: React web app + future Electron wrapper.
  - ✅ MVP features defined (multi-track, transitions, text, export).
  - ✅ Tech stack: React + Vite + FFmpeg.wasm + WebCodecs.
  - ✅ Differentiator: Templates + brand kits for ecommerce creators.
  - ✅ Multi-user: Single-user MVP, cloud v2+.

---

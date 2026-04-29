# Video Editor — Implementation Roadmap

#status/active #priority/1

**Last updated:** 2026-04-29  
**Planned duration:** 8–12 weeks for MVP (Phase 0–5)

---

## Overview

This document breaks the MVP (from `SPEC.md`) into phased, milestoned work. Each phase has clear acceptance criteria and is designed for solo-founder iteration.

---

## Validation Spikes (Weeks 1–2)

### Goal
De-risk the tech stack and performance. Prove canvas performance, FFmpeg preprocessing, and WebCodecs export are viable.

### Spike 1: Canvas + Timeline UI (Days 1–2)

**Goal:** Prototype a React canvas with multi-track timeline. Verify drag-and-drop feels smooth with 20+ clips.

**Deliverable:**
- React + Vite skeleton project (GitHub repo ready).
- Canvas preview window (1080×1920, scrubber bar, play/pause).
- Mock timeline with 5 draggable clip boxes.
- No real video processing yet; just UI proof.

**Success criteria:**
- [ ] Scrubber moves smoothly (no jank at 60fps).
- [ ] Dragging 20 clips on timeline feels responsive.
- [ ] Canvas preview renders without lag.

**Risks:**
- React re-renders on every clip drag = lag.
  - **Mitigation:** Use `useCallback` + `React.memo`; move drag state to a Ref if needed.

**Estimated time:** 1–2 days.

---

### Spike 2: FFmpeg.wasm Preprocessing (Day 3)

**Goal:** Normalize incoming video/audio files using FFmpeg.wasm in a Web Worker. Measure load time and preprocessing speed.

**Deliverable:**
- Web Worker that loads FFmpeg.wasm (lazy, on demand).
- Process a sample MP4 (convert to H.264, align frame rate to 30fps).
- Return normalized file or error.
- Measure: load time, preprocessing speed, output file size.

**Success criteria:**
- [ ] FFmpeg.wasm loads in <2 seconds on first import.
- [ ] Preprocessing a 30-second 1080p file takes <10 seconds.
- [ ] Output is valid, playable MP4.

**Risks:**
- FFmpeg.wasm is 30MB; lazy-load it.
  - **Mitigation:** Load only on first import; show spinner with ETA.
- Some codecs fail to transcode.
  - **Mitigation:** Catch errors, provide clear message ("Please convert to MP4 first").

**Estimated time:** 1 day.

---

### Spike 3: WebCodecs Export (Day 4)

**Goal:** Render a timeline of clips (no effects yet, just clips on a canvas) using WebCodecs VideoEncoder. Measure encode time.

**Deliverable:**
- Take the canvas + timeline from Spike 1.
- Write a simple renderer: loop through timeline, draw each clip frame-by-frame to canvas, encode via WebCodecs.
- Render a 30-second timeline to 9:16 MP4.
- Measure: encode time, output quality, file size.

**Success criteria:**
- [ ] Render completes in <10 minutes for 30-second video on modern hardware.
- [ ] Output MP4 plays back smoothly.
- [ ] File size is reasonable (<20MB for 30s 1080p).

**Risks:**
- WebCodecs unavailable on Safari/older browsers.
  - **Mitigation:** Fallback to FFmpeg.wasm encoding (slower, but works).
- GPU encoding not available on some systems.
  - **Mitigation:** Detect and use software fallback; show warning.

**Estimated time:** 1 day.

---

### Decision Gate: Proceed to Phase 0?
- If all spikes succeed: green light to start Phase 0 (Week 2).
- If spikes fail: investigate root causes, adjust architecture (e.g., switch to Electron early, or reduce timeline scope).

---

## Phase 0: Core Canvas + Timeline (Weeks 2–3)

### Goal
Build the foundation: canvas preview, multi-track timeline UI, clip drag-and-drop, and basic operations.

### Deliverables

#### 1. Project structure & state management
- [ ] Zustand store for project state (tracks, clips, playhead, metadata).
- [ ] Project JSON schema (importable/exportable).
- [ ] React components: Canvas, Timeline, ControlPanel (shell).
- [ ] Vite config + dev server running.

#### 2. Canvas preview
- [ ] 1080×1920 canvas element.
- [ ] Render playhead position + current frame from timeline.
- [ ] Play/pause buttons + scrubber bar (drag playhead).
- [ ] Volume meter for audio track.

#### 3. Timeline UI
- [ ] Visual multi-track layout (video track, overlay track, audio track).
- [ ] Clip boxes with clip name, duration display.
- [ ] Drag clips left/right (move on timeline).
- [ ] Snap to playhead (magnetic grid every 30 frames).
- [ ] Click clip to select; selection highlight.

#### 4. Basic clip operations
- [ ] Split: click clip, split at playhead.
- [ ] Trim: drag clip edge to shorten.
- [ ] Delete: select clip, press Delete or click trash icon.
- [ ] Visibility toggle: eye icon to hide/show track.

### Acceptance criteria
- [ ] Load a simple 3-clip timeline (mock data) in <1 second.
- [ ] Drag 5 clips smoothly without lag (60fps).
- [ ] Split/trim/delete a clip in <500ms (instant UI feedback).
- [ ] Export project as JSON, re-import, clips in same position.

### Testing
- [ ] Unit tests for Zustand store.
- [ ] Visual regression tests for canvas (headless browser).
- [ ] Manual testing on Chrome/Firefox/Safari.

### Estimated time: 2 weeks (10 working days).

---

## Phase 1: Media Import & FFmpeg Preprocessing (Week 4)

### Goal
Allow users to import local video/audio/image files. Preprocess via FFmpeg.wasm in a Web Worker.

### Deliverables

#### 1. Drag-and-drop import
- [ ] Drop zone on timeline (visual feedback).
- [ ] Accept video (mp4, webm, mov, etc.), audio (mp3, wav, m4a), image (jpg, png) files.
- [ ] Show import progress (FFmpeg preprocessing spinner).

#### 2. FFmpeg preprocessing pipeline
- [ ] Web Worker loads FFmpeg.wasm (lazy, on first import).
- [ ] Normalize all video to H.264 MP4, 30fps, 1080p max width.
- [ ] Normalize audio to AAC, 44.1kHz, mono/stereo.
- [ ] Handle errors gracefully: show user-friendly error message if codec unsupported.
- [ ] Cache normalized files in IndexedDB (avoid reprocessing).

#### 3. Clip metadata extraction
- [ ] After normalization, extract: duration, dimensions, codecs, frame rate.
- [ ] Display in timeline (e.g., "3:45" duration label).

### Acceptance criteria
- [ ] Import a 30-second 4K ProRes video → normalized to H.264 MP4 in <10 seconds.
- [ ] Import an MP3 → converted to AAC in <2 seconds.
- [ ] Re-import same file → uses cached version (instant).
- [ ] Error on import of unsupported format → clear user message, no crash.

### Testing
- [ ] Test import with various codec combinations (h265, prores, mov, webm, etc.).
- [ ] Verify output is valid MP4 (ffprobe check in CI).
- [ ] Performance test: import 10 files in sequence, measure memory + CPU.

### Estimated time: 1 week (5 working days).

---

## Phase 2: Visual & Audio Controls (Week 5)

### Goal
Add per-clip transform and color controls, plus audio volume faders.

### Deliverables

#### 1. Transform controls (opacity, scale, position, rotation)
- [ ] Right-click clip → "Properties" panel.
- [ ] Sliders: opacity (0–100%), scale (0.1–2.0x), rotation (0–360°).
- [ ] Position: X/Y offset inputs, or drag on canvas preview.
- [ ] Real-time preview on canvas as user adjusts.

#### 2. Color controls (exposure, contrast, saturation)
- [ ] In Properties panel: exposure (−2 to +2), contrast (0.5–2.0), saturation (0–2.0).
- [ ] Apply to clip; real-time preview.
- [ ] Store as clip properties in project state.

#### 3. Audio volume fader
- [ ] Audio clips: per-clip volume fader (0–100%, mute toggle).
- [ ] Music track: separate volume fader.
- [ ] Visual feedback: waveform display (optional, low priority).

#### 4. Canvas preview updates
- [ ] Render clips with current opacity/scale/rotation/color on canvas.
- [ ] Update in real-time as user adjusts properties.

### Acceptance criteria
- [ ] Adjust opacity of a clip → preview updates in <50ms.
- [ ] Rotate clip 45° → canvas renders correctly.
- [ ] Volume fader set to 0 → audio mutes on playback.
- [ ] Export video → all color/opacity/rotation settings applied to output.

### Testing
- [ ] Unit tests for transform + color calculations.
- [ ] Visual tests: render clip with various opacity/scale/rotation combos.
- [ ] Audio test: playback with volume fader.

### Estimated time: 1 week (5 working days).

---

## Phase 3: Transitions (Week 6)

### Goal
Add crossfade and optional slide/zoom transitions between clips.

### Deliverables

#### 1. Transition UI
- [ ] Icon/button between two clips on timeline: "Add transition."
- [ ] Dropdown: Crossfade, Slide, Zoom.
- [ ] Duration slider (0.1–2.0 seconds).
- [ ] Delete transition button.

#### 2. Crossfade implementation
- [ ] Blend two clips: opacity of first clip 100→0, second clip 0→100 over duration.
- [ ] Preview on canvas in real-time.

#### 3. Slide & Zoom (optional, if time)
- [ ] Slide: first clip slides out horizontally, second slides in.
- [ ] Zoom: first clip zooms out to black, second zooms in from black.

#### 4. Export support
- [ ] Render transitions frame-by-frame during export.
- [ ] Ensure smooth blend on output video.

### Acceptance criteria
- [ ] Apply crossfade between two clips → smooth fade on canvas preview.
- [ ] Export with transition → output video shows smooth blend.
- [ ] Transition duration set to 1s → exactly 1 second on timeline.

### Testing
- [ ] Visual test: render crossfade, slide, zoom frame-by-frame.
- [ ] Export test: 10-second video with 3 transitions → output looks correct.

### Estimated time: 1 week (5 working days).

---

## Phase 4: Text Overlays (Week 7)

### Goal
Add a text track with styling and fade in/out animations.

### Deliverables

#### 1. Text track UI
- [ ] New track type: "Text" (separate from video/audio).
- [ ] Add text box: click "+" button, set duration on timeline.
- [ ] Edit text: double-click text box, open text editor panel.

#### 2. Text styling
- [ ] Font family, size, color, bold/italic, alignment (left/center/right).
- [ ] Position on canvas: drag-to-place, or X/Y inputs.

#### 3. Text animations
- [ ] Fade in: start invisible, fade to full opacity over duration (e.g., 0.3s).
- [ ] Fade out: full opacity, fade to invisible over duration.
- [ ] Presets: fade in only, fade out only, both.

#### 4. Canvas preview
- [ ] Render text on top of video preview with current styling + animation.

### Acceptance criteria
- [ ] Add a text box with "Sale Ends Soon!" → appears on canvas.
- [ ] Set fade in (0.5s) + fade out (0.5s) → preview shows animation.
- [ ] Export → text appears in final video with correct styling + animation.

### Testing
- [ ] Text rendering test: various fonts, sizes, colors, positions.
- [ ] Animation test: fade in/out timing correct on frame-by-frame export.
- [ ] Edge case: text longer than canvas width → clip or wrap gracefully.

### Estimated time: 1 week (5 working days).

---

## Phase 5: Export (Week 8)

### Goal
Render final timeline to 1080×1920 MP4 via WebCodecs with progress feedback.

### Deliverables

#### 1. Render pipeline
- [ ] Loop through timeline, frame-by-frame (assuming 30fps).
- [ ] Composite: draw video clips, apply transforms/colors, draw text, apply transitions.
- [ ] Collect frames into a video stream.

#### 2. WebCodecs encoder
- [ ] Encode stream to H.264 MP4 via WebCodecs VideoEncoder.
- [ ] Fallback to FFmpeg.wasm if WebCodecs unavailable.
- [ ] Audio: mix audio tracks (if needed) + encode to AAC via Web Audio API.

#### 3. Progress UI
- [ ] Show progress bar: "Rendering 150 / 900 frames (17%)".
- [ ] ETA based on frame rate.
- [ ] Cancel button (stop encoding, discard).

#### 4. Download
- [ ] On completion: "Export complete! Download" button.
- [ ] Save as "project_name_YYYY-MM-DD.mp4".

### Acceptance criteria
- [ ] Export a 30-second timeline → MP4 downloads in <10 minutes.
- [ ] All clips, transforms, colors, transitions, text, audio in final video.
- [ ] Progress bar updates smoothly, ETA reasonably accurate.
- [ ] Cancel during export → stops encoding, no partial file.

### Testing
- [ ] Export test suite: various combinations of clips, effects, transitions.
- [ ] Performance test: export a 5-minute timeline, measure time + memory.
- [ ] Browser compatibility: export on Chrome, Firefox, Safari (fallback test).

### Estimated time: 1 week (5 working days).

---

## Phase 6: Polish & Templates (Week 9)

### Goal
Add template system, brand kit scaffold, and UI refinement.

### Deliverables

#### 1. Template system (v1)
- [ ] 3–5 hardcoded templates (e.g., "Hero + Hand + Closeup + Price").
- [ ] "Create from template" button on home screen.
- [ ] Template UI: shows thumbnail, description, loads pre-configured project.

#### 2. Brand kit scaffold
- [ ] Settings panel: save font, color, logo, default text position.
- [ ] "Apply brand kit" button: applies saved settings to all text boxes.
- [ ] Export brand kit as JSON; import on new project.

#### 3. UI refinement
- [ ] Keyboard shortcuts (spacebar = play/pause, Del = delete clip, etc.).
- [ ] Undo/redo (Ctrl+Z, Ctrl+Y).
- [ ] Drag-to-crop on canvas (optional, low priority).
- [ ] Tooltips + inline help.

### Acceptance criteria
- [ ] Create project from template → all clips + layout pre-arranged.
- [ ] Save brand kit with fonts + colors → apply to new project in 1 click.
- [ ] Undo/redo works for all major operations.

### Estimated time: 1 week (5 working days).

---

## Phase 7: Bug Fix & Performance (Week 10)

### Goal
Fix bugs found during internal testing, optimize performance, prepare for public launch.

### Deliverables
- [ ] Fix reported bugs from Phases 0–6.
- [ ] Performance optimization: reduce memory usage, speed up export.
- [ ] Security audit: check for XSS, file upload validation, etc.
- [ ] Accessibility: add alt text, ARIA labels, keyboard navigation.
- [ ] Mobile responsiveness (not editing, but layout should adapt).

### Acceptance criteria
- [ ] All known bugs resolved or documented as v1.1 features.
- [ ] Export <5 minutes for typical 30-second video.
- [ ] No security vulnerabilities (OWASP top 10).
- [ ] Keyboard-accessible on desktop browsers.

### Estimated time: 1 week (5 working days).

---

## Phase 8: Launch & Deploy (Week 11)

### Goal
Deploy to production, document, announce.

### Deliverables
- [ ] Deploy to Vercel / GitHub Pages (or self-host).
- [ ] User guide (docs + video tutorial).
- [ ] GitHub README with setup instructions.
- [ ] Collect feedback form / bug report link.

### Acceptance criteria
- [ ] App live and accessible via URL.
- [ ] docs/USER_GUIDE.md complete.
- [ ] Users can import, edit, export without support.

### Estimated time: 1 week (5 working days).

---

## Post-MVP (v1.1+)

### Planned features (prioritized by user feedback)
1. **Electron wrapper** — if 30%+ of users request "native app."
2. **Music library** — free royalty-free tracks for product reels.
3. **Advanced keyframing** — opacity/position animation curves.
4. **Marketplace for templates** — community-contributed templates.
5. **Cloud backup + accounts** — once market validates single-user MVP.

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| WebCodecs not supported on Safari | High | Can't export on iOS | Fallback to FFmpeg.wasm; document. |
| Timeline performance degrades >50 clips | Medium | User frustration | Virtual scrolling; optimize React renders. |
| FFmpeg.wasm 30MB load delay | Medium | Bad first import | Lazy load; show spinner + ETA. |
| Audio sync issues during export | Medium | Audio/video out of sync | Test extensively; use Web Audio API timing. |
| Users confused by template system | Low | Low adoption | Good onboarding UX; inline help. |

---

## Success Metrics (Launch)

- ✅ Import, edit, export a 30-second reel in <5 minutes.
- ✅ Exports look professional: smooth playback, readable text, correct aspect ratio (9:16).
- ✅ No crashes on 20+ clip timelines.
- ✅ First user feedback: "Faster than CapCut for product videos."

---

## Timeline Summary

| Phase | Weeks | Focus |
|-------|-------|-------|
| Validation spikes | 1–2 | De-risk tech stack. |
| Phase 0 | 2–3 | Core canvas + timeline. |
| Phase 1 | 4 | Media import + FFmpeg. |
| Phase 2 | 5 | Transform + color + audio. |
| Phase 3 | 6 | Transitions. |
| Phase 4 | 7 | Text overlays. |
| Phase 5 | 8 | Export. |
| Phase 6 | 9 | Templates + brand kits. |
| Phase 7 | 10 | Polish + performance. |
| Phase 8 | 11 | Launch + deploy. |
| **Total** | **~11 weeks** | **MVP ready.** |

---

## Notes

- **Parallel work:** Some phases can overlap (e.g., Phase 2 + 3 once Phase 1 is stable).
- **Solo feedback loop:** Build → test → iterate quickly. Ship Phase 0 + 1 as a "friends & family" beta after Week 4.
- **Tech debt:** Track TODOs during implementation; schedule debt paydown before Phase 6.

---

**Next step:** Kick off Validation Spikes (Week 1).

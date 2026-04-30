# QA Agent — Design Spec
**Date:** 2026-04-30  
**Project:** P1 Video Editor  
**Status:** Approved

---

## Goal

Eliminate manual click-through testing. A Playwright suite covers regressions automatically. A Claude `/qtest` agent orchestrates the suite, auto-fixes failures, and commits the fix — Nick triggers it on demand.

---

## Architecture

```
npm run test:e2e  ──►  Playwright (headless, localhost:3000)
                            │
                    page.evaluate() for canvas/video checks
                            │
                       JSON results
                            │
                    /qtest Claude agent
                            │
               ┌────────────┴────────────┐
           pass: commit             fail: read source
                                     → patch code
                                     → rerun spec
                                     → rerun suite
                                     → commit fix
                                     OR report to Nick
```

---

## Test Suite (`tests/e2e/`)

### Priority 1 — Timeline & UI (`01-timeline.spec.ts`)
- Import `tests/fixtures/test-clip.mp4` via file input
- Clip appears on Video track with duration within ±0.5s of expected
- Clip can be dragged to a new position (pointer down/move/up)
- Left trim handle changes clip start point
- Right trim handle changes clip end point
- Clicking empty track area moves playhead

### Priority 2 — Playback (`02-playback.spec.ts`)
- Press play → `.stage-video` has `videoWidth > 0`
- After 1s of play, canvas center pixel is non-black (frame rendered)
- Press pause → `video.paused === true`
- Scrub to 50% → video `currentTime` within 1s of expected position

### Priority 3 — Export/FFmpeg (`03-export.spec.ts`)
- Open SPIKE 2 panel → click Load FFmpeg → status shows "ready"
- Pick test fixture → click Convert → download link appears within 60s
- Output blob size > 1000 bytes

---

## Canvas Verification

Uses `page.evaluate()` — no screenshot diffing, no pixel-perfect comparisons:

```typescript
const hasFrame = await page.evaluate(() => {
  const video = document.querySelector('.stage-video') as HTMLVideoElement
  if (!video || video.videoWidth === 0) return false
  const canvas = document.createElement('canvas')
  canvas.width = 10; canvas.height = 10
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0, 10, 10)
  const px = ctx.getImageData(0, 0, 10, 10).data
  return Array.from(px).some((v, i) => i % 4 !== 3 && v > 10)
})
```

---

## Test Fixtures

- `tests/fixtures/test-clip.mp4` — H.264, 1920×1080, ~5s, < 5MB, committed to repo
- Used by all specs — no dependency on Nick's local files
- If fixture missing, tests skip with a clear message

---

## Auto-Fix Loop (`/qtest` skill)

```
1. Run: npx playwright test --reporter=json
2. Parse: extract failing spec file + test name + error message
3. Identify: map error to source file (Timeline.tsx, Canvas.tsx, etc.)
4. Patch: targeted code fix
5. Rerun: npx playwright test <failing-spec> only
6. If green: run full suite
7. If full suite green: git commit "fix(tests): <what broke>"
8. If still red after 2 attempts: report diagnosis to Nick, stop
```

Max 2 auto-fix attempts per failure. Never modifies test files — only source code.

---

## Trigger

```bash
npm run test:e2e          # full Playwright suite, headless, JSON output
npm run test:e2e -- --ui  # Playwright UI mode for debugging
/qtest                    # Claude agent: run → auto-fix → commit
```

---

## Out of Scope

- Watch mode / auto-run on file change (on demand only)
- Visual regression screenshots (pixel diffing)  
- Unit tests for individual functions
- CI/CD integration (future)

---

## Success Criteria

- `npm run test:e2e` runs in < 60s
- All 3 spec files pass on a working build
- `/qtest` can fix a broken Timeline drag interaction without Nick touching a keyboard
- Test fixture is < 5MB and committed so any machine can run tests

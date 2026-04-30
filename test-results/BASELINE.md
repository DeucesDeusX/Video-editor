# E2E Baseline — 2026-04-29

## Summary
1 passed / 9 failed — 10 total tests across 3 spec files.

## Passing
- `01-timeline.spec.ts` — **fixture file exists** (pure Node.js assertion, no browser needed — passes reliably)

## Failing

### Timeline & UI (`01-timeline.spec.ts`)
- **import video — clip appears on main lane** — `TimeoutError`: `.lane-clips .clip-block` never appears after file import. Selector mismatch or import handler not wiring the clip to the timeline DOM.
- **imported clip has non-zero duration label** — same root cause as above (`waitForClip` timeout).
- **drag clip to new position** — same root cause as above (`waitForClip` timeout).

### Playback (`02-playback.spec.ts`)
- **stage-video has decoded dimensions after import** — `beforeEach` fails because `waitForClip` times out (clip never appears), so `.stage-video` has no loaded source.
- **video currentTime advances during play** — same root cause (beforeEach failure).
- **pause stops playback** — same root cause (beforeEach failure).

### FFmpeg Export (`03-export.spec.ts`)
- **FFmpeg panel exists and can be expanded** — `toBeVisible` fails; neither `.spike-toggle` nor `button:has-text("FFmpeg")` is present in the DOM. Selector needs updating to match actual rendered element.
- **Load FFmpeg succeeds within 30s** — timed out at 90 s waiting for the FFmpeg button click (same selector miss as above).
- **Convert test fixture to H.264 within 60s** — timed out at 90 s for the same reason.

## Root Causes (Work Queue)

| # | Root cause | Affected tests |
|---|-----------|----------------|
| 1 | `.lane-clips .clip-block` selector does not match rendered DOM after file import | 3 Timeline + 3 Playback |
| 2 | `label:has-text("+ Add")` may not match the actual import trigger button | 3 Timeline + 3 Playback (import step) |
| 3 | `.spike-toggle` / `button:has-text("FFmpeg")` selector does not match rendered FFmpeg panel | 3 Export |

## Notes
- The fixture file `tests/fixtures/test-clip.mp4` exists and is readable — the fixture-exists test confirms this.
- All timeline/playback failures cascade from a single broken selector pair: the import trigger and the clip-block locator. Fixing those two selectors should unlock 6 tests at once.
- FFmpeg panel selector needs inspection against the live DOM (likely a different class name or button text in the current implementation).
- Dev server starts automatically via `webServer` config (`reuseExistingServer: true`).
- Run time: ~3.4 minutes total (FFmpeg timeout tests dominate at 90 s each).

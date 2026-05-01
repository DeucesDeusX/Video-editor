# Phase 1: Auto-Convert HEVC/Unsupported Video on Import

**Date:** 2026-04-30  
**Status:** Approved (autonomous execution)

---

## Problem

Nick's phone records in HEVC/H.265. Chrome cannot decode HEVC natively on Windows without a hardware codec extension, so `videoWidth === 0` after load. The canvas stays black and clips are unusable.

## Solution

After a video asset is imported, probe its codec. If `videoWidth === 0` after `loadedmetadata`, the codec is unsupported — run FFmpeg.wasm in the background to convert to H.264. Swap in the converted URL when done. The user sees a "Converting…" badge on the asset and a toast on completion.

---

## Architecture

```
addFiles() — existing hook point (index.html line 1876)
    │
    ▼
probe codec: create <video>, wait for loadedmetadata
    │
    ├── videoWidth > 0 → supported, done (existing flow)
    │
    └── videoWidth === 0 → unsupported
            │
            ▼
        dispatch UPDATE_ASSET { converting: true }
            │
            ▼
        convertToH264(asset) — async, non-blocking
            │
            ├── load ffmpeg (shared instance, lazy)
            ├── ffmpeg.writeFile(input)
            ├── ffmpeg.exec(['-i', 'input.mp4', '-c:v', 'libx264', ...])
            ├── ffmpeg.readFile('output.mp4')
            └── create blob URL
                    │
                    ▼
            dispatch UPDATE_ASSET { url: newUrl, converting: false, duration: real }
            pushToast('Converted to H.264 ✓', 'good')
```

---

## Changes to `index.html`

### 1. Shared FFmpeg instance (lazy-loaded once)

Add near the top of the main script (after imports):

```javascript
let _ffmpegInstance = null;
let _ffmpegLoading = null;

async function getFFmpeg() {
  if (_ffmpegInstance) return _ffmpegInstance;
  if (_ffmpegLoading) return _ffmpegLoading;
  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { toBlobURL } = await import('@ffmpeg/util');
  const ff = new FFmpeg();
  const base = 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/umd';
  _ffmpegLoading = ff.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
  }).then(() => { _ffmpegInstance = ff; _ffmpegLoading = null; return ff; });
  return _ffmpegLoading;
}
```

### 2. `convertToH264(asset, dispatch, pushToast)` function

```javascript
async function convertToH264(asset, dispatch, pushToast) {
  try {
    const ff = await getFFmpeg();
    const resp = await fetch(asset.url);
    const buf = new Uint8Array(await resp.arrayBuffer());
    await ff.writeFile('input_conv.mp4', buf);
    await ff.exec([
      '-i', 'input_conv.mp4',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '23',
      '-c:a', 'aac', '-movflags', 'faststart',
      'output_conv.mp4'
    ]);
    const out = await ff.readFile('output_conv.mp4');
    const blob = new Blob([out.buffer.slice(0)], { type: 'video/mp4' });
    const newUrl = URL.createObjectURL(blob);
    // Get real duration from converted file
    const dur = await new Promise(res => {
      const v = document.createElement('video');
      v.src = newUrl;
      v.onloadedmetadata = () => { res(v.duration); v.src = ''; };
      v.onerror = () => res(null);
    });
    dispatch({ type: 'UPDATE_ASSET', id: asset.id, patch: {
      url: newUrl,
      converting: false,
      duration: dur ? round2(dur) : asset.duration,
    }});
    pushToast(`${asset.name} → H.264 ready`, 'good');
    // Clean up FFmpeg virtual FS
    try { await ff.deleteFile('input_conv.mp4'); } catch {}
    try { await ff.deleteFile('output_conv.mp4'); } catch {}
  } catch (err) {
    dispatch({ type: 'UPDATE_ASSET', id: asset.id, patch: { converting: false } });
    pushToast(`Convert failed: ${err.message}`, 'warn');
  }
}
```

### 3. Patch `addFiles` — add codec detection after metadata probe

In the `assets.forEach` loop (after the existing `onloadedmetadata`):

```javascript
el.onloadedmetadata = () => {
  done(el.duration);
  // Codec check — if videoWidth is 0, browser can't decode (HEVC etc.)
  if (asset.kind === 'video' && el.videoWidth === 0) {
    el.src = '';
    dispatch({ type: 'UPDATE_ASSET', id: asset.id, patch: { converting: true } });
    convertToH264(asset, dispatch, pushToast);
  } else {
    el.src = '';
  }
};
```

### 4. Add `converting` badge to asset grid in `LeftRail`

In the `.asset` JSX, add a converting overlay:

```jsx
{asset.converting && (
  <div className="asset-converting-badge" title="Converting to H.264…">⟳</div>
)}
```

### 5. CSS for converting badge

```css
.asset-converting-badge {
  position: absolute; top: 3px; left: 3px;
  background: rgba(126,163,255,.85);
  color: #fff; font-size: 11px; font-weight: 600;
  padding: 1px 5px; border-radius: 3px;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

---

## State

`UPDATE_ASSET` already exists in the reducer. The `converting` field is a new optional boolean on the asset record — no reducer changes needed (the patch spread handles it).

---

## Edge Cases

- **Large files (> 500MB):** `fetch(asset.url).arrayBuffer()` will OOM. Add a size check — skip auto-convert if file > 200MB, show toast: "File too large to auto-convert — use a shorter clip or pre-convert on your phone."
- **Multiple unsupported files imported at once:** Conversions are queued via the shared FFmpeg instance (single-thread, sequential)
- **FFmpeg already loaded from export:** The shared instance is reused

---

## Success Criteria

- Import an HEVC `.mp4` from Nick's phone → shows "Converting…" badge → converts → plays on canvas
- H.264 files import instantly with no conversion
- File > 200MB shows a clear "too large" message instead of hanging
- Existing export flow still works (shared FFmpeg instance)

---

## Out of Scope

- Progress percentage on the asset badge (just a spinner)
- Cancel conversion
- Offline support (FFmpeg core loads from CDN)

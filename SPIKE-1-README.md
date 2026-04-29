# Spike 1: Canvas + Timeline UI Prototype

**Goal:** Prove React canvas + timeline UI are smooth and performant (60fps with 20+ clips).

**Duration:** 1–2 days

**Deliverable:** Working prototype with canvas preview + draggable timeline.

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start dev server
```bash
npm run dev
```

Opens http://localhost:3000 automatically.

### 3. Build for production
```bash
npm run build
```

Output: `dist/` folder (ready to deploy).

---

## What's Included

### Project Structure
```
src/
├── App.tsx                    # Main app component
├── App.css                    # App styling
├── index.css                  # Global styles + design system
├── main.tsx                   # Entry point
└── components/
    ├── Canvas.tsx             # Canvas preview (1080×1920)
    ├── Canvas.css
    ├── Timeline.tsx           # Timeline with 20 mock clips
    └── Timeline.css
```

### Components

#### **Canvas.tsx**
- 1080×1920 canvas preview (scales to fit window)
- Pan/zoom with grab cursor (drag to move)
- Rule-of-thirds grid overlay (toggle with button)
- Black background (video frame)
- Shadow + border styling

**Features to test:**
- [ ] Canvas scales smoothly to fit viewport
- [ ] Drag to pan (no jank)
- [ ] Grid toggle works
- [ ] FPS counter shows 60fps

#### **Timeline.tsx**
- 3 tracks: Video, Overlay, Audio (color-coded)
- 20 mock clips with realistic durations
- Drag clips to reorder/move tracks
- Playhead (click timeline to move)
- Ruler with time markers
- Clip names + duration labels

**Features to test:**
- [ ] 20 clips render without lag
- [ ] Dragging clips is smooth (60fps)
- [ ] Timeline scrolls smoothly
- [ ] Playhead updates on click
- [ ] Clips stay in view while dragging

---

## FPS Counter

Bottom-right corner shows **FPS: XX**. Goal: stay at 60.

If FPS drops below 50:
1. Check React DevTools Profiler (chrome://react/devtools)
2. Look for excessive re-renders
3. Use `React.memo()` on heavy components
4. Check CSS performance (animations, shadows)

---

## Testing Checklist

### Performance
- [ ] Canvas renders at 60fps (measured by FPS counter)
- [ ] Timeline with 20 clips doesn't stutter
- [ ] Dragging clips is buttery smooth
- [ ] Panning canvas (drag) has no lag
- [ ] Timeline scrolling is smooth
- [ ] CPU usage stays <30% during idle
- [ ] Memory usage stable (no creeping growth)

### Functionality
- [ ] Canvas displays centered in viewport
- [ ] Canvas scales to fit available space
- [ ] Grid overlay shows rule-of-thirds
- [ ] Grid toggle works (button at bottom-right)
- [ ] Pan canvas (grab cursor, drag)
- [ ] Timeline ruler shows time markers (0s, 5s, 10s, etc.)
- [ ] 20 clips visible on timeline
- [ ] Each clip shows name + duration
- [ ] Clips are color-coded by track
- [ ] Drag clip to reorder (works across tracks)
- [ ] Click timeline to move playhead (blue line)
- [ ] Playhead time shows at bottom

### Browser Compatibility
- [ ] Chrome/Edge: 60fps ✓
- [ ] Firefox: 60fps ✓
- [ ] Safari: 60fps ✓
- [ ] Canvas scales correctly on all browsers
- [ ] Drag-and-drop works on all browsers

---

## Known Limitations (Spike 1)

- [ ] No real video playback (canvas is static)
- [ ] Clips can't be resized (trim/split)
- [ ] No undo/redo
- [ ] No snap-to-grid
- [ ] No keyboard shortcuts
- [ ] Timeline duration is fixed at 30 seconds
- [ ] No audio waveform display
- [ ] No transitions
- [ ] No effects

These are deferred to Phase 0–5.

---

## Performance Optimization Tips

If you see frame drops:

### 1. React re-renders
```tsx
// Use React.memo for heavy components
const Timeline = React.memo(() => { ... })

// Use useCallback for event handlers
const handleDragStart = useCallback((id) => { ... }, [])
```

### 2. CSS performance
```css
/* Good: use transform (GPU-accelerated) */
.clip {
  transform: translateX(0);
  will-change: transform;
}

/* Bad: use left (triggers layout) */
.clip {
  left: 100px; /* causes reflow */
}
```

### 3. Canvas rendering
```tsx
// Cache frequently-used values
const scaledWidth = size.width * size.scale

// Avoid redrawing if nothing changed
useEffect(() => {
  // only draw if size or showGrid changed
}, [size, showGrid])
```

---

## Next Steps After Spike 1

### If all tests pass ✅
1. **Spike 2:** FFmpeg.wasm preprocessing (codec normalization)
2. **Spike 3:** WebCodecs export (render to MP4)
3. **Phase 0:** Build core timeline + clip operations

### If tests fail ❌
1. Debug performance issue (use Chrome DevTools)
2. Profile with React DevTools Profiler
3. Check for unnecessary re-renders
4. Consider virtual scrolling for timeline if clip count is the bottleneck
5. Simplify clip rendering (use div instead of canvas if needed)

---

## Debugging

### Check console for errors
```bash
# In browser DevTools Console tab
# Should see no errors, warnings should be minimal
```

### Chrome DevTools: Performance tab
1. Open DevTools → Performance
2. Click record
3. Drag clips for 5 seconds
4. Stop recording
5. Look for:
   - Green = good (60fps)
   - Yellow = ok (30–60fps)
   - Red = bad (<30fps)

### React DevTools Profiler
1. Open React DevTools Extension
2. Switch to "Profiler" tab
3. Record interaction (drag clips)
4. Look for components taking >16ms to render
5. Use `React.memo()` or `useMemo()` to optimize

---

## Useful Commands

```bash
# Development
npm run dev                  # Start dev server on port 3000

# Production
npm run build               # Build optimized bundle (dist/)
npm run preview             # Preview production build locally

# Debugging
npm run build -- --debug    # Build with debug info
```

---

## File Structure Reference

| File | Purpose |
|------|---------|
| `index.html` | HTML entry point |
| `src/main.tsx` | React app entry |
| `src/index.css` | Global styles + design system |
| `src/App.tsx` | Main app component (Canvas + Timeline) |
| `src/App.css` | App layout |
| `src/components/Canvas.tsx` | Canvas preview component |
| `src/components/Canvas.css` | Canvas styling |
| `src/components/Timeline.tsx` | Timeline component |
| `src/components/Timeline.css` | Timeline styling |
| `vite.config.ts` | Vite configuration |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies + scripts |

---

## Design System

The app uses a dark-mode color palette (from Reel Lab):

```css
--bg: #0a0d13              /* main background */
--panel: #10141d           /* panels */
--accent: #7ea3ff          /* blue accent */
--good: #6ce0b6            /* green (success) */
--warn: #f4c166            /* amber (warning) */
--text: #e8ecf5            /* primary text */
--muted: #8d99b0           /* secondary text */
```

Colors are defined in `src/index.css` as CSS custom properties.

---

## Next: Spike 2 & 3

Once Spike 1 is solid, move on to:

### **Spike 2: FFmpeg.wasm**
- Load FFmpeg.wasm in a Web Worker
- Test codec normalization (convert videos to H.264 MP4)
- Measure load time + preprocessing speed

### **Spike 3: WebCodecs**
- Render timeline to WebCodecs VideoEncoder
- Export a simple 5-clip timeline to 1080×1920 MP4
- Measure encode time

Both are critical for validating the full tech stack. Run them in order (Spike 1 → 2 → 3).

---

**Ready to start? Run `npm install` and `npm run dev`!** 🚀

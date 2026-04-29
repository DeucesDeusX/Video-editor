# Reel Lab Code Analysis & Reusable Components

#status/active #reference

**Date:** 2026-04-29  
**Files analyzed:** reel-lab-v4 through reel-lab-v7_12 (12 versions in Downloads)  
**Architecture:** Single-file React app (~60KB minified HTML)  
**Status:** Production-ready, feature-rich, can be stripped and adapted for Video Editor

---

## Overview

The Reel Lab codebase is a **fully-functional video editor prototype** built as a single React + Canvas app. Unlike the new timeline-based approach, Reel Lab uses a **rules-based + planning-first workflow**, but many UI components, canvas utilities, and design patterns are directly reusable.

### Key Assets Found

1. **UI Framework** — comprehensive dark-mode design system
2. **Canvas Preview** — pan, zoom, rotate, resize clip on stage with transform handles
3. **Asset Grid** — 2-column media library with drag-and-drop support
4. **Timeline-like UI** — transition markers, clip lanes, sequencing
5. **Color Grading UI** — color reference strips, grading controls
6. **Overlay System** — clips layered on main stage with selection/resize
7. **Audio Visualization** — audio clip preview system
8. **Form Controls** — extensive input components, range sliders, buttons
9. **Keyboard & Drag Interactions** — grabbing canvas, dragging clips, resizing
10. **Project Persistence** — JSON export/import scaffolding

---

## Component Inventory

### 1. **Design System (CSS)**

**Color Variables:**
```css
--bg: #0a0d13             /* main background */
--panel: #10141d          /* primary panel */
--panel-2: #161b27        /* secondary panel */
--panel-3: #1c2333        /* tertiary panel */
--text: #e8ecf5           /* primary text */
--muted: #8d99b0          /* secondary text */
--accent: #7ea3ff         /* primary accent (blue) */
--good: #6ce0b6           /* success green */
--warn: #f4c166           /* warning amber */
--bad: #ff7a85            /* error red */
--line: #242c3f           /* borders */
```

**UI Patterns:**
- `.btn` — button base (hover/active states, disabled state)
- `.btn.primary` — accent blue buttons
- `.btn.good` / `.btn.warn` — semantic buttons
- `.btn.icon`, `.btn.tiny` — size variants
- Input fields with focus states
- Range sliders (styled across browsers)

**→ Reusable for Video Editor:** Yes, port entire design system to Phase 0 (React + Tailwind or CSS Modules).

---

### 2. **Canvas Preview Stage**

**Elements:**
- `.stage` — main preview container (radial gradient background)
- `.stage-canvas` — the actual canvas frame (1080×1920, black background, shadow)
- `.stage-shot` — transformed layer inside canvas (scale, offset, rotation)
- `.stage-video` / `.stage-img` — media elements (contain, background-color)
- `.stage-gl-canvas` — GL overlay for color grading (sits on top)
- `.resize-corner` — 4 corner resize handles with hover glow
- `.stage-grid` — rule-of-thirds grid overlay (CSS grid-image)
- `.grid-toggle` — toggle button for grid visibility

**Features:**
- Pan/zoom canvas (grab cursor, dragging state)
- Clip resize via corner handles (NW, NE, SW, SE)
- Rule-of-thirds grid overlay
- GL canvas for real-time color grading preview
- Dual-layer system: source video + GL output

**→ Reusable for Video Editor:** Heavily! This is Phase 0-5 canvas preview. Copy:
- Canvas styling + layout
- Resize handle logic
- Grid overlay
- Pan/zoom behavior
- GL setup (if doing real-time color)

---

### 3. **Asset Grid & Media Library**

**Elements:**
- `.asset-grid` — 2-column CSS grid
- `.asset` — individual clip/image box (aspect-ratio: 1, thumbnail + kind label)
- `.asset.selected` / `.asset.dragging` — interaction states
- `.asset .kind` — small label (VIDEO, IMG, AUDIO)
- `.asset-placeholder` — drop zone for new media
- `.ref-chip` — small color reference swatch (for color matching)
- `.ref-strip` — flex row of reference colors

**Drag Support:**
- Draggable assets (drag state opacity: 0.4)
- Drag-to-timeline integration
- Right-click menu (implied, not shown in CSS)

**→ Reusable for Video Editor:** Yes, but simplified. Phase 1 media import can borrow:
- Asset grid layout
- Thumbnail display with type label
- Drop zone UX
- Drag state feedback

---

### 4. **Clip Lanes & Timeline**

**Elements:**
- `.stage-overlay-wrap` — positioned overlay clip on stage
- `.stage-overlay-wrap.selected` — dashed outline + resize handles visible
- `.clip-queued-dot` — small warning dot on clips (yellow, glowing)
- `.transition-marker` — diamond shape between clips
- `.transition-popover` — dropdown menu for transition type selection

**Features:**
- Overlay clips on main stage (position absolute)
- Selection state with outline
- Transition UI (diamond markers, popovers)
- Queued clip indicator (warning dot for color-match queue)

**→ Reusable for Video Editor:** Partially. The transition marker + popover is directly usable (Phase 3). The overlay clip logic is useful for text overlays (Phase 4).

---

### 5. **Topbar & Navigation**

**Elements:**
- `.topbar` — 44px header with brand, project name, status chips
- `.brand` — "Reel Lab" branding with live status dot
- `.project-name` — editable project title
- `.chip.live` — status indicator (saved, live, etc.)

**→ Reusable for Video Editor:** Yes. Adapt topbar for "Reel Editor" + project name + save status.

---

### 6. **Left Rail (Sidebar)**

**Elements:**
- `.rail` — 200px left panel (collapsible to 44px)
- `.rail-body` — scrollable content area
- `.shelf` — grouped section (e.g., "Media", "Branding", "Rules")
- `.shelf-head` — section header with action button

**Contains:**
- Asset grid (media library)
- Color reference strips
- Brand shelf (logo + brand assets)
- Rules editor (implied, not shown in CSS snippet)

**→ Reusable for Video Editor:** Yes. Phase 0 can use rail structure for clip/track management, Phase 6 for brand kits.

---

## Interaction Patterns

### Drag & Drop
- Assets draggable to stage
- Clips resizable via corner handles
- Canvas pan (grab cursor)
- Transition markers clickable/hoverable

### Canvas Manipulation
- Clip resize (corner handles, 4-directional)
- Clip reposition (via overlay-wrap absolute positioning)
- Canvas zoom/pan (grab state)
- Grid overlay toggle

### Color Grading
- GL canvas overlay for real-time preview
- Color reference strips for matching
- (Likely) Color controls form (not visible in CSS excerpt)

### Transitions
- Diamond markers between clips
- Hover to expand, click to open transition menu
- Popover menu to select transition type
- Active state highlight

---

## Code Quality Observations

### Strengths
- **Single-file architecture:** Entire app in one HTML file (easy to test, deploy, evolve)
- **CSS-in-HTML:** No separate stylesheets; self-contained
- **Component-driven CSS:** Clear naming (`.stage-*`, `.asset-*`, `.transition-*`)
- **Accessibility hints:** Form labels, button states, focus management
- **Dark-mode optimized:** Carefully chosen color palette
- **Performance-aware:** CSS Grid for asset layout, contain sizing, pointer-events control

### Weaknesses (for timeline-based approach)
- Rules-based workflow (not timeline-based)
- Limited to single-sequence editing (no multi-track timeline view like we need)
- No audio-level mixing or keyframing
- Focused on planning + light editing (not full production)

---

## What to Extract for Video Editor

### 1. **Directly Copy**
- [ ] CSS design system (colors, buttons, form elements)
- [ ] Canvas stage layout and styling
- [ ] Asset grid component
- [ ] Resize handle logic and corner indicators
- [ ] Rule-of-thirds grid overlay
- [ ] Transition marker + popover UI
- [ ] Color reference strip (for Phase 6 brand kits)

### 2. **Adapt & Port**
- [ ] Topbar with project name + status
- [ ] Left rail structure (convert to tracks panel)
- [ ] Overlay clip logic → text overlay system
- [ ] Drag-and-drop interactions (clips to timeline)
- [ ] GL canvas setup (if real-time color grading later)

### 3. **Skip (Already Better in Video Editor)**
- [ ] Rules editor (we use templates + brand kits instead)
- [ ] Planning-first workflow (we use timeline-first)
- [ ] Single-lane paradigm (we have multi-track)

---

## Files in Downloads (Summary)

| Version | Status | Notes |
|---------|--------|-------|
| v4 | Early | Basic structure |
| v6 | Evolving | Added more features |
| v6_1 | Refinement | UI tweaks |
| v7–v7_3 | Development | Active iteration |
| v7_4–v7_9 | Polishing | Performance + stability |
| v7_10–v7_12 | Production | Latest + most stable |

**→ Use v7_12 as reference; earlier versions show iteration history.**

---

## Integration Strategy

### Phase 0 Canvas & Timeline
- [ ] Port design system (CSS variables + button styles)
- [ ] Adapt stage layout (make responsive for timeline below)
- [ ] Add resize handles (corner handles work; may need edge handles for trim)
- [ ] Port grid overlay (rule-of-thirds toggle)

### Phase 1 Media Import
- [ ] Adapt asset grid (keep 2-column layout, add drag-to-timeline)
- [ ] Port drag-and-drop logic
- [ ] Update asset `.kind` labels for video/audio/image

### Phase 3 Transitions
- [ ] Port transition marker + popover verbatim
- [ ] Adapt to work on timeline (between clips, not on stage)

### Phase 4 Text Overlays
- [ ] Port overlay-wrap logic (position absolute on stage)
- [ ] Adapt resize handle system for text boxes
- [ ] Extend with text styling form

### Phase 6 Brand Kits
- [ ] Port color reference strip (for color palette in brand kit)
- [ ] Adapt brand shelf UI for logo + defaults

---

## Next Steps

1. **Extract Reel Lab v7_12** into project as `/reference/reel-lab-v7_12.html`
2. **During Phase 0:** Copy CSS design system (convert to Tailwind or CSS Modules)
3. **During Phase 1:** Study drag-drop logic in v7_12 for media import
4. **During Phase 3:** Port transition marker + popover code
5. **During Phase 4:** Study overlay-wrap + resize handle code for text overlays
6. **Post-MVP:** Consider extracting color grading GL code for v1.1+ enhancement features

---

## Recommendation

**Do not port Reel Lab wholesale.** Instead:
- Use it as a **UI/UX reference** (design system, interaction patterns)
- Extract **reusable code snippets** (resize handles, grid overlay, transition UI)
- Build **timeline-based core** fresh in React + Vite (cleaner architecture, better performance)
- Leverage Reel Lab learnings in **templates + brand kits** (Phase 6)

This approach:
- Avoids legacy architectural debt (single-file → modular)
- Improves performance (proper React component tree, code splitting)
- Scales better (easier to add audio mixing, keyframing, plugins)
- Keeps development velocity high (fresh start, proven patterns)

---

# Reel Lab Legacy → Video Editor Integration

#status/active #reference

**Date:** 2026-04-29  
**Purpose:** Map learnings from the previous Reel Lab project (rules-based editor) to the new Video Editor (timeline-based editor).

---

## Context

You previously built **Reel Lab v0.1**, a rules-based video reel editor with a focus on encoding your editing taste into structured rules and checklists. It was hosted as a web app and designed to eventually replace CapCut for product video editing.

The new **Video Editor** project takes a different architectural approach (timeline-based instead of rules-based), but many lessons and features from Reel Lab remain valuable.

---

## Reel Lab v0.1 Feature Set

### What was built
- ✅ Local clip and image loading in-browser
- ✅ Preview pane for loaded media
- ✅ Editable reel rules: opening hook, closing rule, motion rule, color rule, logo rule, avoid list
- ✅ Pass checklist: rough sequence, timing, framing, color/enhancement, branding, export check
- ✅ Shot plan cards (planning layer)
- ✅ Voice notes via browser speech recognition
- ✅ Generated assistant brief (AI-assisted planning)
- ✅ JSON export (projects exportable/importable)

### Strategic insight from Reel Lab
- **Rules-driven approach:** Encode your taste (opening hook, closing rule, motion rule, etc.) into repeatable frameworks.
- **Checklist-driven workflow:** Quality gate checklist (rough sequence → timing → framing → color → branding → export).
- **Planning layer first:** Shot planning came before editing operations.
- **Voice notes + AI brief:** Lightweight use of speech recognition and AI for guidance.

---

## Reel Lab v0.2–v0.4 Planned Features (Deferred)

### v0.2 (Sequence builder + timeline thinking)
- Obvious sequence builder (drag clips into order)
- Play bar concept for timeline thinking
- Multiple editing lanes: overlay, main media, music
- Branding shelf for persistent overlay assets
- Better shot ordering UX
- Current reel length vs. target length tracking

**→ Mapping to new Video Editor:**
- ✅ Multi-track timeline (Phase 0)
- ✅ Drag-reorder clips (Phase 0)
- ✅ Branding shelf → templates + brand kits (Phase 6)
- ✅ Reel length tracking (Phase 0: duration display on timeline)

### v0.3 (Editing operations + AI enhancement)
- Split, trim, reorder clips
- Per-clip effects: opacity, scale, position, rotation
- AI enhancement toggles: color match, denoise, stabilize, upscale
- Mute or strip audio
- Color match videos toward still-image look
- Repeatable product-reel templates
- Logo placement presets
- Batch prep hooks for local media tools

**→ Mapping to new Video Editor:**
- ✅ Clip operations (split, trim, reorder) → Phase 0
- ✅ Transform effects (opacity, scale, position, rotation) → Phase 2
- ✅ Audio mute/strip → Phase 2
- ✅ Templates → Phase 6
- 🔄 AI enhancement (color match, denoise) → Post-MVP (v1.1+)
- 🔄 Logo placement presets → Part of brand kits (Phase 6)

### v0.4 (Render pipeline)
- Real render pipeline outside CapCut
- Color normalization and enhancement scripts
- Draft output generation for review

**→ Mapping to new Video Editor:**
- ✅ Export pipeline (FFmpeg.wasm + WebCodecs) → Phase 5
- 🔄 Color normalization scripts → Post-MVP (v1.1+)

---

## Strategic Direction (From Reel Lab)

### Original Reel Lab strategy
1. **Encode Nick's taste into rules and templates** (v0.1)
2. **Automate prep and rough assembly** (v0.2–v0.3)
3. **Automate color matching and consistency** (v0.3–v0.4)
4. **Only then replace final CapCut polish entirely** (v0.4+)

### How this guides the new Video Editor
- **Encode taste:** Template system (Phase 6) + brand kits (Phase 6) directly serve this.
- **Automate prep:** Product-reel-specific workflow (guided "Import → Pick template → Customize → Export").
- **Color consistency:** Brand kits automate color/font/logo consistency across reels (Phase 6).
- **Replace CapCut gradually:** Start with timeline-based MVP, then add automation in v1.1+.

---

## Reusable Concepts from Reel Lab

### 1. **Reel Rules Framework**
Reel Lab encoded 5 key rules for product reels:
- **Opening hook:** First 0.5s must grab attention (hero shot, hand, closeup).
- **Closing rule:** End with price/CTA text or brand logo.
- **Motion rule:** Avoid static shots; use cuts, zooms, transitions.
- **Color rule:** Match color grading across clips (avoid jarring shifts).
- **Logo rule:** Persistent logo in fixed corner, readable at all times.

**→ For new Video Editor:**
- These become **brand kit defaults** + **template presets** (Phase 6).
- Example template: "Hero + Hand + Closeup + Price" encodes opening hook + closing rule + motion rule.
- Brand kit stores color grading presets + logo position defaults.

### 2. **Pass Checklist**
Reel Lab's quality gate:
1. Rough sequence (shots in logical order)
2. Timing (pacing feels right, no dead air)
3. Framing (shots composed well, text readable)
4. Color/enhancement (consistent color grading)
5. Branding (logo visible, on-brand fonts/colors)
6. Export check (final file size, format, metadata)

**→ For new Video Editor:**
- Add an **optional checklist sidebar** as a post-MVP feature (v1.1+).
- Help users self-check their work before export.
- Link to guidance for each step.

### 3. **Shot Plan Cards**
Reel Lab had a "planning layer" where users could document:
- Shot title ("Hero shot", "Hand demo", "Closeup")
- Duration target
- Notes (framing, motion, audio cue)
- Status (rough, refined, approved)

**→ For new Video Editor:**
- Clip metadata panel (Phase 1): add optional notes/tags per clip.
- Example: tag clips as "opener", "demo", "cta" for quick identification.
- Export includes clip notes for post-production handoff.

### 4. **Voice Notes + AI Brief**
Reel Lab supported:
- Browser speech recognition (convert voice to text)
- Auto-generated "assistant brief" (AI summarize the shooting notes)

**→ For new Video Editor:**
- Post-MVP feature (v1.1+): add voice note transcription on clips.
- Use Web Speech API (free, in-browser) or OpenAI Whisper (if backend added).
- Generate AI-assisted review brief before export.

### 5. **JSON Export/Import**
Reel Lab projects exported as JSON for portability and version control.

**→ For new Video Editor:**
- Phase 0 already includes project JSON schema (Zustand store exportable).
- Extend with: clip metadata, brand kit, notes, voice transcripts.
- Enable project sharing + version history (GitHub Gist, local file backups).

---

## Feature Mapping: Reel Lab → Video Editor Timeline

| Reel Lab Feature | Status | Video Editor Phase | Notes |
|------------------|--------|---------------------|----|
| Rules system (opening hook, color rule, etc.) | 🔄 Defer | Phase 6 (Templates) | Encoded as template presets + brand kits. |
| Pass checklist | 🔄 Defer | v1.1+ | Post-MVP quality gate feature. |
| Shot plan cards | ✅ Partial | Phase 1 | Clip metadata + tags (optional). |
| Voice notes | 🔄 Defer | v1.1+ | Clip-level voice transcription. |
| AI brief | 🔄 Defer | v1.1+ | Auto-generated review summary. |
| JSON export | ✅ Full | Phase 0 | Project persistence + export. |
| Rules editor | ❌ Skip | — | Replaced by simpler template system. |
| Preview pane | ✅ Full | Phase 0 | Canvas preview. |
| Media loading | ✅ Full | Phase 1 | Drag-drop import + FFmpeg preprocessing. |
| Branding shelf | ✅ Full | Phase 6 | Brand kits + persistent overlay assets. |
| Multi-track timeline | ✅ Full | Phase 0 | Core new feature. |
| Clip operations (split, trim) | ✅ Full | Phase 0 | Core new feature. |
| Effects (opacity, scale, rotation) | ✅ Full | Phase 2 | Per-clip transform controls. |
| Transitions | ✅ Full | Phase 3 | Core new feature. |
| Text overlays | ✅ Full | Phase 4 | Core new feature. |
| Export pipeline | ✅ Full | Phase 5 | FFmpeg.wasm + WebCodecs. |

---

## Why the Architecture Changed

### Reel Lab: Rules-based approach
**Strengths:**
- Encodes your taste systematically
- Workflow closely matches your decision-making process
- Easy to teach rules to others
- Planning-first (good for shot planning)

**Weaknesses:**
- Hard to implement actual editing operations (clip split, trim, effects)
- Rules are hard to visualize; users need to imagine timeline
- Not a true editor; still requires CapCut for polish
- Difficult to build real-time preview

### Video Editor: Timeline-based approach
**Strengths:**
- True editing interface (clips, effects, transitions all visual)
- Real-time canvas preview of final output
- Natural mental model (everyone knows timeline editing)
- Can build complete MVP without CapCut (export works)
- Easy to add automation later (rules → templates)

**Weaknesses:**
- More complex to build initially
- Requires more UI engineering (canvas, drag-and-drop, rendering)
- Learning curve for timeline interface (though less than CapCut)

**Decision:** Timeline-based MVP unlocks full editing + export. Rules (templates, brand kits) are added in Phase 6 once core editing works.

---

## Roadmap Integration

### MVP (Video Editor v1.0) = Reel Lab v0.2–v0.3 features
- Timeline-based editing (v0.2 multi-track concept)
- Clip operations + transforms (v0.3 editing operations)
- Templates + brand kits (v0.3 repeatable templates + logo presets)
- Export (v0.4 render pipeline)

### v1.1+ (Post-MVP) = Reel Lab advanced features
- Rules system (codified into templates)
- Pass checklist + quality gates
- Voice notes + transcription
- AI enhancement toggles (color match, denoise)
- Batch prep hooks (local media tools)

---

## Action Items

1. **Preserve Reel Lab learnings:**
   - ✅ Document 5 reel rules in template system (Phase 6)
   - ✅ Use pass checklist as post-MVP feature spec
   - ✅ Design clip metadata panel to support shot plan cards

2. **Integrate Reel Lab concepts into new spec:**
   - ✅ Already done: templates are Reel Lab "rules encoded visually"
   - ✅ Already done: brand kits are Reel Lab "branding shelf"
   - ✅ Already done: JSON export in Phase 0

3. **Reference during implementation:**
   - When building templates (Phase 6): refer to Reel Lab's 5 rules framework
   - When building brand kits: reference logo placement presets from Reel Lab v0.3
   - When optimizing UX: apply learnings from Reel Lab checklist flow

4. **Post-MVP roadmap:**
   - Design pass checklist sidebar (v1.1+)
   - Plan voice note + transcription feature (v1.1+)
   - Research AI color-match automation (v1.1+)

---

## Historical Reference

**Reel Lab v0.1 hosted at:**
- `/__openclaw__/canvas/documents/reel-lab-v1/index.html`

**Features in production:** Media loading, rules editor, pass checklist, shot plan cards, voice notes, AI brief, JSON export.

**Why it didn't go further:** Timeline editing was out of scope; the tool was primarily for planning, not execution. Users still had to move to CapCut for actual editing and export.

**Lesson learned:** A planning tool + execution tool = two tools. Better to build one powerful execution tool (Video Editor) with integrated planning (templates, brand kits).

---

## Next Steps

1. ✅ Review this integration doc before starting Phase 6 (Templates).
2. ✅ When designing templates, apply Reel Lab's 5 rules framework.
3. ✅ When designing brand kits, reference Reel Lab's branding shelf + logo placement presets.
4. 📋 Post-MVP: create spec for "pass checklist" feature (v1.1+).
5. 📋 Post-MVP: create spec for "voice notes + transcription" (v1.1+).

---

# PF6 Migration Scorecard — Remotion Video Design

## Overview

A 4.5-minute Remotion video communicating how well the PF6 migration automation tool performed against the quipuchords codebase. Structured as a three-act timeline — "The Promise" (what the tool handled), "The Reality" (where it fell short), and "The Cleanup" (what developers need to fix manually).

**Audience:** The migration team — developers who will use the tool. They know PF6 migration context; no preamble needed.

**Tone:** Clean data presentation. Dark theme, crisp charts, real code snippets. Professional engineering dashboard aesthetic.

## Technical Specs

- **Resolution:** 1920x1080
- **Frame rate:** 30fps
- **Duration:** ~8100 frames (~4.5 minutes)
- **Composition:** Single Remotion composition using `<Series>` for scene sequencing

## Visual Style

### Colors

| Role | Hex | Usage |
|------|-----|-------|
| Background | `#0f1117` | Base canvas — near-black with slight blue |
| Green | `#4ade80` | Handled correctly, "before" in fix examples |
| Amber | `#f59e0b` | Incomplete / non-idiomatic |
| Red | `#ef4444` | Breakage / miss / broken code |
| Blue | `#60a5fa` | Action items, Act 3 accent |
| Text primary | `#e0e0e0` | Headings, key numbers |
| Text secondary | `#6b7280` | Labels, captions |
| Code bg | `#1a1a2e` | Code block backgrounds |
| Red code bg | `#2a1515` | Broken code highlight background |
| Green code bg | `#152a15` | Correct code highlight background |

### Typography

- **Headings:** JetBrains Mono (loaded via `@remotion/google-fonts` or local fallback to `monospace`)
- **Body:** Inter (loaded via `@remotion/google-fonts` or system sans-serif fallback)
- **Code:** JetBrains Mono, with manual syntax highlighting via color spans

### Animation Patterns

- **Enter:** Fade + slide up. Spring: stiffness ~100, damping ~15.
- **Numbers:** Count up via `interpolate()` with `Math.round()`.
- **Code blocks:** Lines appear with staggered delay (~3 frames per line).
- **Chart bars:** Grow horizontally with spring easing.
- **Scene transitions:** Fade through black, ~10 frames overlap.
- **Staggered lists:** Each item delayed ~5 frames from the previous.

## Scene Breakdown

### Act 1 — "The Promise" (frames 0–1800, ~60s)

#### Scene 1: Title Card (frames 0–150, 5s)

- Center-aligned text fades in:
  - Title: "PF6 Migration Automation"
  - Subtitle: "Effectiveness Scorecard"
  - Tertiary: "quipuchords codebase evaluation"
- Minimal — just sets the stage.

#### Scene 2: Scope Overview (frames 150–600, 15s)

- Two large numbers count up side by side:
  - Left: **14** — "migration patterns targeted"
  - Right: **32+** — "change instances across codebase"
- Below: a 2-column grid of pattern names fades in with stagger (CSS renames, prop renames, Modal restructuring, Select rewrite, EmptyState consolidation, etc.)
- Establishes the surface area the tool was evaluated against.

#### Scene 3: The Win — Mechanical Transforms (frames 600–1200, 20s)

- Header: "What the tool nailed"
- Pattern table rows animate in one by one, each with a green 100% progress bar:
  - CSS token/class renames — 6/6
  - PageSection variant removal — 3/3
  - ToolbarFilter chips→labels — 3/3
  - TextContent→Content — 1/1
  - splitButtonOptions→splitButtonItems — 1/1
  - header→masthead, theme removal — 1/1
- Running count at bottom animates: **16/16 mechanical transforms — perfect score**
- All green. Builds confidence.

#### Scene 4: Transition — "But then..." (frames 1200–1800, 20s)

- The green table dims (opacity to 30%).
- Big numbers fade in center:
  - **25** build errors remained (red, large)
  - **12** files with meaningful gaps (red, below)
- Text below: "The automation handles find-and-replace. It struggles with compositional restructuring."
- Pause 2s, then fade to black.

### Act 2 — "The Reality" (frames 1800–6300, ~150s)

#### Scene 5: Classification Breakdown (frames 1800–2700, 30s)

- Three stat cards animate in left to right:
  - BREAKAGE — 1 file (8%) — red card — "worse after automation"
  - INCOMPLETE — 5 files (42%) — amber card — "partial work, needs intervention"
  - MISS — 6 files (50%) — red card — "never touched"
- Below the cards: a horizontal stacked bar fills in showing the proportions.
  - Red (8%) | Amber (42%) | Red (50%)

#### Scene 6: BREAKAGE Deep Dive (frames 2700–3900, 40s)

- Header: "BREAKAGE" (red) + file path `viewLayoutToolbar.tsx`
- Two code blocks side by side:
  - **Left — "What the tool produced"** (red bg):
    ```
    <ToolbarGroup
      align={{ default: 'alignRight' }}
      gap={{ default: 'spacerNone', md: 'spacerMd' }}
    >
    ```
    `alignRight` and `spacerNone`/`spacerMd` highlighted red.
  - **Right — "What was needed"** (green bg):
    ```
    <ToolbarGroup
      align={{ default: 'alignEnd' }}
      gap={{ default: 'gapNone', md: 'gapMd' }}
    >
    ```
    `alignEnd` and `gapNone`/`gapMd` highlighted green.
- After a beat, three additional issues appear below as a checklist:
  - DropdownList wrapper missing (silent render failure)
  - `data-ouia-component-id` → `ouiaId` (test selectors broken)
  - Unused imports added (lint failures)
- Caption: "3 TS2322 build errors + silent rendering failure"

#### Scene 7: INCOMPLETE Deep Dive (frames 3900–5100, 40s)

Split into two sub-scenes:

**7a — Modal restructuring (frames 3900–4500, 20s):**
- Header: "INCOMPLETE — Modal restructuring"
- Code block with animated transformation:
  - Before (amber): `<Modal title={titleExpression} isOpen={isOpen}>`
  - Arrow/transition indicator
  - After (green): `<Modal isOpen={isOpen}>` + `<ModalHeader title={titleExpression} />`
- File list fades in:
  - viewCredentialsList.tsx (2 modals)
  - viewScansList.tsx (2 modals)
  - viewSourcesList.tsx (2 modals)
- Caption: "Tool removed PageSection variant but left Modal props untouched"

**7b — Deprecated Select (frames 4500–5100, 20s):**
- Header: "INCOMPLETE — Select rewrite"
- Import line highlighted red: `import { Select, SelectOption, SelectVariant } from '@patternfly/react-core/deprecated'`
- The PF6 replacement code types in line-by-line (green):
  ```
  <Select
    toggle={toggleRef => (
      <MenuToggle ref={toggleRef} ...>
    )}
  >
    <SelectList>
      <SelectOption ...>{...}</SelectOption>
    </SelectList>
  </Select>
  ```
- Caption: "Complete API rewrite — 8 build errors across 2 files"

#### Scene 8: MISS Overview (frames 5100–5700, 20s)

- Header: "MISS — 6 files never touched"
- File list animates in with red dot markers:
  - addCredentialModal.tsx
  - addSourceModal.tsx
  - addSourcesScanModal.tsx
  - showSourceConnectionsModal.tsx
  - showScansModal.tsx
  - viewLayoutToolbarInteractions.test.tsx
- Caption: "No harm done — but no help either. Primarily modal files requiring structural changes."

#### Scene 9: Full Pattern Effectiveness Table (frames 5700–6300, 20s)

- Full 14-row pattern table from the summary.
- Green rows (100%) already visible (carried from Act 1 conceptually — they appear instantly).
- Amber and red rows slide in below with color-coded progress bars:
  - alignRight→alignEnd: 50% (amber)
  - EmptyState consolidation: 50% (amber)
  - Modal title→ModalHeader: 11% (red)
  - Modal actions→ModalFooter: 17% (red)
  - Deprecated Select: 0% (red)
  - DropdownList wrapper: 0% (red)
  - ouiaId: 0% (red)
  - PF6 Popper tests: 0% (red)
- The visual contrast between the green top half and red bottom half tells the story.

### Act 3 — "The Cleanup" (frames 6300–8100, ~60s)

#### Scene 10: Punch List Overview (frames 6300–6900, 20s)

- Header: "What's left — 11 items, ~5 hours"
- Compact list with effort badges:
  - Items 1-3 (Modal + EmptyState): `trivial` badge (green)
  - Item 4 (Select rewrite): `significant` badge (red)
  - Items 5-8 (viewLayoutToolbar all-in-one): `trivial — single file` badge (green)
  - Items 9-11 (test fixes + quality): `moderate` badge (amber)
- Effort distribution: most items are trivial, one is significant.

#### Scene 11: Key Fix — Modal Pattern (frames 6900–7200, 10s)

- Before/after code, compact:
  - Before (red): `<Modal title={expr}>`
  - After (green): `<Modal>` + `<ModalHeader title={expr} />`
- Caption: "8 files, ~40 min total"

#### Scene 12: Key Fix — EmptyState Pattern (frames 7200–7500, 10s)

- Before/after code, compact:
  - Before (red): `<EmptyStateHeader ... icon={<EmptyStateIcon icon={X} />} />`
  - After (green): `<EmptyState titleText={...} icon={X}>`
- Caption: "7 files (4 broken + 3 non-idiomatic), ~35 min total"

#### Scene 13: Final Verdict (frames 7500–8100, 20s)

- Horizontal stacked bar animates from left:
  - Green section: "30-40% automated"
  - Amber section: "60-70% manual"
- Verdict text fades in below:
  - "The tool saves real time on mechanical transforms."
  - "Treat its output as a starting point, not a finished migration."
- Fade to title card (reprise of Scene 1 text, dimmer).

## Component Architecture

### Shared Components

- **`AnimatedNumber`** — counts up from 0 to target using `interpolate()` + `Math.round()`
- **`CodeBlock`** — renders syntax-highlighted code with line-by-line stagger animation. Props: `lines`, `highlights` (which segments to color red/green)
- **`PatternRow`** — single row of the pattern effectiveness table with animated progress bar. Props: `label`, `score`, `fraction`, `color`
- **`StatCard`** — large number + label + optional description. Props: `value`, `label`, `description`, `color`
- **`EffortBadge`** — small colored pill with text. Props: `level` ("trivial" | "moderate" | "significant")
- **`FadeIn`** — wrapper that handles fade + slide-up spring animation. Props: `delay`
- **`SceneContainer`** — consistent padding, background, optional header/caption

### Scene Components

One component per scene: `TitleCard`, `ScopeOverview`, `MechanicalWins`, `Transition`, `ClassificationBreakdown`, `BreakageDeepDive`, `IncompleteDeepDive`, `MissOverview`, `PatternTable`, `PunchListOverview`, `ModalFix`, `EmptyStateFix`, `FinalVerdict`

### Composition Structure

```tsx
<Composition
  id="MigrationScorecard"
  component={MigrationScorecard}
  width={1920}
  height={1080}
  fps={30}
  durationInFrames={8100}
/>
```

The root component uses `<Series>` to sequence scenes:

```tsx
<Series>
  <Series.Sequence durationInFrames={150}><TitleCard /></Series.Sequence>
  <Series.Sequence durationInFrames={450}><ScopeOverview /></Series.Sequence>
  <Series.Sequence durationInFrames={600}><MechanicalWins /></Series.Sequence>
  <!-- ... etc -->
</Series>
```

## Data

All data is hardcoded in a `data.ts` constants file extracted from the three evaluation documents. No external data fetching. Key data structures:

- `PATTERNS`: array of `{ name, instances, handled, score, color }` for the pattern effectiveness table
- `CLASSIFICATIONS`: `{ breakage: 1, incomplete: 5, miss: 6 }` with percentages
- `PUNCH_LIST`: array of `{ id, pattern, files, effort, estimateMinutes }` for the cleanup list
- `CODE_EXAMPLES`: object with string arrays for each code snippet (breakage before/after, modal before/after, emptystate before/after, select before/after)

## File Structure

```
migration-scorecard/
  src/
    Root.tsx                    # Composition registration
    MigrationScorecard.tsx      # Root component with <Series>
    data.ts                     # All hardcoded data
    styles.ts                   # Color constants, shared styles
    components/
      AnimatedNumber.tsx
      CodeBlock.tsx
      PatternRow.tsx
      StatCard.tsx
      EffortBadge.tsx
      FadeIn.tsx
      SceneContainer.tsx
    scenes/
      TitleCard.tsx
      ScopeOverview.tsx
      MechanicalWins.tsx
      Transition.tsx
      ClassificationBreakdown.tsx
      BreakageDeepDive.tsx
      IncompleteDeepDive.tsx
      MissOverview.tsx
      PatternTable.tsx
      PunchListOverview.tsx
      ModalFix.tsx
      EmptyStateFix.tsx
      FinalVerdict.tsx
```

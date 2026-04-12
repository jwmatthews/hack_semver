# Prompt Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure `prompt.md` to prevent context exhaustion, add self-verification, and split the final report into audience-targeted sections.

**Architecture:** All 8 changes from the spec are edits to a single file (`prompt.md`). Changes are applied bottom-up (later sections first) to preserve line numbers for earlier edits. Change 1 is already implemented and just needs verification.

**Tech Stack:** Markdown prompt document — no code, no tests. Verification is manual review against the spec.

---

### Task 1: Verify Change 1 Is Already Implemented

**Files:**
- Review: `prompt.md:27-31`

Change 1 (PF6 Migration Reference — Usage Instructions) appears to already be present in the current `prompt.md`. Verify before moving on.

- [ ] **Step 1: Read lines 27-31 of prompt.md and compare to spec**

The spec says to add these two paragraphs at the top of the PF6 reference section:

> Refer back to this section when assessing each file. Do not rely on your training knowledge of PF6 — use only the patterns listed here to judge correctness. If a migration pattern is not listed here, flag it as "unverified pattern" rather than guessing.

> If you encounter a PF6 pattern you are unsure about, say so explicitly. Do not infer correctness from import path plausibility alone.

Run:
```bash
sed -n '27,31p' prompt.md
```

Expected: Both paragraphs are present at lines 28-30. If they are, Change 1 is complete — move to Task 2.

If missing, add them after line 27 (the PF6 reference header) as a new step.

---

### Task 2: Add Anti-Hallucination Guardrails (Change 7)

**Files:**
- Modify: `prompt.md` — Operating Instructions section (currently starts at line 323)

Starting with later sections to preserve line numbers for earlier edits.

- [ ] **Step 1: Locate the Operating Instructions section**

Run:
```bash
grep -n "OPERATING INSTRUCTIONS" prompt.md
```

Expected: Line ~323.

- [ ] **Step 2: Add anti-hallucination guardrails after the existing Operating Instructions entries**

Insert the following block before the final closing of the Operating Instructions section (after the "Tone:" paragraph, currently ending around line 346). Place it after the existing "Tone:" entry:

```markdown
Anti-hallucination: Follow these rules strictly:
  - If you cannot fetch a file or diff, say so. Do not reconstruct code
    from memory.
  - If a diff is too large to hold in context, analyze it in sections.
    State which sections you analyzed and which you skipped.
  - Distinguish between "I verified this by reading the code" and "I infer
    this from the diff context." Label inferences.
```

- [ ] **Step 3: Verify the addition**

Run:
```bash
grep -n "Anti-hallucination" prompt.md
```

Expected: One match in the Operating Instructions section.

- [ ] **Step 4: Commit**

```bash
git add prompt.md
git commit -m "prompt: add anti-hallucination guardrails to operating instructions

Change 7 from the prompt improvements spec. Forces the model to
be explicit about partial coverage and inference vs. verification."
```

---

### Task 3: Add Tone Calibration by Section (Change 8)

**Files:**
- Modify: `prompt.md` — Operating Instructions section, "Tone:" entry

- [ ] **Step 1: Locate the current Tone entry**

Run:
```bash
grep -n "^Tone:" prompt.md
```

Expected: Line ~345.

- [ ] **Step 2: Replace the existing Tone entry**

Replace the current single-line Tone instruction:

```
Tone: Maintain the lens of a senior PF6 developer who has been asked to review
  this branch before onboarding it. They care about correctness, they do not
  give partial credit for effort, and they will have to live with any problems
  they miss in review.
```

With the section-specific tone calibration:

```
Tone: Calibrate your register to match each section's audience:
  - Per-file analysis: senior developer reviewing code — technical,
    precise, no hedging.
  - Stakeholder brief: explaining the situation to your engineering
    director — no jargon, no component names, clear recommendation.
  - Punch list: handing off work to a colleague — actionable,
    specific, no editorializing.
  - Tool assessment: writing an internal memo evaluating a vendor
    tool — balanced, evidence-based, honest about limitations.
```

- [ ] **Step 3: Verify the replacement**

Run:
```bash
grep -A 10 "^Tone:" prompt.md
```

Expected: The new four-bullet tone calibration block.

- [ ] **Step 4: Commit**

```bash
git add prompt.md
git commit -m "prompt: calibrate tone per output section

Change 8 from the prompt improvements spec. Different sections
serve different audiences and need different registers."
```

---

### Task 4: Add Stage 1 Checkpoint (Change 2)

**Files:**
- Modify: `prompt.md` — end of Phase 2 section (around line 122)

- [ ] **Step 1: Locate the end of Phase 2**

Run:
```bash
grep -n "PHASE 3" prompt.md
```

Expected: Line ~126. The checkpoint goes just before this line.

- [ ] **Step 2: Add the checkpoint instruction**

Insert the following block after the Phase 2 priority triage paragraph (after "use your judgment — if patterns become repetitive, note the pattern and summarize rather than repeating full analysis.") and before the Phase 3 header:

```markdown

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STAGE 1 CHECKPOINT — STOP AND OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stop and output your file inventory table and priority triage. Do not begin
per-file analysis until you have committed to this inventory.

Use the inventory above to guide your analysis in Stage 2. HIGH priority
files get full analysis, MEDIUM files get focused analysis, LOW files get
representative sampling. If you skipped this checkpoint, go back — the next
stage depends on it.

```

- [ ] **Step 3: Verify the checkpoint is in place**

Run:
```bash
grep -n "STAGE 1 CHECKPOINT" prompt.md
```

Expected: One match between Phase 2 content and Phase 3 header.

- [ ] **Step 4: Commit**

```bash
git add prompt.md
git commit -m "prompt: add Stage 1 checkpoint after inventory

Change 2 from the prompt improvements spec. Forces the model to
commit to a file inventory before spending context on analysis."
```

---

### Task 5: Restructure Phase 3 for Tiered Analysis (Change 3)

**Files:**
- Modify: `prompt.md` — Phase 3 section (currently lines ~126-217)

This is the largest change. Phase 3 needs to be restructured into three tiers with different analysis depths and mini-checkpoints between them.

- [ ] **Step 1: Read the current Phase 3 section to confirm boundaries**

Run:
```bash
sed -n '/PHASE 3/,/PHASE 4/p' prompt.md
```

Expected: The full Phase 3 content, ending just before Phase 4.

- [ ] **Step 2: Replace the Phase 3 content**

Keep the Phase 3 header and the initial instruction about fetching pre-migration source. Replace the per-file analysis template and everything after it (up to but not including Phase 4) with the following tiered structure:

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STAGE 2 — PER-FILE ANALYSIS (PHASE 3)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each file, retrieve the pre-migration PF5 source from the base branch
whenever the two PRs diverge significantly, or when you need original intent
to judge whether a migration was semantically correct.

Analyze files by tier, using your Stage 1 inventory to determine priority.

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
HIGH PRIORITY FILES — Full 8-Criterion Analysis
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

Files containing high-complexity components (Dropdown, Select, Wizard,
ApplicationLauncher, ContextSelector). Use the full analysis template below.

For each HIGH priority OVERLAP file, produce this block:

─────────────────────────────────────────────
`path/to/file.tsx`  [HIGH PRIORITY]
─────────────────────────────────────────────

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes/no — list them briefly
  Semantic changes present:    yes/no — list them briefly
  Non-PF6 changes in golden-source: yes/no — describe if yes

CRITERIA ASSESSMENT:
  Each criterion: ✅ Correct | ⚠️ Partial | ❌ Wrong/Missing | N/A

  1. Import correctness
     Are PF5 import paths replaced with correct PF6 paths?
     Any imports added by semver-migrated that are wrong or unnecessary?

  2. Component API alignment
     Renamed/removed/new-required props handled correctly?
     Are removed props dropped cleanly or left as dead attributes?

  3. Structural/JSX correctness
     Does the migrated JSX maintain intended component hierarchy?
     For high-complexity components: was the full restructure done or just
     a surface-level import swap?

  4. CSS token migration
     Are --pf-v5-* tokens replaced with --pf-v6-* equivalents?
     Are PF5-specific class names updated or removed?

  5. TypeScript correctness
     Are deprecated PF5 types replaced with PF6 equivalents?
     Any @ts-ignore or `any` casts added that suggest the automation punted?
     Any type errors introduced?

  6. Completeness vs. golden-source
     Characterize as one of:
       EQUIVALENT   — semver-migrated did the same thing
       SUBSET       — semver-migrated did part of what golden-source did
       SUPERSET     — semver-migrated did more (assess whether the extra
                      is correct PF6 or noise)
       DIVERGENT    — both changed the file but in different ways

  7. Half-migration risk  ⚠️ ELEVATED CRITERION
     Are PF5 and PF6 patterns mixed in the same component?
     A half-migrated component is often worse than an unmigrated one — it
     will fail in ways that are harder to debug. Flag immediately.

  8. Correctness risk
     Does semver-migrated introduce changes that would break the component
     or produce wrong behavior in PF6?
     RISK LEVEL: HIGH / MEDIUM / LOW / NONE

EVIDENCE REQUIREMENT:
  For any criterion you marked ✅ Correct, quote the specific diff hunk or
  fetched source line(s) from semver-migrated that confirm correctness. If
  you cannot quote evidence, downgrade to ⚠️ Partial.

WHAT GOLDEN-SOURCE DID:
  1-3 sentences. Focus on the semantic intent, not just mechanics.

WHAT SEMVER-MIGRATED DID:
  1-3 sentences. Be specific about what was done vs. what should have been done.

DELTA:
  The specific gap between them. If semver-migrated missed a structural
  rewrite, say exactly what the correct PF6 pattern should look like.

DEVELOPER UTILITY VERDICT:
  If a developer started from semver-migrated's version of this file instead
  of the PF5 original, estimate the net time impact: saves time, costs time,
  or roughly equivalent. Be specific about what they'd still need to do.

IF RISK LEVEL IS HIGH — REQUIRED FIX:
  Tell the developer exactly what they need to do to make this file safe
  to use. Be specific: which lines, which pattern, which PF6 API.

─────────────────────────────────────────────

MINI-CHECKPOINT — HIGH TIER COMPLETE:
  Re-read your assessments for this tier. For any ✅ Correct verdict, confirm
  you cited evidence. For any HIGH risk finding, confirm you described the
  specific fix.

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
MEDIUM PRIORITY FILES — Focused 5-Criterion Analysis
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

Files with moderate-complexity changes. Use a reduced analysis template.

For each MEDIUM priority OVERLAP file:

─────────────────────────────────────────────
`path/to/file.tsx`  [MEDIUM PRIORITY]
─────────────────────────────────────────────

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes/no — list them briefly
  Semantic changes present:    yes/no — list them briefly

CRITERIA ASSESSMENT (5 criteria — CSS tokens, TypeScript types, and
structural/JSX correctness are folded into correctness risk):

  1. Import correctness
  2. Component API alignment
  3. Half-migration risk  ⚠️ ELEVATED CRITERION
  4. Correctness risk (RISK LEVEL: HIGH / MEDIUM / LOW / NONE)
  5. Completeness vs. golden-source (EQUIVALENT / SUBSET / SUPERSET / DIVERGENT)

DEVELOPER UTILITY VERDICT:
  If a developer started from semver-migrated's version of this file instead
  of the PF5 original, estimate the net time impact: saves time, costs time,
  or roughly equivalent. Be specific about what they'd still need to do.

IF RISK LEVEL IS HIGH — REQUIRED FIX:
  Specific fix instructions.

─────────────────────────────────────────────

MINI-CHECKPOINT — MEDIUM TIER COMPLETE:
  Re-read your assessments for this tier. For any ✅ Correct verdict, confirm
  you cited evidence. For any HIGH risk finding, confirm you described the
  specific fix.

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
LOW PRIORITY FILES — Representative Sampling
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

Files where only mechanical changes are expected.

Pick 1-2 representative LOW priority files and analyze them using the
MEDIUM template above.

Then list the remaining LOW priority files. For each, state whether it
follows the same pattern as the representative file or diverges. If a
file diverges from the representative pattern, promote it to MEDIUM and
analyze with the MEDIUM template.

MINI-CHECKPOINT — LOW TIER COMPLETE:
  Re-read your assessments. Confirm any promoted files received MEDIUM-depth
  analysis.

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
GOLDEN-ONLY AND AUTO-ONLY FILES
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

For GOLDEN-ONLY files:
`path/to/file.tsx`  *(not touched by semver-migrated)*
  What did golden-source change here, and how significant is this gap?
  Would the missing migration cause visible breakage or just degraded UI?

For AUTO-ONLY files:
`path/to/file.tsx`  *(not touched by golden-source)*
  Are these changes valid PF6 migration, unrelated cleanup, or noise?
  If noise: how much developer time would cleanup take?
```

- [ ] **Step 3: Verify the new structure**

Run:
```bash
grep -n "PRIORITY FILES\|MINI-CHECKPOINT\|EVIDENCE REQUIREMENT\|GOLDEN-ONLY AND AUTO-ONLY" prompt.md
```

Expected: Three tier headers, three mini-checkpoints, one evidence requirement, and one GOLDEN-ONLY/AUTO-ONLY section.

- [ ] **Step 4: Commit**

```bash
git add prompt.md
git commit -m "prompt: restructure Phase 3 into tiered per-file analysis

Change 3 from the prompt improvements spec. HIGH priority files get
full 8-criterion analysis with evidence requirements. MEDIUM files
get focused 5-criterion analysis. LOW files use representative
sampling with promotion for divergent files."
```

---

### Task 6: Add Self-Consistency Check (Change 6)

**Files:**
- Modify: `prompt.md` — insert new section between Phase 5 (Noise Quantification) and Phase 6 (Final Report)

- [ ] **Step 1: Locate the boundary between Phase 5 and Phase 6**

Run:
```bash
grep -n "PHASE 5\|PHASE 6\|FINAL REPORT" prompt.md
```

Expected: Phase 5 and Phase 6 headers with their line numbers.

- [ ] **Step 2: Insert the self-consistency check**

Add the following block after the last line of Phase 5 content and before the Phase 6 header:

```markdown

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STAGE 3 PRE-CHECK — SELF-CONSISTENCY VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before writing the final report, re-read all per-file verdicts and check
for internal consistency:

  1. Does any file have contradictory criteria? For example: ✅ Correct on
     imports but ❌ Wrong/Missing on half-migration for the same component.
     If so, reconcile — one of the two verdicts is wrong.

  2. If any per-file verdict was HIGH risk but your summary is about to say
     the branch is adoptable, reconcile the contradiction before proceeding.

  3. Do your per-file Developer Utility Verdicts align with the overall
     recommendation you are about to make?

Fix any inconsistencies you find before writing the report. Do not write
the report with known contradictions — resolve them first.

```

- [ ] **Step 3: Verify**

Run:
```bash
grep -n "SELF-CONSISTENCY" prompt.md
```

Expected: One match between Phase 5 and Phase 6.

- [ ] **Step 4: Commit**

```bash
git add prompt.md
git commit -m "prompt: add self-consistency check before final report

Change 6 from the prompt improvements spec. Forces the model to
reconcile contradictions between per-file verdicts and summary
conclusions before writing the report."
```

---

### Task 7: Restructure Phase 6 Into Three-Part Report (Change 5)

**Files:**
- Modify: `prompt.md` — Phase 6 / Final Report section

- [ ] **Step 1: Read the current Phase 6 section**

Run:
```bash
grep -n "PHASE 6\|OPERATING INSTRUCTIONS" prompt.md
```

Identify the exact boundaries of Phase 6.

- [ ] **Step 2: Replace Phase 6 content**

Replace everything from the Phase 6 header through to (but not including) the Operating Instructions header with:

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STAGE 3 — SYNTHESIS & FINAL REPORT (PHASE 6)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The final report has three parts, each for a different audience. Write them
in order.

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
PART 1: STAKEHOLDER BRIEF
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

Audience: engineering director or stakeholder deciding whether to invest in
the automation tooling. No PF6 jargon, no component names.

Write one paragraph covering:
  - What was tested (one sentence)
  - What the result means (one sentence)
  - Clear recommendation: adopt as starting point / adopt with caveats /
    do not adopt
  - One metric that captures the story (e.g., "correctly handled 70% of
    simple changes but 0% of complex structural rewrites")

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
PART 2: DEVELOPER PUNCH LIST
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

Audience: the developer who will fix the semver-migrated branch.

Ordered table, highest risk first:

  | Priority | File | What to Fix | Why | Effort |
  |---|---|---|---|---|

Effort as rough t-shirt sizing (minutes/hours). This replaces the scattered
"REQUIRED FIX" blocks from per-file analysis — consolidate them here.

─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
PART 3: TECHNICAL ASSESSMENT
─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

Audience: prompt author and tool evaluator.

## Executive Summary
Full paragraph. Honest overall verdict. Lead with the most important finding.
Do not bury the conclusion.

## Coverage and Quality Metrics
Report three separate coverage numbers — they will tell different stories:
  - File coverage:    X of Y files from golden-source were touched by
                      semver-migrated
  - Pattern coverage: X of Y distinct migration pattern types handled
                      correctly
  - Line coverage:    estimated % of golden-source line changes reproduced
                      correctly in semver-migrated

## Aggregate Findings
  Where semver-migrated is helping:
    Specific files/patterns where automation added clear value

  Where semver-migrated is hurting:
    Files/patterns where automation introduced correctness risk or noise
    that will cost developer time to clean up

  Where semver-migrated is neutral:
    Correct direction but insufficient to reduce developer effort

  Coverage gaps (GOLDEN-ONLY files):
    What was missed and how impactful is each gap?

  Automation noise (AUTO-ONLY files):
    Legitimate catches vs. spurious changes

  Half-migrations detected:
    List any files where PF5 and PF6 are mixed — these are the highest
    priority cleanup items

## Appendix: Automation Tool Assessment
Answer these directly. No hedging.

  1. What is the automation's effective ceiling?
     Is it handling mechanical changes reliably, semantic changes partially,
     or both unreliably? Give your honest read of what the tool understands
     vs. what it's pattern-matching around.

  2. Would a PF6 developer save time starting from semver-migrated?
     Answer separately for:
       a) Files with only mechanical changes
       b) Files with high-complexity component rewrites
       c) Test files (if applicable)

  3. What are the top 3 failure modes of the current automation?
     Be specific — not "missed semantic changes" but "Dropdown restructure
     was replaced with import-only update, leaving broken PF5 JSX structure
     with PF6 imports."

  4. What are the highest-risk items a developer must fix before this
     branch could be used as a starting point? List by file, ordered by
     risk.

  5. What would the automation need to improve to be genuinely useful?
     What's the gap between what it currently does and what would make a
     developer say "yes, this saves me real time"?

```

- [ ] **Step 3: Verify the three-part structure**

Run:
```bash
grep -n "PART [123]:" prompt.md
```

Expected: Three matches — PART 1 (Stakeholder Brief), PART 2 (Developer Punch List), PART 3 (Technical Assessment).

- [ ] **Step 4: Verify the Automation Assessment is now an appendix**

Run:
```bash
grep -n "Appendix: Automation" prompt.md
```

Expected: One match, inside Part 3.

- [ ] **Step 5: Commit**

```bash
git add prompt.md
git commit -m "prompt: restructure final report into three audience-targeted parts

Change 5 from the prompt improvements spec. Part 1 is a stakeholder
brief (no jargon), Part 2 is a developer punch list (actionable table),
Part 3 is the technical assessment with automation eval as appendix."
```

---

### Task 8: Add Stage Labels to Phase Headers

**Files:**
- Modify: `prompt.md` — Phase 0, 1, 2, 4, 5 headers

The spec's structural overview groups phases into three stages. Phase 3 and 6 already got stage labels in Tasks 5 and 7. Update the remaining phase headers to match the staging model.

- [ ] **Step 1: Update Phase 0 header**

Change:
```
PHASE 0 — ORIENTATION
```
To:
```
STAGE 1 — GROUND TRUTH (PHASE 0: ORIENTATION)
```

- [ ] **Step 2: Update Phase 1 header**

Change:
```
PHASE 1 — GATE CHECK (run this first, stop if it fails)
```
To:
```
STAGE 1 (PHASE 1: GATE CHECK — run this first, stop if it fails)
```

- [ ] **Step 3: Update Phase 2 header**

Change:
```
PHASE 2 — FETCH AND INVENTORY
```
To:
```
STAGE 1 (PHASE 2: FETCH AND INVENTORY)
```

- [ ] **Step 4: Update Phase 4 header**

Change:
```
PHASE 4 — CROSS-FILE PATTERN ANALYSIS
```
To:
```
STAGE 3 (PHASE 4: CROSS-FILE PATTERN ANALYSIS)
```

- [ ] **Step 5: Update Phase 5 header**

Change:
```
PHASE 5 — NOISE QUANTIFICATION
```
To:
```
STAGE 3 (PHASE 5: NOISE QUANTIFICATION)
```

- [ ] **Step 6: Verify all stage labels**

Run:
```bash
grep -n "^STAGE\|^PHASE" prompt.md
```

Expected: All phase headers now have stage labels. Stages 1, 2, and 3 should be clearly delineated.

- [ ] **Step 7: Commit**

```bash
git add prompt.md
git commit -m "prompt: add stage labels to all phase headers

Matches the three-stage structure from the spec: Stage 1 (ground truth),
Stage 2 (analysis), Stage 3 (synthesis & verification)."
```

---

### Task 9: Final Review — Verify All 8 Changes Against Spec

- [ ] **Step 1: Read the full updated prompt.md**

```bash
wc -l prompt.md
cat prompt.md
```

- [ ] **Step 2: Check each spec change is present**

Verify by searching for key markers:

```bash
# Change 1: PF6 usage instructions
grep -c "unverified pattern" prompt.md  # Expected: 1

# Change 2: Stage 1 checkpoint
grep -c "STAGE 1 CHECKPOINT" prompt.md  # Expected: 1

# Change 3: Tiered analysis
grep -c "MINI-CHECKPOINT" prompt.md  # Expected: 3

# Change 4: Developer utility verdict rework
grep -c "net time impact" prompt.md  # Expected: at least 1

# Change 5: Three-part report
grep -c "PART [123]:" prompt.md  # Expected: 3

# Change 6: Self-consistency check
grep -c "SELF-CONSISTENCY" prompt.md  # Expected: 1

# Change 7: Anti-hallucination
grep -c "Anti-hallucination" prompt.md  # Expected: 1

# Change 8: Tone calibration
grep -c "engineering director" prompt.md  # Expected: 1
```

All counts should match expected values.

- [ ] **Step 3: Commit any fixes if needed, otherwise mark complete**

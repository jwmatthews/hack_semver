# PF5-to-PF6 PR Evaluation Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Execute a structured evaluation of automated PF5→PF6 migration PR (jwmatthews/quipucords-ui#5) against the human-authored reference (quipucords/quipucords-ui#664), producing a three-audience final report.

**Architecture:** A sequential pipeline of subagent tasks. Each task writes structured markdown output to `results/`. The controller reads prior outputs and passes relevant sections as context to downstream tasks. Stage 1 produces an inventory that determines the file assignments for Stage 2. Stage 2 tasks analyze files by tier. Stage 3 tasks synthesize all per-file outputs into cross-cutting analysis and a final report.

**Tech Stack:** `gh` CLI for PR diff retrieval, GitHub REST API as fallback, markdown for all outputs.

**Output directory:** `results/` (relative to project root)

---

## Dependency Graph

```
Task 1 (Gate Check)
    │
    v
Task 2 (Inventory) ──> produces file list + triage
    │
    ├──> Task 3 (HIGH tier analysis)
    ├──> Task 4 (MEDIUM tier analysis)
    ├──> Task 5 (LOW tier analysis)
    └──> Task 6 (GOLDEN-ONLY + AUTO-ONLY analysis)
              │
              v  (all of 3-6 complete)
         Task 7 (Cross-File Patterns)
              │
              v
         Task 8 (Noise Quantification)
              │
              v
         Task 9 (Self-Consistency Check)
              │
              v
         Task 10 (Final Report)
```

Tasks 3, 4, 5, and 6 can run **in parallel** — they operate on disjoint file sets. All other tasks are sequential.

**Stage 1 Checkpoint:** After Task 2 completes, the controller should read `results/02-inventory.md` and present it to the user before dispatching Tasks 3-6. If the triage looks wrong (e.g., a file with a Dropdown component was classified LOW), fix it now — all downstream analysis depends on this inventory being correct.

---

## Shared Context Block

Every analysis subagent (Tasks 3-9) must receive this block at the top of its prompt. The controller should paste it verbatim.

```markdown
## PRs Under Evaluation

golden-source:   https://github.com/quipucords/quipucords-ui/pull/664
                 Human-authored PF5→PF6 migration. May contain non-PF6 changes.

semver-migrated: https://github.com/jwmatthews/quipucords-ui/pull/5
                 Automated migration. This is what you are evaluating.

Base branch of jwmatthews/quipucords-ui = pre-migration PF5 source of truth.

## PF6 Migration Reference

HIGH-COMPLEXITY COMPONENT REWRITES (automation most likely to fail here):
  - Dropdown: complete structural rewrite. PF5 Dropdown → composition of
    MenuToggle + DropdownList + DropdownItem. Import-only update is wrong.
  - Select: total API rewrite. PF5 SelectOption/SelectVariant → new
    Select + SelectList + SelectOption composition model.
  - Wizard: restructured with new step API.
  - ContextSelector: removed; replaced with Select-based patterns.
  - ApplicationLauncher: removed entirely, no direct equivalent.
  - DataToolbar: renamed to Toolbar with restructured child components.

MODERATE-COMPLEXITY CHANGES:
  - Page/Masthead: restructured composition (MastheadBrand, MastheadMain,
    MastheadContent).
  - Nav/NavItem: minor but important prop changes.
  - Alert/AlertGroup: ActionGroup behavior changed.
  - Button: `isPlain` removed; use `variant="plain"`.
  - Spinner: `isSVG` removed (SVG is default).
  - Label: `isTruncated` → `textMaxWidth`.
  - Tooltip: `entryDelay`/`exitDelay` → `triggerDelay`/`exitDelay`.

LOW-COMPLEXITY / MECHANICAL CHANGES:
  - Import paths changed for @patternfly/react-core and react-table.
  - CSS tokens: ALL --pf-v5-* → --pf-v6-*. Any v5 token remaining is a bug.
  - Icon imports: moved to direct named exports; some names changed.
  - Table: IRow/ICell deprecated → Td/Tr typed components.

CLASSIFICATION:
  Mechanical: import path update, CSS token rename, prop rename. Codemod-able.
  Semantic: component restructure, composition change, removal requiring
    workaround. Requires developer judgment.

Refer only to patterns listed above. If a migration pattern is not listed
here, flag it as "unverified pattern" rather than guessing. If unsure about
a PF6 pattern, say so explicitly.

## Operating Instructions

Confidence: Mark uncertain assessments as [HIGH/MEDIUM/LOW CONFIDENCE].
Scope: Note non-PF6 golden-source changes but do not penalize semver-migrated
  for not including them.
Test files: Analyze under separate subheading. Note if tests would fail
  against semver-migrated's own output.
Tone: Senior developer reviewing code — technical, precise, no hedging.
Anti-hallucination:
  - Cannot fetch a file? Say so. Do not reconstruct from memory.
  - Diff too large? Analyze in sections. State what you skipped.
  - Distinguish "verified by reading code" from "inferred from diff context."
```

---

### Task 1: Gate Check

**Files:**
- Create: `results/01-gate-check.md`

**Input:** None (first task).

**What the subagent does:** Verify the foundation before any analysis begins.

- [ ] **Step 1: Check semver-migrated package.json for PF6 versions**

```bash
gh api repos/jwmatthews/quipucords-ui/pulls/5/files --jq '.[] | select(.filename == "package.json") | .patch'
```

Look for `@patternfly/react-core`, `@patternfly/react-icons`, `@patternfly/react-table` being bumped to v6.x. If the patch is empty or doesn't show PF6 versions, the gate fails.

- [ ] **Step 2: Check for lock file changes**

```bash
gh api repos/jwmatthews/quipucords-ui/pulls/5/files --jq '.[].filename' | grep -E 'package-lock|yarn.lock'
```

Note presence or absence.

- [ ] **Step 3: Write gate check result to results/01-gate-check.md**

Write a file with this structure:

```markdown
# Gate Check Result

## Package Version Gate
Status: PASS / FAIL
Details: [which packages were bumped to which versions, or what's missing]

## Lock File
Status: PRESENT / MISSING
Details: [which lock file, or note absence]

## Gate Summary
[One paragraph: can analysis proceed? If gate failed, note that findings
will still be produced but the migration cannot be functional as-is.]
```

---

### Task 2: Fetch Diffs and Build File Inventory

**Files:**
- Create: `results/02-inventory.md`
- Create: `results/diffs/golden-source.diff`
- Create: `results/diffs/semver-migrated.diff`

**Input:** `results/01-gate-check.md` (for context, not blocking).

**What the subagent does:** Retrieve both PR diffs and build the file inventory with priority triage.

- [ ] **Step 1: Fetch both PR diffs**

```bash
mkdir -p results/diffs
gh pr diff 664 --repo quipucords/quipucords-ui > results/diffs/golden-source.diff
gh pr diff 5 --repo jwmatthews/quipucords-ui > results/diffs/semver-migrated.diff
```

If `gh pr diff` fails, fall back to the REST API:

```bash
gh api repos/quipucords/quipucords-ui/pulls/664 -H "Accept: application/vnd.github.v3.diff" > results/diffs/golden-source.diff
gh api repos/jwmatthews/quipucords-ui/pulls/5 -H "Accept: application/vnd.github.v3.diff" > results/diffs/semver-migrated.diff
```

- [ ] **Step 2: Extract file lists from both diffs**

```bash
grep '^diff --git' results/diffs/golden-source.diff | sed 's|diff --git a/||; s| b/.*||' | sort > /tmp/golden-files.txt
grep '^diff --git' results/diffs/semver-migrated.diff | sed 's|diff --git a/||; s| b/.*||' | sort > /tmp/semver-files.txt
```

- [ ] **Step 3: Classify each file as OVERLAP, GOLDEN-ONLY, or AUTO-ONLY**

```bash
comm -12 /tmp/golden-files.txt /tmp/semver-files.txt  # OVERLAP
comm -23 /tmp/golden-files.txt /tmp/semver-files.txt  # GOLDEN-ONLY
comm -13 /tmp/golden-files.txt /tmp/semver-files.txt  # AUTO-ONLY
```

- [ ] **Step 4: Triage OVERLAP files into priority tiers**

For each OVERLAP file, read the diff hunks to determine which PF6 components are involved. Apply these rules:

- **HIGH PRIORITY** if the file's diff touches Dropdown, Select, Wizard, ApplicationLauncher, ContextSelector, or DataToolbar/Toolbar
- **MEDIUM PRIORITY** if the file's diff touches Page/Masthead, Nav/NavItem, Alert/AlertGroup, Button `isPlain`, Spinner `isSVG`, Label `isTruncated`, Tooltip delays
- **LOW PRIORITY** if only import path changes, CSS token renames, or icon import updates

- [ ] **Step 5: Write inventory to results/02-inventory.md**

```markdown
# File Inventory and Priority Triage

## Inventory Table

| File | In golden-source | In semver-migrated | Status |
|------|------------------|--------------------|--------|
| path/to/file.tsx | Yes | Yes | OVERLAP |
| ... | ... | ... | ... |

## Priority Triage (OVERLAP files only)

### HIGH PRIORITY
| File | Reason |
|------|--------|
| path/to/dropdown.tsx | Contains Dropdown component (full rewrite required) |

### MEDIUM PRIORITY
| File | Reason |
|------|--------|
| path/to/nav.tsx | Contains NavItem prop changes |

### LOW PRIORITY
| File | Reason |
|------|--------|
| path/to/utils.tsx | Import path changes only |

## GOLDEN-ONLY Files
- path/to/file1.tsx
- path/to/file2.tsx

## AUTO-ONLY Files
- path/to/file3.tsx
- path/to/file4.tsx

## Summary
- OVERLAP: N files (H high, M medium, L low)
- GOLDEN-ONLY: N files
- AUTO-ONLY: N files
```

---

### Task 3: HIGH Priority Per-File Analysis

**Files:**
- Create: `results/03-high-tier.md`

**Input:**
- `results/02-inventory.md` — the controller extracts the HIGH PRIORITY file list
- `results/diffs/golden-source.diff` and `results/diffs/semver-migrated.diff` — the subagent reads relevant sections
- Shared Context Block (pasted by controller)

**What the subagent does:** Full 8-criterion analysis for each HIGH priority file.

- [ ] **Step 1: For each HIGH priority file, extract diff hunks from both PRs**

For each file in the HIGH PRIORITY list:

```bash
# Extract the diff hunk for a specific file from the full diff
awk '/^diff --git a\/PATH_HERE /{found=1} found{print} found && /^diff --git/ && !/a\/PATH_HERE/{exit}' results/diffs/golden-source.diff
```

Repeat for `semver-migrated.diff`.

If the diffs diverge significantly, also fetch the pre-migration PF5 source:

```bash
gh api repos/jwmatthews/quipucords-ui/contents/PATH_HERE?ref=main -H "Accept: application/vnd.github.v3.raw"
```

- [ ] **Step 2: Analyze each HIGH priority file using the 8-criterion template**

For each file, produce this block:

```markdown
─────────────────────────────────────────────
`path/to/file.tsx`  [HIGH PRIORITY]
─────────────────────────────────────────────

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes/no — [list]
  Semantic changes present:    yes/no — [list]
  Non-PF6 changes in golden-source: yes/no — [describe]

CRITERIA ASSESSMENT:
  Each criterion: ✅ Correct | ⚠️ Partial | ❌ Wrong/Missing | N/A

  1. Import correctness
     [assessment with specific imports cited]

  2. Component API alignment
     [assessment with specific props cited]

  3. Structural/JSX correctness
     [assessment — was full restructure done or just import swap?]

  4. CSS token migration
     [assessment with specific tokens cited]

  5. TypeScript correctness
     [assessment — any @ts-ignore or `any` casts?]

  6. Completeness vs. golden-source
     [EQUIVALENT / SUBSET / SUPERSET / DIVERGENT with explanation]

  7. Half-migration risk  ⚠️ ELEVATED CRITERION
     [are PF5 and PF6 patterns mixed?]

  8. Correctness risk
     RISK LEVEL: [HIGH / MEDIUM / LOW / NONE]
     [what breaks and how]

EVIDENCE REQUIREMENT:
  [For each ✅ Correct verdict, quote the specific diff hunk or source lines
  that confirm it. If cannot quote evidence, downgrade to ⚠️ Partial.]

WHAT GOLDEN-SOURCE DID:
  [1-3 sentences — semantic intent]

WHAT SEMVER-MIGRATED DID:
  [1-3 sentences — what was done vs. should have been done]

DELTA:
  [specific gap — if structural rewrite missed, show correct PF6 pattern]

DEVELOPER UTILITY VERDICT:
  [saves time / costs time / roughly equivalent — what they'd still need to do]

IF RISK LEVEL IS HIGH — REQUIRED FIX:
  [exact fix: which lines, which pattern, which PF6 API]
```

- [ ] **Step 3: Run mini-checkpoint**

After all HIGH files are analyzed, re-read all assessments in this file:
- For every ✅ Correct verdict, confirm evidence was cited
- For every HIGH risk finding, confirm a specific fix was described
- Fix any gaps before writing the file

- [ ] **Step 4: Write results to results/03-high-tier.md**

```markdown
# HIGH Priority File Analysis

[all per-file blocks from Step 2]

## Mini-Checkpoint
- Evidence cited for all ✅ verdicts: Yes/No [fix if No]
- Specific fix described for all HIGH risk: Yes/No [fix if No]
```

---

### Task 4: MEDIUM Priority Per-File Analysis

**Files:**
- Create: `results/04-medium-tier.md`

**Input:**
- `results/02-inventory.md` — the controller extracts the MEDIUM PRIORITY file list
- `results/diffs/golden-source.diff` and `results/diffs/semver-migrated.diff`
- Shared Context Block

**What the subagent does:** Focused 5-criterion analysis for each MEDIUM priority file.

- [ ] **Step 1: For each MEDIUM priority file, extract diff hunks from both PRs**

Same approach as Task 3 Step 1.

- [ ] **Step 2: Analyze each MEDIUM priority file using the 5-criterion template**

For each file, produce:

```markdown
─────────────────────────────────────────────
`path/to/file.tsx`  [MEDIUM PRIORITY]
─────────────────────────────────────────────

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes/no — [list]
  Semantic changes present:    yes/no — [list]

CRITERIA ASSESSMENT (CSS tokens, TypeScript types, structural/JSX
correctness folded into correctness risk):

  1. Import correctness
     [assessment]
  2. Component API alignment
     [assessment]
  3. Half-migration risk  ⚠️ ELEVATED CRITERION
     [assessment]
  4. Correctness risk (RISK LEVEL: HIGH / MEDIUM / LOW / NONE)
     [assessment]
  5. Completeness vs. golden-source (EQUIVALENT / SUBSET / SUPERSET / DIVERGENT)
     [assessment]

DEVELOPER UTILITY VERDICT:
  [saves time / costs time / roughly equivalent — specifics]

IF RISK LEVEL IS HIGH — REQUIRED FIX:
  [specific fix instructions]
```

- [ ] **Step 3: Run mini-checkpoint**

Re-read all assessments. For every ✅ verdict, confirm evidence was cited. For every HIGH risk, confirm fix was described.

- [ ] **Step 4: Write results to results/04-medium-tier.md**

```markdown
# MEDIUM Priority File Analysis

[all per-file blocks from Step 2]

## Mini-Checkpoint
- Evidence cited for all ✅ verdicts: Yes/No
- Specific fix described for all HIGH risk: Yes/No
```

---

### Task 5: LOW Priority Per-File Analysis

**Files:**
- Create: `results/05-low-tier.md`

**Input:**
- `results/02-inventory.md` — the controller extracts the LOW PRIORITY file list
- `results/diffs/golden-source.diff` and `results/diffs/semver-migrated.diff`
- Shared Context Block

**What the subagent does:** Representative sampling with promotion for divergent files.

- [ ] **Step 1: Pick 1-2 representative LOW priority files**

Choose files that appear most typical of the LOW tier (pure import path or CSS token changes). Extract their diff hunks from both PRs.

- [ ] **Step 2: Analyze representative files using the MEDIUM (5-criterion) template**

Same template as Task 4 Step 2.

- [ ] **Step 3: Compare remaining LOW files to the representative pattern**

For each remaining LOW priority file, extract its diff hunk and determine:
- Does it follow the same mechanical pattern as the representative?
- Or does it diverge (unexpected structural changes, component rewrites, etc.)?

- [ ] **Step 4: Promote divergent files and analyze them**

Any file that diverges from the representative pattern gets promoted to MEDIUM and analyzed with the full 5-criterion template from Task 4 Step 2.

- [ ] **Step 5: Run mini-checkpoint**

Confirm promoted files received full MEDIUM-depth analysis.

- [ ] **Step 6: Write results to results/05-low-tier.md**

```markdown
# LOW Priority File Analysis

## Representative Files
[1-2 full 5-criterion analysis blocks]

## Pattern Match Results
| File | Matches Representative? | Notes |
|------|------------------------|-------|
| path/to/file1.tsx | Yes | Same import path pattern |
| path/to/file2.tsx | No — PROMOTED | Contains unexpected Spinner isSVG change |

## Promoted File Analysis
[full 5-criterion blocks for promoted files, if any]

## Mini-Checkpoint
- All promoted files received MEDIUM-depth analysis: Yes/No
```

---

### Task 6: GOLDEN-ONLY and AUTO-ONLY File Analysis

**Files:**
- Create: `results/06-non-overlap.md`

**Input:**
- `results/02-inventory.md` — the controller extracts GOLDEN-ONLY and AUTO-ONLY lists
- `results/diffs/golden-source.diff` and `results/diffs/semver-migrated.diff`
- Shared Context Block

**What the subagent does:** Assess coverage gaps and noise.

- [ ] **Step 1: Analyze each GOLDEN-ONLY file**

For each file in the GOLDEN-ONLY list, extract its diff from golden-source.diff and produce:

```markdown
`path/to/file.tsx`  *(not touched by semver-migrated)*
  What golden-source changed: [description]
  Significance of gap: [HIGH / MEDIUM / LOW]
  Impact: [visible breakage / degraded UI / cosmetic / none]
```

- [ ] **Step 2: Analyze each AUTO-ONLY file**

For each file in the AUTO-ONLY list, extract its diff from semver-migrated.diff and produce:

```markdown
`path/to/file.tsx`  *(not touched by golden-source)*
  Classification: [valid PF6 migration / unrelated cleanup / noise]
  If noise: estimated cleanup effort: [minutes/hours]
  Details: [what was changed and whether it's correct]
```

- [ ] **Step 3: Write results to results/06-non-overlap.md**

```markdown
# GOLDEN-ONLY and AUTO-ONLY File Analysis

## GOLDEN-ONLY Files (Coverage Gaps)
[per-file blocks from Step 1]

### Coverage Gap Summary
- Total GOLDEN-ONLY files: N
- High significance gaps: N
- Would cause visible breakage: N

## AUTO-ONLY Files (Noise Assessment)
[per-file blocks from Step 2]

### Noise Summary
- Total AUTO-ONLY files: N
- Valid migration catches: N
- Unrelated cleanup: N
- Pure noise: N
```

---

### Task 7: Cross-File Pattern Analysis

**Files:**
- Create: `results/07-patterns.md`

**Input:**
- `results/03-high-tier.md`
- `results/04-medium-tier.md`
- `results/05-low-tier.md`
- `results/06-non-overlap.md`
- Shared Context Block

**What the subagent does:** Aggregate per-file findings into cross-cutting pattern analysis.

- [ ] **Step 1: Read all per-file analysis outputs**

The controller pastes the full content of results 03-06 into the prompt.

- [ ] **Step 2: Identify each distinct PF6 migration pattern that appears in 2+ files**

Scan all per-file analyses for recurring patterns, e.g.:
- "Dropdown restructure"
- "CSS token rename --pf-v5-* → --pf-v6-*"
- "Button isPlain removal"
- "Import path updates"
- etc.

- [ ] **Step 3: For each pattern, compute success rate and consistency**

```markdown
## Pattern: [name]
Files affected: [count]
semver-migrated success rate: X of Y files handled correctly
Failure mode: [describe how it failed when it did]
Consistency: [did semver-migrated handle this pattern the same way across
  all files, or inconsistently?]
```

Inconsistency in pattern handling is a significant automation quality signal — flag it prominently.

- [ ] **Step 4: Write results to results/07-patterns.md**

```markdown
# Cross-File Pattern Analysis

[pattern blocks from Step 3, ordered by failure rate — worst first]

## Pattern Summary
| Pattern | Files | Success Rate | Consistent? |
|---------|-------|-------------|-------------|
| Dropdown restructure | 3 | 0/3 | N/A |
| CSS token rename | 12 | 12/12 | Yes |
| ... | ... | ... | ... |
```

---

### Task 8: Noise Quantification

**Files:**
- Create: `results/08-noise.md`

**Input:**
- `results/diffs/semver-migrated.diff` — for line counts
- `results/03-high-tier.md` through `results/06-non-overlap.md` — for classification
- Shared Context Block

**What the subagent does:** Estimate signal-to-noise ratio.

- [ ] **Step 1: Count total lines changed in semver-migrated**

```bash
grep -c '^[+-]' results/diffs/semver-migrated.diff | head -1
# Or more precisely:
grep -E '^\+[^+]|^-[^-]' results/diffs/semver-migrated.diff | wc -l
```

- [ ] **Step 2: Classify lines using per-file analysis outputs**

Using the verdicts from tasks 03-06, estimate:
- Lines that are valid PF6 migration changes
- Lines that are unrelated/spurious changes
- Lines that are incorrect/harmful changes

This is an estimate — use the per-file classifications and rough proportions.

**Critical threshold:** If noise exceeds 20%, the branch is materially harder to adopt. Call this out prominently in the output — it's a key finding for the final report.

- [ ] **Step 3: Write results to results/08-noise.md**

```markdown
# Noise Quantification

## Signal-to-Noise Ratio

| Category | Lines | Percentage |
|----------|-------|-----------|
| Valid PF6 migration changes | N | X% |
| Unrelated/spurious changes | N | X% |
| Incorrect/harmful changes | N | X% |
| **Total lines changed** | **N** | **100%** |

## Noise Threshold Assessment
[Is noise >20%? If so, state: "This branch exceeds the 20% noise threshold,
making it materially harder to adopt."]

## AUTO-ONLY Breakdown
- Valid migration catches: N files
- Unrelated churn: N files
```

---

### Task 9: Self-Consistency Check

**Files:**
- Create: `results/09-consistency-check.md`

**Input:**
- `results/03-high-tier.md`
- `results/04-medium-tier.md`
- `results/05-low-tier.md`
- `results/07-patterns.md`
- Shared Context Block

**What the subagent does:** Check all per-file verdicts for internal contradictions before the final report is written.

- [ ] **Step 1: Check for contradictory criteria within files**

Read all per-file assessments. Flag any file where:
- ✅ Correct on imports but ❌ Wrong/Missing on half-migration for the same component
- ✅ Correct on API alignment but ❌ on structural/JSX correctness
- Any other logically contradictory pair of verdicts

- [ ] **Step 2: Check per-file verdicts against likely overall recommendation**

If any file has a HIGH risk verdict, but the majority of files are positive, note the tension. The final report must not say the branch is adoptable while individual files have unresolved HIGH risk findings.

- [ ] **Step 3: Check Developer Utility Verdicts for consistency**

Are the per-file "saves time / costs time / roughly equivalent" verdicts consistent with each other and with the pattern analysis? Flag any outliers that need reconciliation.

- [ ] **Step 4: Write results to results/09-consistency-check.md**

```markdown
# Self-Consistency Check

## Contradictory Criteria Found
[list each contradiction with file path and the two conflicting verdicts,
or "None found"]

## Risk vs. Recommendation Tensions
[describe any tension between individual HIGH risk findings and the
overall direction of the analysis, or "None — findings are internally
consistent"]

## Developer Utility Verdict Outliers
[list any verdicts that seem inconsistent with the pattern analysis,
or "None — verdicts are consistent"]

## Resolutions
[for each issue found above, state the resolution: which verdict to
adjust and why]

## Status
[CLEAN — no contradictions found / RESOLVED — contradictions found and
fixed above / UNRESOLVED — contradictions that need human judgment]
```

---

### Task 10: Final Report

**Files:**
- Create: `results/10-final-report.md`

**Input:**
- ALL prior results files (01-09)
- Shared Context Block (for reference, but tone shifts per section — see below)

**What the subagent does:** Synthesize everything into the three-part final report.

- [ ] **Step 1: Read all prior outputs**

The controller pastes or summarizes all results files 01-09.

- [ ] **Step 2: Write Part 1 — Stakeholder Brief**

Tone: explaining the situation to your engineering director. No PF6 jargon, no component names.

```markdown
## Part 1: Stakeholder Brief

[One paragraph covering:
  - What was tested (one sentence)
  - What the result means (one sentence)
  - Clear recommendation: adopt as starting point / adopt with caveats /
    do not adopt
  - One metric that captures the story]
```

- [ ] **Step 3: Write Part 2 — Developer Punch List**

Tone: handing off work to a colleague. Actionable, specific, no editorializing.

Consolidate all REQUIRED FIX items and HIGH/MEDIUM risk findings from the per-file analyses into a single ordered table:

```markdown
## Part 2: Developer Punch List

| Priority | File | What to Fix | Why | Effort |
|----------|------|-------------|-----|--------|
| 1 | path/to/dropdown.tsx | Full PF6 Dropdown restructure | Half-migrated: PF6 imports with PF5 JSX | ~1 hour |
| 2 | ... | ... | ... | ... |
```

- [ ] **Step 4: Write Part 3 — Technical Assessment**

Tone: writing an internal memo evaluating a vendor tool. Balanced, evidence-based.

```markdown
## Part 3: Technical Assessment

### Executive Summary
[Full paragraph. Lead with most important finding. Do not bury conclusion.]

### Coverage and Quality Metrics
- File coverage: X of Y files from golden-source touched by semver-migrated
- Pattern coverage: X of Y distinct migration pattern types handled correctly
- Line coverage: ~X% of golden-source line changes reproduced correctly

### Aggregate Findings

**Where semver-migrated is helping:**
[from pattern analysis — specific files/patterns with clear value]

**Where semver-migrated is hurting:**
[files/patterns where automation introduced risk or noise]

**Where semver-migrated is neutral:**
[correct direction but insufficient to reduce effort]

**Coverage gaps (GOLDEN-ONLY files):**
[from results/06 — what was missed and impact]

**Automation noise (AUTO-ONLY files):**
[from results/06 — legitimate catches vs. spurious]

**Half-migrations detected:**
[list files where PF5 and PF6 are mixed — highest priority cleanup]

### Appendix: Automation Tool Assessment

1. **Effective ceiling:** [mechanical reliable? semantic partial? both unreliable?]

2. **Developer time savings:**
   a) Mechanical-only files: [saves time? how much?]
   b) High-complexity rewrites: [saves or costs time?]
   c) Test files: [if applicable]

3. **Top 3 failure modes:** [specific, not generic]

4. **Highest-risk items:** [ordered by file, by risk]

5. **What would make this genuinely useful?** [specific gap to close]
```

- [ ] **Step 5: Write the complete report to results/10-final-report.md**

Combine Parts 1, 2, and 3 into a single document with a title header:

```markdown
# PF5→PF6 Automated Migration Evaluation Report

**golden-source:** quipucords/quipucords-ui#664 (human-authored)
**semver-migrated:** jwmatthews/quipucords-ui#5 (automated)
**Evaluation date:** [today's date]

---

[Part 1]

---

[Part 2]

---

[Part 3]
```

---

## Controller Notes

### Dispatching Tasks 3-6 in Parallel

After Task 2 completes, the controller should:

1. Read `results/02-inventory.md`
2. Extract the file lists for each tier
3. Dispatch Tasks 3, 4, 5, and 6 simultaneously, each with:
   - The Shared Context Block
   - Their specific file list from the inventory
   - Instructions to read diff hunks from `results/diffs/`
4. Wait for all four to complete before dispatching Task 7

### Context Budget

Each subagent should focus only on its assigned files. The whole point of this pipeline is to prevent context exhaustion by not asking a single agent to hold all files simultaneously.

If a subagent reports that a diff is too large to analyze fully, it should:
- State which sections it analyzed and which it skipped
- Distinguish verified-by-reading from inferred-from-context
- Never reconstruct code from memory

### Output Aggregation for Tasks 7-10

Tasks 7-10 consume prior outputs. The controller should:
- Read the relevant result files
- Paste their content into the subagent prompt
- If the combined content is too large, summarize the per-file verdicts into a structured table and provide the full text only for HIGH-risk files

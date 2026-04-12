# Prompt Improvements Design: quipuchords/v1/prompt.md

## Context

`prompt.md` is a structured evaluation prompt that drives Claude (via Claude Code with shell access) to compare a human-authored PatternFly 5-to-6 migration PR against an automated one. The prompt has not been run yet.

**PRs under comparison:**
- Golden-source: quipucords/quipucords-ui#664 (human-authored)
- Semver-migrated: jwmatthews/quipucords-ui#5 (automated)

**Scale:** 30+ files, thousands of lines of diff across both PRs.

**Audience:** Mixed — the developer who will fix the branch, the prompt author evaluating the automation tool, and stakeholders deciding whether to invest in the tooling.

**Primary goal:** Reliability — consistent, evidence-based output that doesn't hallucinate or degrade as context fills up.

## Problem Statement

The current prompt has four structural risks that threaten output reliability:

1. **Context exhaustion.** Deep 8-criterion analysis of every overlapping file will degrade quality on later files as the model runs out of context headroom.
2. **Monolithic execution.** No checkpoints — the model is expected to hold orientation, PF6 reference knowledge, two full PR diffs, per-file analysis, cross-file patterns, and a final report in one continuous pass.
3. **No self-verification.** The prompt asks for assessments but never forces the model to cite evidence or check its own claims.
4. **Audience mismatch.** The output format serves a senior PF6 developer but not the stakeholders who also need to read it.

## Design

### Approach: Single Prompt with Staged Self-Review

Keep a single prompt (no multi-prompt pipeline, no orchestration) but restructure it into three stages with explicit checkpoints and verification steps. Tiered depth based on file priority prevents context exhaustion. Self-verification instructions force evidence-based claims.

### Structural Overview

```
PREAMBLE (role, mandate, audience definitions)
PF6 MIGRATION REFERENCE (existing, with usage instructions added)
STAGE 1 — GROUND TRUTH (Phases 0-2: orientation, gate check, inventory)
  -> CHECKPOINT: output inventory before proceeding
STAGE 2 — ANALYSIS (Phase 3: tiered per-file analysis)
  -> HIGH priority: full analysis with evidence requirement
  -> MEDIUM priority: focused 5-criteria analysis
  -> LOW priority: representative file + pattern matching
  -> MINI-CHECKPOINT after each tier
STAGE 3 — SYNTHESIS & VERIFICATION (Phases 4-6: patterns, noise, report)
  -> Self-consistency check before writing final report
  -> Three-part output: stakeholder brief, developer punch list, technical assessment
OPERATING INSTRUCTIONS (confidence, scope, verification, tone)
```

---

### Change 1: PF6 Migration Reference — Usage Instructions

**What stays:** All existing content (high/medium/low complexity breakdowns, mechanical vs. semantic classification).

**What's added** at the top of the reference section:

> Refer back to this section when assessing each file. Do not rely on your training knowledge of PF6 — use only the patterns listed here to judge correctness. If a migration pattern is not listed here, flag it as "unverified pattern" rather than guessing.

> If you encounter a PF6 pattern you are unsure about, say so explicitly. Do not infer correctness from import path plausibility alone.

**Why:** Anchors the model to the provided reference rather than training data, reducing hallucination risk for PF6-specific judgments.

---

### Change 2: Stage 1 Checkpoint

**Current behavior:** Phases 0-2 flow directly into Phase 3 with no pause.

**New behavior:** After building the file inventory table and priority triage, the prompt instructs:

> Stop and output your file inventory table and priority triage. Do not begin per-file analysis until you have committed to this inventory.

**Why:** Forces the model to commit to a structured plan before spending context on analysis. Makes the inventory auditable — if the triage is wrong, it's visible early.

---

### Change 3: Tiered Per-File Analysis

**Current behavior:** All OVERLAP files get the same 8-criterion deep analysis template.

**New behavior — three tiers:**

#### HIGH priority files (high-complexity components: Dropdown, Select, Wizard, etc.)

Keep all 8 criteria. Add an evidence requirement after each file:

> For any criterion you marked Correct, quote the specific diff hunk or fetched source line(s) from semver-migrated that confirm correctness. If you cannot quote evidence, downgrade to Partial.

#### MEDIUM priority files (moderate-complexity changes)

Reduce to 5 criteria:
1. Import correctness
2. Component API alignment
3. Half-migration risk
4. Correctness risk
5. Completeness vs. golden-source

CSS tokens, TypeScript types, and structural/JSX correctness are folded into correctness risk rather than analyzed separately.

#### LOW priority files (mechanical changes only)

Analyze 1-2 representative files with the MEDIUM template. Then:

> List remaining LOW priority files. For each, state whether it follows the same pattern as the representative file or diverges. If it diverges, promote it to MEDIUM and analyze.

#### Mini-checkpoints between tiers

After completing each tier:

> Re-read your assessments for this tier. For any Correct verdict, confirm you cited evidence. For any HIGH risk finding, confirm you described the specific fix.

**Why:** Prevents context exhaustion by spending depth budget where it matters most. The representative-file approach for LOW priority files avoids repetitive analysis of mechanical changes.

---

### Change 4: Developer Utility Verdict Rework

**Current:** Three-level scale (Helpful / Neutral / Harmful) with 1-2 sentence justification. Tends toward "Neutral" as a safe middle ground.

**New:**

> If a developer started from semver-migrated's version of this file instead of the PF5 original, estimate the net time impact: saves time, costs time, or roughly equivalent. Be specific about what they'd still need to do.

**Why:** More concrete and actionable. Forces specificity about remaining work rather than an abstract quality label.

---

### Change 5: Three-Part Final Report

**Current:** Executive summary (3-5 sentences) + aggregate findings + automation capability assessment, all in one block.

**New — three distinct sections:**

#### Part 1: Stakeholder Brief (new, placed first)

- No PF6 jargon, no component names
- 1 paragraph: what was tested, what the result means
- Clear recommendation: adopt as starting point / adopt with caveats / do not adopt
- One metric that captures the story (e.g., "correctly handled 70% of simple changes but 0% of complex structural rewrites")

#### Part 2: Developer Punch List (new)

Ordered table, highest risk first:

| Priority | File | What to Fix | Why | Effort |
|---|---|---|---|---|
| 1 | path/to/file.tsx | Dropdown needs full PF6 restructure | Half-migrated: PF6 imports with PF5 JSX | ~1 hour |

Effort as rough t-shirt sizing (minutes/hours). Replaces the scattered "REQUIRED FIX" blocks currently buried inside per-file analysis.

#### Part 3: Technical Assessment (existing, restructured)

- Executive summary (expanded to a full paragraph, not just 3-5 sentences)
- Coverage metrics (file, pattern, line — unchanged)
- Aggregate findings (unchanged)
- Automation capability assessment — moved to the end as "Appendix: Automation Tool Assessment" to separate code evaluation from tool evaluation

**Why:** Each audience gets a section designed for them. Stakeholders read Part 1. Developers work from Part 2. Tool evaluators read Part 3 + appendix. No one has to wade through content not meant for them.

---

### Change 6: Self-Consistency Check Before Synthesis

**New instruction before writing the final report:**

> Re-read all per-file verdicts. Check: does any file have contradictory criteria (e.g., Correct on imports but Wrong/Missing on half-migration for the same component)? If any per-file verdict was HIGH risk but your summary says the branch is adoptable, reconcile the contradiction before proceeding.

**Why:** Catches the most common failure mode of long-form LLM analysis — conclusions that don't match the evidence presented earlier in the same output.

---

### Change 7: Anti-Hallucination Guardrails

**New instructions added to Operating Instructions:**

- "If you cannot fetch a file or diff, say so. Do not reconstruct code from memory."
- "If a diff is too large to hold in context, analyze it in sections. State which sections you analyzed and which you skipped."
- "Distinguish between 'I verified this by reading the code' and 'I infer this from the diff context.' Label inferences."

**Why:** Large diffs may exceed what the model can hold. These instructions make partial coverage explicit rather than silently degraded.

---

### Change 8: Tone Calibration by Section

**Current:** "Senior PF6 developer reviewing a branch."

**New:**

- Per-file analysis: senior developer reviewing code
- Stakeholder brief: explaining the situation to your engineering director
- Punch list: handing off work to a colleague
- Tool assessment: writing an internal memo evaluating a vendor tool

**Why:** Tone shapes vocabulary and assumed reader knowledge. Different sections need different registers.

---

## What Stays Unchanged

- **Phase 0 (Orientation):** PR definitions, base branch explanation — all fine.
- **Phase 1 (Gate Check):** Package.json version verification — clear, useful, stays.
- **Phase 2 (Inventory):** File inventory table format, status values, priority triage logic — all solid.
- **Phase 4 (Cross-File Patterns):** Pattern aggregation, consistency analysis — stays as-is.
- **Phase 5 (Noise Quantification):** Signal-to-noise ratio, 20% threshold — stays.
- **PF6 reference content:** All component-specific migration details — stays.
- **Operating Instructions:** Confidence marking, scope discipline, test file handling — stays (with additions listed above).
- **GOLDEN-ONLY and AUTO-ONLY file templates** — stay as-is.

## Risks

- **Prompt length increases.** The verification scaffolding and three-part output add ~20-30% to prompt length. This is acceptable because the added tokens are instructions, not content — they improve output quality per output token spent.
- **Checkpoint instructions may be ignored.** Models sometimes skip "stop and output X" instructions. Mitigation: make the checkpoint output the *input* to the next stage ("Use the inventory above to guide your analysis") so skipping it would make the next section incoherent.
- **Tiered depth may miss issues in LOW files.** A file classified as LOW might contain a subtle semantic change. Mitigation: the "promote to MEDIUM if it diverges from the representative" instruction catches this.

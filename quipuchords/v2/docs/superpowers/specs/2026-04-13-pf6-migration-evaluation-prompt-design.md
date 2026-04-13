# PF6 Migration Evaluation Prompt — Design Spec

## Purpose

Design an improved evaluation prompt (`improved_prompt.md`) that instructs an AI agent to assess the effectiveness of the `frontend_analyzer_provider` automated PF5-to-PF6 migration tool, using a follow-up fix PR as the primary answer key.

## Audience

A senior frontend engineer deciding:
1. How effective was the automated migration?
2. What gaps need to be addressed to improve the automation?

## Data Sources

| Label | PR | Description |
|-------|-----|-------------|
| Automation output | `jwmatthews/quipucords-ui#5` | Raw output from `frontend_analyzer_provider` |
| Answer key | `jwmatthews/quipucords-ui#6` | Manual fixes applied after automation — represents gaps the tool failed to handle |
| Developer reference | `quipucords/quipucords-ui#664` | An experienced developer's independent PF6 migration. Secondary reference, not ground truth. Reflects one knowledgeable developer's choices. |
| Pre-migration base | Tag `v2.1.0` from `quipucords/quipucords-ui` | Starting point before any migration work |

## Noise Filter

The agent skips the following throughout all analysis phases:
- `.snap` files (test snapshots)
- Lockfiles (`package-lock.json`, `yarn.lock`)
- Auto-generated type declarations
- Other mechanical/generated artifacts that don't reflect migration decisions

## Execution Model

The prompt is handed to an AI agent (e.g., Claude) that:
- Fetches PR diffs from GitHub
- Analyzes the diffs across two passes
- Produces three output files

No pre-fetched data is provided. The prompt must instruct the agent on how to fetch, compare, and reason about the data.

## Approach: Answer-Key-First + Targeted Quality Sweep

Two-pass analysis structure.

### Phase 1 — Gap Analysis (Answer-Key-First)

Driven by PR/6 (the answer key). For each meaningful change in PR/6 (excluding noise), the agent classifies the gap:

| Classification | Meaning |
|---------------|---------|
| **MISS** | Automation didn't touch this file/area. PR/6 made the change from scratch. |
| **BREAKAGE** | Automation made a change in PR/5 that introduced a problem. PR/6 had to undo or repair it. |
| **INCOMPLETE** | Automation partially addressed the migration but didn't go far enough. PR/6 finished the job. |

For each gap, the agent records:
- File path and relevant line(s)
- What PR/6 changed and why it was necessary
- What PR/5 did (or didn't do) in that location
- The classification

This phase is mechanical — driven entirely by PR/6's diff. No quality judgments.

### Phase 2 — Quality Sweep (Targeted Second Pass)

Covers files changed in PR/5 that PR/6 did *not* touch — meaning the automation's changes compile and pass tests but haven't been quality-assessed.

Cross-references PR/664 to flag:
- **Non-idiomatic migrations** — works but doesn't follow recommended PF6 patterns (e.g., using deprecated shims when a clean path exists)
- **Divergent approach** — meaningfully different strategy than the experienced developer chose. Not necessarily wrong, but worth the engineer's attention.
- **Fragile constructs** — code that works now but may break in future PF minor releases

Files where PR/5 and PR/664 align get a brief "matches reference" note. Only meaningful divergences get written up.

**Framing:** PR/664 is one developer's interpretation. Divergence is "worth reviewing," not "wrong."

### Phase 3 — Synthesis & Output

Produces three files:

#### File 1: `summary.md` — Effectiveness Scorecard

- Coverage stats: counts and percentages by classification (MISS / BREAKAGE / INCOMPLETE)
- Risk summary: broke vs. missed distinction
- Quality sweep results: files that passed vs. flagged
- Overall verdict: honest, direct assessment of net engineering value

#### File 2: `gap-analysis.md` — Detailed Findings

- Phase 1 findings ordered by severity: BREAKAGE first, then INCOMPLETE, then MISS
- Phase 2 quality findings in a separate section
- Each finding includes: file path, specific code, what automation did/didn't do, what the right approach is (from PR/6 or PR/664), and why it matters
- Code snippets as evidence

#### File 3: `punch-list.md` — Actionable Items

Each item includes:
- File path
- What's wrong
- The specific broken/missing code
- What the fix should look like (referencing PR/6's actual fix and PR/664 where relevant)
- Effort estimate: trivial / moderate / significant

Organization:
- Grouped by pattern type where multiple files share the same gap
- Ordered by effort: significant items first for planning purposes

## Agent Role & Tone

- Honest, skeptical evaluator
- No softening findings or inflating scores
- Targeted at a senior engineer — assume PF6 knowledge, don't over-explain framework concepts
- Evidence-based: every claim backed by specific code references

## What This Spec Does NOT Cover

- How to run the prompt (pipeline orchestration, subagent execution)
- Improvements to `frontend_analyzer_provider` itself
- Migration of additional codebases

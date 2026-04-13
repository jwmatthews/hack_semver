You are evaluating the effectiveness of `frontend_analyzer_provider`, an automated PF5-to-PF6
migration tool, on the quipucords-ui codebase. Your audience is a senior frontend engineer who
needs an honest assessment of what the automation accomplished, what it missed, and what it
broke. This report will be used to decide whether the automation saved meaningful engineering
time and to identify gaps the tool should address. Do not soften negative findings.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATA SOURCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Three GitHub PRs, same base codebase:

  PR/5 (automation output):
    https://github.com/jwmatthews/quipucords-ui/pull/5
    Raw output from `frontend_analyzer_provider`. This is what you are evaluating.

  PR/6 (answer key):
    https://github.com/jwmatthews/quipucords-ui/pull/6
    Manual fixes applied AFTER the automation ran. Every meaningful code change
    in this PR represents a gap the automation failed to handle. This is your
    primary evidence source.

  PR/664 (developer reference — secondary):
    https://github.com/quipucords/quipucords-ui/pull/664
    An experienced developer's independent PF6 migration of the same codebase.
    Use this as a quality reference when assessing whether the automation's
    approach was idiomatic, not as ground truth. This reflects one knowledgeable
    developer's choices — divergence is "worth reviewing," not "wrong."

  Pre-migration baseline (if needed):
    Tag v2.1.0 from https://github.com/quipucords/quipucords-ui

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPERATING RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Noise filter — skip these files throughout all phases:
  - *.snap files (test snapshots)
  - package-lock.json, yarn.lock (lockfiles)
  - Auto-generated files that don't reflect migration decisions
  - Documentation files added in PR/6 (PF6_AUTOMATION_GAP_ANALYSIS.md,
    PF6_MIGRATION_LOG.md, after_initial_migration_build_failures.txt) —
    these are meta-documentation, not code gaps

Anti-hallucination guardrails:
  - Do not rely on your training knowledge of PatternFly 6. Base all
    assessments on what you observe in the PR diffs.
  - If you cannot fetch a file or diff, say so. Do not reconstruct code
    from memory.
  - Distinguish between "I verified this by reading the diff" and "I infer
    this from context." Label inferences as [INFERRED].
  - If a diff is too large to hold in context, analyze it in sections.
    State which sections you analyzed and which you skipped.
  - If you encounter a pattern you are unsure about, flag it as
    [UNVERIFIED PATTERN] rather than guessing.

Evidence requirement:
  - Every finding must cite a specific file path and describe the concrete
    code change. If you cannot point to specific code, do not include the
    finding.

Confidence labels:
  - Mark each finding with [HIGH CONFIDENCE], [MEDIUM CONFIDENCE], or
    [LOW CONFIDENCE — reason].

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — GAP ANALYSIS (Answer-Key-First)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fetch PR/6's diff. For each changed file (excluding noise), determine what
the fix addresses and classify it against PR/5.

─ ─ ─ Step 1.1: Build the gap inventory ─ ─ ─

For each meaningful code change in PR/6, record:

  File:            <path>
  Classification:  MISS | BREAKAGE | INCOMPLETE
  What PR/6 fixed: <what the manual fix did>
  What PR/5 did:   <what the automation did or didn't do in this location>
  Why it matters:  <build failure, runtime error, incorrect behavior, etc.>

Classifications:

  MISS        — The automation did not touch this file or area at all.
                PR/6 made the change from scratch.
                Example: Modal files the automation never migrated.

  BREAKAGE    — The automation made a change in PR/5 that introduced a
                problem (build error, wrong API, broken behavior). PR/6
                had to undo or repair it.
                Example: Automation renamed a prop name but left old
                prop values, causing a type error.

  INCOMPLETE  — The automation partially addressed the migration in PR/5
                but didn't go far enough. PR/6 had to finish the job.
                Example: Automation renamed ToolbarFilter props but left
                the deprecated Select component untouched in the same file.

─ ─ ─ Step 1.2: Fetch PR/5 for cross-reference ─ ─ ─

For each file in the gap inventory that also appears in PR/5 (overlap files),
fetch PR/5's diff for that file. Document specifically what the automation
did vs. what was still needed.

For files in PR/6 that do NOT appear in PR/5 (net-new gaps), note that the
automation missed the file entirely.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 CHECKPOINT — STOP AND OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before proceeding to Phase 2, output the complete gap inventory as a table.
Review it for completeness: does every non-noise file in PR/6 appear? If
not, investigate and add the missing entries.

Commit to this inventory before continuing. You will use it as the
foundation for all subsequent analysis.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — QUALITY SWEEP (Targeted Second Pass)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Identify files changed in PR/5 that PR/6 did NOT touch. These are files
where the automation's changes compile and pass tests — but we haven't
assessed quality.

For each of these files, fetch the corresponding change from PR/664
(if the file was also changed in PR/664).

─ ─ ─ Step 2.1: Compare automation vs. developer reference ─ ─ ─

For each file, assess:

  MATCHES REFERENCE — The automation's approach aligns with PR/664.
                      Note briefly and move on.

  NON-IDIOMATIC    — The automation's code works but doesn't follow
                      recommended PF6 patterns. Example: using a deprecated
                      compatibility shim when a clean migration path exists.

  DIVERGENT        — The automation chose a meaningfully different strategy
                      than the developer. Not necessarily wrong, but worth
                      the engineer's review.

  FRAGILE          — The code works now but relies on patterns likely to
                      break in future PF minor releases.

  NO REFERENCE     — PR/664 did not change this file. Note as unverifiable
                      against the developer reference.

Important framing: PR/664 is one developer's interpretation, not canonical.
Flag divergences as "worth reviewing" and explain the difference. Do not
declare the automation "wrong" solely because it differs from PR/664.

─ ─ ─ Step 2.2: Files only in PR/5 ─ ─ ─

For files changed in PR/5 that appear in neither PR/6 nor PR/664, note them
briefly. These are automation-only changes with no reference point — flag
for manual review without making quality judgments.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELF-CONSISTENCY CHECK — Before writing output files
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before writing the three output files, review your own analysis:

  1. Do the gap classifications make sense? If a file is marked MISS but
     PR/5 actually touched it, reclassify as INCOMPLETE or BREAKAGE.

  2. Are the BREAKAGE findings genuinely caused by the automation, or were
     they pre-existing issues? Only attribute problems to the automation
     if PR/5 introduced or worsened them.

  3. Does the overall picture from the gap inventory align with the verdict
     you're about to write? If the per-file analysis says "the automation
     broke several things" but you're tempted to write a positive summary,
     reconcile the contradiction.

  4. Check for pattern consistency: if the automation failed to migrate
     Modal in file A, did you check all other Modal files? If it succeeded
     in one Modal file but failed in others, note the inconsistency.

Fix any issues before proceeding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — SYNTHESIS AND OUTPUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Produce three files. Write for a senior frontend engineer who knows PF6 —
do not over-explain framework concepts.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FILE 1: summary.md — Effectiveness Scorecard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tone: Direct and honest. Write as if briefing your engineering lead.

Contents:

  1. Coverage statistics
     - Total gaps found in PR/6 (excluding noise)
     - Breakdown by classification: MISS / BREAKAGE / INCOMPLETE
       (counts and percentages)

  2. Risk summary
     - How many changes the automation BROKE vs. simply MISSED
     - Highlight the distinction: "didn't help" is different from
       "made things worse"

  3. Quality sweep results
     - How many PR/5-only files matched the developer reference
     - How many were flagged (non-idiomatic, divergent, fragile)

  4. Pattern-level effectiveness
     - For each major migration pattern (Modal, EmptyState, Select,
       CSS tokens, prop renames, etc.), one line: how many instances
       existed, how many the automation handled correctly

  5. Overall verdict
     - 3-5 sentences. Did the automation save meaningful engineering
       time, or did the cleanup cost offset the gains?
     - Be specific about what it's good at and where it falls short

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FILE 2: gap-analysis.md — Detailed Findings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tone: Technical and evidence-based. Write for a developer reading the code.

Organization — present findings in this order:

  Section A: BREAKAGE findings (highest severity)
  Section B: INCOMPLETE findings
  Section C: MISS findings
  Section D: Quality sweep findings (from Phase 2)

For each finding, use this template:

  ─ ─ ─ `<file path>` [CLASSIFICATION] [CONFIDENCE] ─ ─ ─

  What the automation did:
    <specific description of PR/5's change, or "did not touch this file">

  What was actually needed:
    <specific description of PR/6's fix>

  Code evidence:
    <relevant code snippets from the diffs — show both what PR/5 produced
     and what PR/6 corrected it to>

  Developer reference (if available):
    <how PR/664 handled this, if applicable>

  Impact:
    <build failure / type error / runtime regression / non-idiomatic / etc.>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FILE 3: punch-list.md — Actionable Items
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tone: Actionable and concise. Write as a work plan the engineer can
execute directly.

Organization:
  - Group items by pattern type where multiple files share the same gap
    (e.g., "Modal title/actions migration" covering 8 files)
  - Within each group, list affected files
  - Order groups by effort: significant items first for planning

For each item or group:

  Pattern:     <name of the migration pattern>
  Files:       <list of affected file paths>
  What's wrong:
    <concise description of the gap>
  What the fix looks like:
    <specific description of the required change, referencing PR/6's
     actual fix and PR/664's approach where relevant>
  Code example:
    <before/after code snippet from one representative file>
  Effort:      trivial | moderate | significant
    - trivial:      mechanical find-and-replace, < 5 minutes per file
    - moderate:     requires understanding the component API, 15-30 min
    - significant:  structural rewrite, > 30 min per file

End the punch list with a summary table:

  | Pattern | Files | Classification | Effort | Total Est. |
  |---------|-------|----------------|--------|------------|

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTION NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  - Fetch PR diffs using the GitHub API or `gh pr diff`.
  - Start with PR/6 (the answer key). This is the primary data source.
  - Only fetch PR/5 and PR/664 as needed for cross-referencing.
  - If a PR diff is too large, fetch file-by-file using the GitHub API.
  - Write each output file completely before starting the next.
  - If you discover a gap category not covered by MISS / BREAKAGE /
    INCOMPLETE, document it and explain why it doesn't fit.

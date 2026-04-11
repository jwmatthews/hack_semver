You are performing a rigorous technical evaluation of an automated PatternFly 5-to-6 (PF5→PF6)
UI migration against a human-authored reference migration on the same codebase. Your mandate is
honest, skeptical assessment. Do not soften negative findings. A developer will use this report
to decide whether to adopt the automated output — false positives waste their time.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 0 — ORIENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Two PRs, same base codebase:

  golden-source:   https://github.com/quipucords/quipucords-ui/pull/664
                   Authored by a developer with PF6 knowledge.
                   May contain a small number of non-PF6 changes — note them
                   when found, but do not penalize the comparison for them.

  semver-migrated: https://github.com/jwmatthews/quipucords-ui/pull/5
                   Produced by automated migration tooling. This is what you
                   are evaluating.

The base branch of jwmatthews/quipucords-ui represents the pre-migration PF5 source
of truth. You will need it to understand original component intent.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATTERNFLY 6 MIGRATION REFERENCE — READ THIS BEFORE ANALYZING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Refer back to this section when assessing each file. Do not rely on your training knowledge of PF6 — use only the patterns listed here to judge correctness. If a migration pattern is not listed here, flag it as "unverified pattern" rather than guessing.

If you encounter a PF6 pattern you are unsure about, say so explicitly. Do not infer correctness from import path plausibility alone.

Use this as your evaluation baseline. A migration is only correct if it
aligns with these known PF6 breaking changes.

HIGH-COMPLEXITY COMPONENT REWRITES (automation most likely to fail here):
  - Dropdown: complete structural rewrite. PF5 Dropdown is replaced by a
    composition of MenuToggle + DropdownList + DropdownItem. Simply updating
    the import is wrong — the entire JSX tree must be restructured.
  - Select: total API rewrite. PF5 SelectOption/SelectVariant patterns are
    replaced with a new Select + SelectList + SelectOption composition model.
  - Wizard: restructured with new step API.
  - ContextSelector: removed; replaced with Select-based patterns.
  - ApplicationLauncher: removed entirely, no direct equivalent.
  - DataToolbar: renamed to Toolbar with restructured child components.

MODERATE-COMPLEXITY CHANGES:
  - Page/Masthead: restructured. MastheadBrand, MastheadMain, MastheadContent
    composition changed.
  - Nav/NavItem: minor but important prop changes.
  - Alert/AlertGroup: ActionGroup behavior changed.
  - Button: `isPlain` prop removed; use `variant="plain"` instead.
  - Spinner: `isSVG` prop removed (SVG is now default).
  - Label: `isTruncated` replaced with `textMaxWidth` prop.
  - Tooltip: `entryDelay`/`exitDelay` renamed to `triggerDelay`/`exitDelay`.

LOW-COMPLEXITY / MECHANICAL CHANGES (automation should get these right):
  - Import paths: `@patternfly/react-core` and `@patternfly/react-table` paths
    changed for several components due to package reorganization.
  - CSS custom properties: ALL tokens renamed from `--pf-v5-*` to `--pf-v6-*`.
    Any PF5 token reference remaining is a bug.
  - Icon imports: moved from `@patternfly/react-icons` subpath imports to
    direct named exports; some icon names changed.
  - Table: `IRow`, `ICell` interfaces deprecated in favor of `Td`, `Tr` typed
    components.

CLASSIFICATION YOU MUST APPLY:
  Mechanical change: import path update, CSS token rename, prop rename with
    no structural change required. A codemod could do this.
  Semantic change: component restructure, composition pattern change, removal
    of a component requiring a workaround, type signature change requiring
    developer judgment. Requires actual understanding of PF6.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — GATE CHECK (run this first, stop if it fails)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before any code analysis, verify the foundation:

1. Does semver-migrated update package.json to PF6 package versions?
   Specifically: @patternfly/react-core, @patternfly/react-icons,
   @patternfly/react-table should all be on v6.x.
   If this gate fails, note it prominently and continue anyway — some
   findings will still be valid, but the migration cannot be functional
   as-is without this.

2. Is there a package-lock.json or yarn.lock change consistent with
   the version bump? Note if missing.

Report the gate result in one paragraph before proceeding.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — FETCH AND INVENTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Retrieve both PR diffs. Preferred method:
  gh pr diff 664 --repo quipucords/quipucords-ui
  gh pr diff 5   --repo jwmatthews/quipucords-ui

If gh CLI is unavailable, fall back to the GitHub REST API:
  GET /repos/{owner}/{repo}/pulls/{pull_number}/files
for the file list and patch data. For files where you need the pre-migration
source, fetch the base branch version:
  GET /repos/jwmatthews/quipucords-ui/contents/{path}?ref={base_branch}

Build a file inventory table:

  File | In golden-source | In semver-migrated | Status

  Status values:
    OVERLAP         — both PRs touched this file
    GOLDEN-ONLY     — coverage gap in semver-migrated
    AUTO-ONLY       — semver-migrated touched this, golden-source did not
                      (investigate: valid extra migration or spurious noise?)

After the table, triage the OVERLAP files into priority order:
  HIGH PRIORITY: files containing high-complexity components (Dropdown,
    Select, Wizard, ApplicationLauncher, ContextSelector)
  MEDIUM PRIORITY: files with moderate-complexity changes
  LOW PRIORITY: files where only mechanical changes are expected

You will analyze HIGH PRIORITY files first and in full. For MEDIUM and LOW
PRIORITY files, use your judgment — if patterns become repetitive, note the
pattern and summarize rather than repeating full analysis.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — PER-FILE DEEP ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each file, retrieve the pre-migration PF5 source from the base branch
whenever the two PRs diverge significantly, or when you need original intent
to judge whether a migration was semantically correct.

For each OVERLAP file, produce this block:

─────────────────────────────────────────────
`path/to/file.tsx`  [HIGH/MEDIUM/LOW PRIORITY]
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

WHAT GOLDEN-SOURCE DID:
  1-3 sentences. Focus on the semantic intent, not just mechanics.

WHAT SEMVER-MIGRATED DID:
  1-3 sentences. Be specific about what was done vs. what should have been done.

DELTA:
  The specific gap between them. If semver-migrated missed a structural
  rewrite, say exactly what the correct PF6 pattern should look like.

DEVELOPER UTILITY VERDICT:
  Choose one and justify in 1-2 sentences:
    Helpful    — a developer would save meaningful time starting from this
    Neutral    — correct direction but not enough to reduce developer effort
    Harmful    — introduces problems the developer would spend time debugging

IF RISK LEVEL IS HIGH — REQUIRED FIX:
  Tell the developer exactly what they need to do to make this file safe
  to use. Be specific: which lines, which pattern, which PF6 API.

─────────────────────────────────────────────

For GOLDEN-ONLY files:
`path/to/file.tsx`  *(not touched by semver-migrated)*
  What did golden-source change here, and how significant is this gap?
  Would the missing migration cause visible breakage or just degraded UI?

For AUTO-ONLY files:
`path/to/file.tsx`  *(not touched by golden-source)*
  Are these changes valid PF6 migration, unrelated cleanup, or noise?
  If noise: how much developer time would cleanup take?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — CROSS-FILE PATTERN ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After per-file analysis, aggregate across all files by migration pattern type.

For each distinct PF6 migration pattern that appears in 2+ files
(e.g., "Dropdown restructure", "CSS token rename", "Button isPlain removal"):

  Pattern: [name]
  Files affected: [count]
  semver-migrated success rate: X of Y files handled correctly
  Failure mode: [describe how it failed when it did]
  Consistency: did semver-migrated handle this pattern the same way across
    all files, or inconsistently?

Inconsistency in pattern handling is a significant automation quality signal —
if the same Dropdown pattern is handled correctly in 3 files and wrong in 2,
that tells you the automation is non-deterministic or sensitive to minor
syntactic variations.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5 — NOISE QUANTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Estimate the signal-to-noise ratio of semver-migrated:

  Total lines changed in semver-migrated:        [N]
  Lines that are valid PF6 migration changes:    [N] (~X%)
  Lines that are unrelated/spurious changes:     [N] (~X%)
  Lines that are incorrect/harmful changes:      [N] (~X%)

A branch with >20% noise is materially harder to adopt. Call this out
explicitly if crossed.

Also note: of the AUTO-ONLY files, how many appear to be valid migration
catches vs. unrelated churn?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 6 — FINAL REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Executive Summary
3-5 sentences. Honest overall verdict. Lead with the most important finding.
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

## Automation Capability Assessment
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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPERATING INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Confidence: When your assessment of a file is uncertain — especially where
  golden-source contains non-PF6 changes mixed in — mark your confidence:
  [HIGH CONFIDENCE], [MEDIUM CONFIDENCE], or [LOW CONFIDENCE — reason].
  Do not present uncertain assessments as definitive.

Scope discipline: The golden-source PR may contain non-PF6 changes. When you
  find them, note them, set them aside, and do not count them against
  semver-migrated for not including them. However, if non-PF6 golden-source
  changes interact with PF6 changes in a way that affects the comparison,
  call that out explicitly.

Test files: If either PR modifies test files, analyze them under a separate
  subheading within the per-file section. Test coverage of PF6 behavior is
  a real quality signal — note if semver-migrated leaves tests that would
  fail against its own output.

Tone: Calibrate your register to match each section's audience:
  - Per-file analysis: senior developer reviewing code — technical,
    precise, no hedging.
  - Stakeholder brief: explaining the situation to your engineering
    director — no jargon, no component names, clear recommendation.
  - Punch list: handing off work to a colleague — actionable,
    specific, no editorializing.
  - Tool assessment: writing an internal memo evaluating a vendor
    tool — balanced, evidence-based, honest about limitations.

Anti-hallucination: Follow these rules strictly:
  - If you cannot fetch a file or diff, say so. Do not reconstruct code
    from memory.
  - If a diff is too large to hold in context, analyze it in sections.
    State which sections you analyzed and which you skipped.
  - Distinguish between "I verified this by reading the code" and "I infer
    this from the diff context." Label inferences.

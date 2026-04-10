# Prompt: PatternFly 5-to-6 Migration Tooling Comparison

## Role

You are a senior frontend migration analyst. Your job is to produce a thorough, accurate, developer-facing comparison of two different approaches for detecting and fixing PatternFly 5 to PatternFly 6 migration issues.

## Goal

Produce two markdown deliverables:

1. **comparison_report.md** -- A narrative report covering overlap, gaps, and key takeaways.
2. **comparison_table.md** -- A dense, scannable side-by-side table that maps every concern to which tool covers it and how.

The primary audience is knowledgeable PatternFly developers who need to understand how much overlap the frontend-analyzer-provider rules-based approach has with the pf-codemods approach, and what each brings that the other does not.

## Input Sources

### Source A: pf-codemods (ESLint-based, from PatternFly maintainers)

- **Source code location:** `packages/eslint-plugin-pf-codemods/src/rules/v6/`
- **What to extract:** Every rule file. For each rule determine:
  - Rule name (from filename)
  - Target component(s) or concern area
  - What breaking change or migration it detects
  - Whether it provides an ESLint auto-fix or is warning-only

### Source B: frontend-analyzer-provider (automated semver diff analysis)

This tool has TWO capabilities -- detection AND fixing. You must analyze both.

- **Detection rules:** `../../hack_semver/example_runs/2026_04_10a/rules/breaking-changes.yaml`
  - This is a large YAML file (~22,000 lines, ~950 rules). Read it in chunks.
  - For each rule extract: `ruleID`, `labels` (especially `change-type`, `kind`, `package`), `description`, and `when` conditions.
  - Categorize rules by component/area AND by change-type.

- **Fix guidance:** `/tmp/semver-pipeline-v2/fix-guidance/fix-guidance.yaml`
  - Contains per-rule fix metadata: `strategy`, `confidence`, `fix_description`, `before`/`after`, `search_pattern`, `replacement`.
  - Summary header gives totals for auto_fixable vs manual_only.

- **Fix strategies:** `/tmp/semver-pipeline-v2/fix-guidance/fix-strategies.json`
  - Contains structured fix strategy objects keyed by ruleID.
  - Strategy types include: `CssVariablePrefix`, `ImportPathChange`, `Rename`, `RemoveProp`, `PropValueChange`, `PropTypeChange`, `LlmAssisted`, `CompositionChange`, `PropToChild`, `PropToChildren`, `ChildToProp`, `UpdateDependency`, `DeprecatedMigration`, `ConstantGroup`, `Manual`.
  - `LlmAssisted` entries may include rich context: `member_mappings`, `removed_members`, `overlap_ratio`, `replacement`.

**IMPORTANT:** Do NOT assume the frontend-analyzer-provider is detection-only. It has a full fix engine with deterministic text-replacement fixes, LLM-assisted fixes with structured context, and structured guidance for manual fixes. Characterize this accurately.

## Analysis Process

Follow these steps in order:

### Step 1: Catalog pf-codemods rules
- List every rule file in `packages/eslint-plugin-pf-codemods/src/rules/v6/`.
- Read each rule to extract: target component, what it detects, and whether it auto-fixes.
- Group by component area.
- Count totals: total rules, auto-fix rules, warning-only rules.

### Step 2: Catalog frontend-analyzer-provider detection rules
- Extract all `ruleID` and `description` pairs from breaking-changes.yaml.
- Categorize by `change-type` label (count per type).
- Categorize by package (from the ruleID path encoding or `package` label).
- Group by component area, matching the same component grouping used for pf-codemods where possible.

### Step 3: Catalog frontend-analyzer-provider fix capabilities
- From fix-guidance.yaml: extract the summary (total_fixes, auto_fixable, manual_only) and the per-rule strategy + confidence.
- From fix-strategies.json: count rules per strategy type. Categorize strategies into tiers:
  - **Deterministic:** CssVariablePrefix, ImportPathChange, Rename, RemoveProp, PropValueChange, UpdateDependency, DeprecatedMigration, ConstantGroup
  - **LLM-assisted:** LlmAssisted (note which ones have member_mappings, removed_members, overlap_ratio)
  - **Structured guidance:** PropTypeChange, CompositionChange, PropToChild, PropToChildren, ChildToProp
  - **Manual:** Manual
- Extract representative examples of each strategy type, especially LlmAssisted entries with rich metadata.

### Step 4: Cross-reference and map concerns
For each component area, map every specific concern (prop rename, prop removal, type change, etc.) to:
- Whether pf-codemods covers it (and how: ESLint fix or warning)
- Whether frontend-analyzer covers it (and how: which fix strategy)
- Coverage status: Both, pf-codemods only, or frontend-analyzer only

Pay attention to:
- **Semantic differences:** Cases where both tools cover the same concern but recommend different fixes (e.g., pf-codemods maps `isOverflowLabel` to `variant="overflow"` while frontend-analyzer maps it to `isClickable`). Flag these with a note.
- **Package gaps:** frontend-analyzer does NOT cover `@patternfly/react-component-groups`. pf-codemods does NOT cover `react-table`, `react-templates`, `react-code-editor` in depth.
- **Category gaps:** pf-codemods does NOT cover TypeScript type changes, composition/conformance, context dependencies, test impact, or CSS-level variable usage. frontend-analyzer does NOT cover behavioral/markup warnings or migration workflow utilities.

### Step 5: Write deliverables

## Output 1: comparison_report.md

Structure:

```
# PatternFly 5 to 6 Migration Detection: pf-codemods vs. frontend-analyzer-provider

## Overview
- Summary table: approach, total rules, fix capabilities, packages covered.
- Both tools can detect AND fix. Characterize each fix approach accurately.

## Fix Engine Comparison
- pf-codemods: ESLint --fix, AST-aware, single-pass structural transforms.
- frontend-analyzer: Multi-tier fix engine (deterministic / LLM-assisted / structured guidance / manual).
- Detailed strategy breakdown table with counts.
- LLM-assisted fix details (member_mappings, removed_members, overlap_ratio).
- Confidence levels from fix-guidance.yaml.

## 1. Concerns in pf-codemods but NOT in frontend-analyzer
- react-component-groups (list every rule)
- Behavioral/markup warnings (list every warning-only rule)
- Code quality/workflow utilities
- Other specific gaps

## 2. Concerns in frontend-analyzer but NOT in pf-codemods
- TypeScript type compatibility changes
- Component composition/conformance rules
- React context dependency changes
- Test impact rules
- Consumer CSS variable changes (in stylesheets, not JS)
- Package-level coverage gaps
- Other unique categories (dependency updates, required props, signatures, CSS class removals)

## 3. Areas of Strong Overlap
- Table mapping each shared concern to fix approach in both tools.

## 4. Key Takeaways
- What frontend-analyzer brings that pf-codemods cannot
- What pf-codemods provides that frontend-analyzer cannot
- How they are complementary

## Appendix A: Complete pf-codemods Rule Catalog
- Every rule, grouped by component, with description and fix status.

## Appendix B: frontend-analyzer Rule Summary by Category
- By change-type (table with counts)
- By package coverage (table with counts and key changes)

## Appendix C: Detailed frontend-analyzer Findings by Component
- Per-component bullet lists of all changes detected.
```

## Output 2: comparison_table.md

Structure:

```
# Side-by-Side Rule Comparison Table

## Legend
- Coverage markers: Both, PC (pf-codemods only), FA (frontend-analyzer only)
- Fix type abbreviations for both tools

## 1. Component-Level Comparison
- One table per component area (40+ components)
- Each row = one specific concern
- Columns: Concern | pf-codemods (fix type) | frontend-analyzer (strategy) | Coverage

## 2. Cross-Cutting Concerns
- Deprecated component removals (per-family comparison)
- CSS variables (JS vs stylesheet level)
- Package-level coverage
- Workflow/utility concerns

## 3. Coverage Summary
- Aggregate table: counts of Both/PC-only/FA-only across all concern categories
- Fix capability head-to-head: total rules, deterministic fixes, LLM fixes, fix precision, fix scope
```

## Quality Criteria

- **Accuracy over brevity.** Every claim about what a tool does or does not cover must be verified by reading the actual rule/strategy, not assumed.
- **No false symmetry.** If one tool covers something the other doesn't, say so clearly. Don't hedge with "partially" unless you can explain what's partial.
- **Specific, not vague.** Name the actual props, components, and strategy types. "Some type changes" is not acceptable; "ReactElement to ReactElement<any> across 30+ components" is.
- **Flag semantic differences.** When both tools cover the same concern but the recommended fix differs, note this explicitly.
- **Quantify everything.** Rule counts, fix strategy counts, confidence breakdowns, package coverage counts.
- **Developer-scannable.** The table deliverable should let a developer find their component in under 10 seconds and see exactly what each tool offers.

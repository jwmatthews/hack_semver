# Prompt: PatternFly 5-to-6 Migration Tooling -- Honest Skeptic's Comparison

## Role

You are a senior frontend migration analyst with a skeptic's mindset. Your audience trusts pf-codemods -- it's battle-tested, maintained by PatternFly core, and has shipped real migrations. They are evaluating whether frontend-analyzer-provider adds enough value to justify adoption, integration, or investment. Your job is to give them the truthful, unvarnished answer.

**Your default posture is skepticism toward frontend-analyzer-provider.** Do not inflate its value. Do not count rules as if they are all equal. Do not present metadata-for-an-LLM as "auto-fix." Challenge every claim with: "Does this actually help a developer migrate, or would they discover the same thing by running `tsc` or their test suite?"

That said, where FA genuinely provides value that pf-codemods cannot, say so clearly and specifically. The goal is an honest assessment that helps the team decide where to invest.

## Goal

Produce two markdown deliverables:

1. **comparison_report.md** -- An honest, critical narrative report.
2. **comparison_table.md** -- A dense, scannable side-by-side table with developer-impact ratings.

## Input Sources

### Source A: pf-codemods (ESLint-based, from PatternFly maintainers)

- **Source code location:** `packages/eslint-plugin-pf-codemods/src/rules/v6/`
- **What to extract:** Every rule file. For each rule determine:
  - Rule name (from filename)
  - Target component(s) or concern area
  - What breaking change or migration it detects
  - Whether it provides an ESLint auto-fix or is warning-only
  - **How sophisticated the fix is:** Simple prop rename? Complex JSX restructuring? Multi-component coordination?

### Source B: frontend-analyzer-provider

This tool has TWO capabilities -- detection AND fixing. Analyze both, but be honest about what "fixing" means in each tier.

- **Detection rules:** `../../hack_semver/example_runs/2026_04_10a/rules/breaking-changes.yaml`
  - This is a large YAML file (~22,000 lines, ~950 rules). Read it in chunks.
  - For each rule extract: `ruleID`, `labels` (especially `change-type`, `kind`, `package`), `description`, and `when` conditions.

- **Fix guidance:** `/tmp/semver-pipeline-v2/fix-guidance/fix-guidance.yaml`
  - Contains per-rule fix metadata: `strategy`, `confidence`, `fix_description`, `before`/`after`, `search_pattern`, `replacement`.

- **Fix strategies:** `/tmp/semver-pipeline-v2/fix-guidance/fix-strategies.json`
  - Contains structured fix strategy objects keyed by ruleID.

## Critical Analysis Requirements

These are the questions the skeptic is asking. The report MUST answer each one with evidence:

### Q1: What is the INCREMENTAL value of FA on top of pf-codemods?

A developer already runs pf-codemods. What additional migration problems does FA solve that they would NOT otherwise discover by:
- Running pf-codemods (for prop/component changes)
- Running `tsc` (for type errors)
- Running their test suite (for behavioral/DOM changes)
- Reading the PatternFly migration guide

For every FA-only category, answer: "Would the developer find this problem anyway without FA?"

### Q2: How many of FA's 950 rules represent ACTUAL breaking changes?

Categorize every FA rule into one of these developer-impact tiers:

- **Tier 1 -- Compilation breaker:** Code will not compile (removed export, renamed export, removed prop from type, type incompatibility). Developer MUST fix before app builds.
- **Tier 2 -- Runtime/behavioral break:** Code compiles but behaves differently (prop value semantics changed, component composition requirement changed, context now required, CSS variable rename causes style breakage).
- **Tier 3 -- Test breakage:** Code works but tests fail (DOM output changed, snapshot differences).
- **Tier 4 -- Informational only:** Existing code continues to work unchanged (new optional prop added, new optional signature parameter, theoretical composition best practice). Developer does NOT need to change anything.

Count rules per tier. The Tier 4 count reveals how much of FA's rule count is noise.

**Specific categories to scrutinize:**
- **signature-changed (111 rules):** How many are "new optional prop added" (Tier 4 / noise) vs. "required param changed" (Tier 1)?
- **conformance (110 rules):** Are these NEW requirements in v6, or existing best practices being codified? Would code that violated them in v5 have worked? Would it break in v6?
- **type-changed (77 rules):** How many of these would `tsc` surface as errors without FA? What does FA add beyond what `tsc` tells you?
- **test-impact (28 rules):** Does FA tell you HOW the DOM changed and how to update tests? Or does it just say "DOM changed" (which you'd discover by running tests)?

### Q3: What does "auto-fixable" actually mean?

FA claims ~646 "auto-fixable" rules. Break this down honestly:

- **Actually deterministic (text replacement):** CssVariablePrefix, ImportPathChange, Rename, RemoveProp, PropValueChange -- these produce a concrete search/replace pair. How reliable are they? Are they regex-on-source-text or AST-aware? What edge cases would they miss (e.g., aliased imports, spread props, computed property names)?
- **LLM-assisted (162 rules):** These provide structured metadata (member_mappings, overlap_ratio) that an LLM COULD use to generate a fix. But the fix engine itself does not produce the fix -- it produces CONTEXT for a future LLM call. Be honest: this is not "auto-fix" in the way a developer understands it. It is "structured migration context." Valuable? Possibly. Auto-fix? No.
- **Structured guidance (PropTypeChange, CompositionChange, etc.):** These provide machine-readable before/after descriptions. Are they applied automatically, or do they require manual interpretation?

Compare honestly: pf-codemods' 75 auto-fix rules all produce concrete AST transforms that modify source code. How many of FA's "auto-fixable" produce the same level of concrete output?

### Q4: Where does FA genuinely fill gaps that matter?

For each FA-only capability, assess:
1. Is this a real gap? (Would a developer hit this problem during migration?)
2. How many developers would be affected? (CSS variable renames affect everyone with custom CSS; react-templates changes affect a small subset.)
3. Is there a simpler way to solve it? (Could CSS variable renames be a shell script? Would `tsc` errors be sufficient for type changes?)
4. What is the quality of FA's fix for this gap?

### Q5: What is FA missing that it SHOULD have?

Identify specific, actionable gaps in FA that reduce its value:
- Package coverage gaps (react-component-groups)
- Fix quality gaps (text replacement vs AST-aware for JS files)
- Rule quality gaps (rules that fire on non-breaking changes)
- Missing behavioral/markup warnings that pf-codemods provides
- Missing complex structural transforms
- Any rules that appear to recommend WRONG fixes (semantic differences)

### Q6: Semantic differences -- where do the tools disagree?

For every concern covered by BOTH tools, spot-check whether they recommend the same fix. Flag any cases where:
- pf-codemods maps a prop to value A, but FA maps it to value B
- One tool removes a prop, the other renames it
- The tools have different guidance for deprecated component migration

These disagreements are critical -- they indicate either a bug in one tool or a difference in migration philosophy.

## Analysis Process

### Step 1: Catalog pf-codemods rules (same as before)
- List every rule file in `packages/eslint-plugin-pf-codemods/src/rules/v6/`.
- Read each rule to extract: target component, what it detects, whether it auto-fixes, and fix complexity.
- Count totals.

### Step 2: Catalog FA detection rules with impact tiers
- Extract all rules from breaking-changes.yaml.
- For EACH rule, assign a developer-impact tier (1-4) based on the change-type and description.
- Count rules per tier.
- Separately count and list all Tier 4 (informational/noise) rules.
- For signature-changed rules: read the descriptions to determine how many are "new optional prop" vs. actual signature breaks.
- For conformance rules: determine whether they represent new v6 requirements or codified existing best practices.

### Step 3: Catalog FA fix capabilities with honest assessment
- From fix-guidance.yaml: extract summary and per-rule data.
- From fix-strategies.json: categorize strategies.
- For EACH strategy type, honestly assess:
  - Does it produce a concrete, applicable code change? Or metadata/guidance?
  - What edge cases would it miss?
  - Compare its output quality to the equivalent pf-codemods fix (where overlap exists).

### Step 4: Compute incremental value
- Start with the set of all migration concerns.
- Remove everything pf-codemods already handles (with fix or warning).
- Remove everything `tsc` would catch (type errors, missing exports).
- Remove everything the test suite would catch (DOM changes).
- What remains is FA's TRUE incremental value. Quantify it.

### Step 5: Cross-reference with semantic verification
- For every "Both" concern, verify the fix is equivalent.
- Read at least 10 representative FA fix-strategies and compare them to the corresponding pf-codemods rule to verify they target the same change.
- Flag any disagreements.

### Step 6: Write deliverables

## Output 1: comparison_report.md

Structure:

```
# PatternFly 5 to 6 Migration: Honest Comparison of pf-codemods vs. frontend-analyzer-provider

## Executive Summary
- One paragraph: bottom-line verdict. Does FA add value on top of pf-codemods? How much? Where?
- Key numbers: total rules, ACTUAL breaking-change rules (Tier 1+2), auto-fix rules (genuine, not metadata), incremental value rules.

## 1. What pf-codemods Already Handles Well
- Summary of 106 rules, 75 auto-fix.
- Highlight the sophisticated transforms that FA cannot replicate (structural JSX, component replacement).
- Package coverage: react-core, react-component-groups, react-charts, react-tokens.
- This establishes the baseline. Everything below is measured against "what does FA add ON TOP of this?"

## 2. The Rule Count Problem: 950 Is Not What It Seems
- Break down FA's 950 rules by developer-impact tier.
- Show how many are Tier 4 (informational/noise).
- Explain why "950 rules" vs "106 rules" is a misleading comparison.
- Show the adjusted count: how many FA rules represent ACTUAL migration work.

## 3. The "Auto-Fixable" Problem: 646 Is Not What It Seems
- Break down what "auto-fixable" means in each strategy tier.
- Honest assessment of LLM-assisted (metadata, not auto-fix).
- Honest assessment of structured guidance (documentation, not auto-fix).
- Show the adjusted count: how many FA rules produce concrete, applicable fixes.
- Compare fix quality: AST-aware (pf-codemods) vs text-replacement (FA deterministic).
- Edge cases where text-replacement fails (aliased imports, destructured props, spread operators, dynamic values).

## 4. Where FA Genuinely Adds Value (Incremental Analysis)
For each category, answer: "Would the developer find this without FA?"

### 4.1 CSS Variable Migration in Stylesheets
- Genuine gap: pf-codemods only handles JS token imports.
- 233 rules with deterministic fixes.
- Honest assessment: Could a sed script do this? (Yes, but FA provides the mapping.)
- Verdict: GENUINE VALUE. Saves hours of manual CSS variable hunting.

### 4.2 Package Coverage: react-table, react-templates, react-drag-drop, react-code-editor
- For each package: how many rules are actual breaking changes vs informational?
- Would a developer using these packages hit these issues during compilation?
- Verdict per package.

### 4.3 TypeScript Type Changes
- How many would `tsc` catch?
- What does FA add beyond compiler errors?
- Verdict: [honest assessment].

### 4.4 Conformance / Composition Rules
- Are these new v6 requirements or existing best practices?
- Would code that violates them break at runtime?
- Verdict: [honest assessment].

### 4.5 Context Dependency Changes
- Would code break without the context provider?
- How would the error manifest?
- Verdict: [honest assessment].

### 4.6 Test Impact Rules
- Does FA tell you HOW to fix the test, or just that it will break?
- Would running the test suite give you the same information?
- Verdict: [honest assessment].

### 4.7 LLM-Assisted Migration Context for Deprecated Components
- Honest assessment: member_mappings and overlap_ratio are valuable METADATA for an LLM or human.
- But pf-codemods ALSO warns about deprecated components.
- What is the incremental value of having structured member mappings?
- Verdict: [honest assessment].

## 5. Where FA Falls Short

### 5.1 Missing Package: react-component-groups
- 12 pf-codemods rules with no FA equivalent.
- These are high-impact auto-fixes.
- Recommendation: FA should add this package.

### 5.2 Missing: Complex Structural Transforms
- List every pf-codemods fix that FA cannot replicate.
- EmptyState header restructuring, Masthead restructuring, KebabToggle replacement, Chip-to-Label, Text-to-Content, etc.
- These are the hardest parts of migration.

### 5.3 Missing: Behavioral/Markup Warnings
- pf-codemods' 31 warning-only rules alert developers to subtle changes.
- FA has test-impact rules but they are less specific.

### 5.4 Missing: Migration Workflow Utilities
- data-codemods-cleanup, no-duplicate-import-specifiers, no-unused-imports.
- Small but valuable for clean migration.

### 5.5 Fix Quality: Text Replacement vs AST
- Specific examples where FA's text replacement would produce incorrect output.
- e.g., aliased imports: `import { Button as Btn } from '@patternfly/react-core'`
- e.g., spread props: `<Component {...props} />` where a removed prop is in the spread
- e.g., dynamic values: `variant={condition ? 'light300' : 'default'}`

### 5.6 Noise / Low-Value Rules
- Count and examples of rules that fire on non-breaking changes.
- Impact on developer trust: if 30% of findings are noise, developers stop reading them.

## 6. Semantic Differences (Where Tools Disagree)
- Table of every concern where the recommended fix differs between tools.
- For each: which tool is correct? Or are both valid?

## 7. Recommendations for Making FA Maximally Useful

### 7.1 High-Priority Gaps to Close
- Specific, actionable items ranked by impact.
- Add react-component-groups support.
- Improve fix quality for JS files (AST-aware or at least import-alias-aware).
- Add developer-impact tier labels to rules so consumers can filter noise.

### 7.2 What FA Should Stop Doing (or De-Prioritize)
- Rules that add noise (informational-only, things tsc catches).
- Consider removing or down-labeling Tier 4 rules.

### 7.3 What FA Should Emphasize
- Its genuine strengths: CSS migration, package breadth, LLM context for deprecated components.
- Where it is genuinely the only tool that covers a real gap.

### 7.4 Integration Recommendations
- How should FA and pf-codemods work together in a migration workflow?
- Which should run first? Why?
- Can FA's detection feed into pf-codemods' fix engine?

## Appendix A: Complete pf-codemods Rule Catalog
- Every rule, grouped by component, with description, fix status, and fix complexity rating.

## Appendix B: FA Rules by Developer-Impact Tier
- Tier 1 (compilation breakers): full list with counts.
- Tier 2 (runtime/behavioral): full list with counts.
- Tier 3 (test breakage): full list with counts.
- Tier 4 (informational): full list with counts.

## Appendix C: FA Fix Strategy Quality Assessment
- Per strategy type: mechanism, reliability, edge cases, comparison to pf-codemods equivalent.

## Appendix D: Incremental Value Ledger
- Every FA-only concern that passes the "would the developer find this without FA?" test.
- This is the definitive list of FA's incremental value.
```

## Output 2: comparison_table.md

Structure:

```
# Side-by-Side Rule Comparison Table

## Legend
- Coverage markers: Both, PC (pf-codemods only), FA (frontend-analyzer only)
- Developer impact tiers: T1 (compilation break), T2 (runtime/behavioral), T3 (test break), T4 (informational)
- Fix quality: AST (AST-aware transform), Det (deterministic text replace), LLM (LLM context/metadata), Guid (structured guidance), Warn (warning only), Manual

## 1. Component-Level Comparison
- One table per component area.
- Each row = one specific concern.
- Columns: Concern | Impact Tier | pf-codemods (fix type) | frontend-analyzer (strategy + quality) | Coverage | Notes
- The "Notes" column flags semantic differences, edge cases, or quality concerns.

## 2. Cross-Cutting Concerns
- Deprecated component removals (with semantic difference check)
- CSS variables (JS vs stylesheet, with honest value assessment)
- Package-level coverage
- Workflow/utility concerns

## 3. Coverage Summary with Impact Weighting

### By Impact Tier
| Tier | Both | PC Only | FA Only | Total | % of FA-only that is genuinely incremental |
This table is the MOST IMPORTANT table in the document. It shows how FA's value concentrates.

### Fix Quality Head-to-Head
| Dimension | pf-codemods | FA (honest) |
- Distinguish "actually auto-fixes" from "provides metadata" and "provides guidance."

### Incremental Value Summary
- FA's GENUINE incremental value: [exact count] rules across [categories].
- FA's noise: [exact count] Tier 4 rules.
- FA's overlap with pf-codemods: [exact count] rules.
- FA's overlap with tsc: [exact count] rules.
```

## Quality Criteria

- **Skeptic's standard:** Every claim about FA's value must survive "So what? Would `tsc` / test suite / migration guide catch this?"
- **Exact counts, not approximations.** No "~86 concerns." Count them.
- **Honest about fix quality.** "LLM-assisted" is metadata, not auto-fix. Say so.
- **Developer-impact tiering is mandatory.** Every FA rule gets a tier.
- **Incremental value, not total value.** The question is not "what does FA cover?" but "what does FA cover that nothing else does?"
- **Name specific rules, props, components.** "Some type changes" is not acceptable.
- **Flag semantic differences.** If both tools cover the same concern but recommend different fixes, this is a finding, not a footnote.
- **Actionable recommendations.** Don't just describe gaps -- say what to build.
- **No false balance.** If pf-codemods is better at something, say so. If FA is better, say so. Don't hedge with "both have strengths."

# Self-Consistency Check

## Contradictory Criteria Found

### 1. viewLayout.tsx (MEDIUM tier, File 2): Import correctness vs. Developer Utility Verdict

The import assessment notes that semver-migrated does NOT add `MastheadLogo`, `PageToggleButton`, or `MastheadBrand` imports (missing) and does NOT remove `Button` or `BarsIcon` imports. The component API assessment confirms the Masthead internals are left unchanged (PF5 pattern). Half-migration risk is marked ELEVATED. Yet the Developer Utility Verdict is **"Roughly equivalent"**, reasoning that the mechanical changes (`masthead` prop, `theme` removal) save a small amount of time.

**Is this contradictory?** Borderline. The file has an ELEVATED half-migration risk and SUBSET+DIVERGENT completeness (with an extraneous `PageBreadcrumb` addition that must be removed), yet is rated "roughly equivalent." The reasoning -- that the mechanical changes save some time but the Masthead restructuring is still needed -- is defensible but leans generous given the extraneous change that must be undone. This is a soft tension, not a hard contradiction.

### 2. FilterToolbar.tsx (HIGH tier, File 5): Structural/JSX correctness is Correct but overall verdict is HIGH risk / Costs time

Criterion 3 (Structural/JSX correctness) is marked **Correct** for the `spaceItems` removal. Criterion 1 (Import correctness) is marked **Wrong/Missing** (build-breaking `SelectOptionProps` import). Criterion 2 (API alignment) is **Partial** (`spaceItems` removal correct, `OptionPropsWithKey` rewrite missing).

**Is this contradictory?** No. A file can be correct on one criterion and wrong on others. The Correct verdict on criterion 3 specifically refers to the JSX change (the `spaceItems` removal), while the Wrong/Missing verdicts on criteria 1 and 5 refer to separate issues (import path and TypeScript types). These are logically independent. The analysis correctly notes this file has a mix of correct and incorrect changes.

### 3. No other contradictory criteria pairs found

Across all 25 per-file assessments (8 HIGH + 6 MEDIUM + 11 LOW), no file has a Correct verdict on imports paired with a Wrong/Missing on the same component's migration path, or a Correct API alignment paired with structural incorrectness for the same component.

**Conclusion: No hard contradictions found. One soft tension identified (viewLayout.tsx verdict generosity).**

## Risk vs. Recommendation Tensions

### Assessment of tier-level findings consistency

- **HIGH tier**: All 8 files rated HIGH risk, all "costs time." Findings center on missing semantic migrations (Select rewrite, EmptyState restructure, innerRef->ref, ouiaId) and two actively harmful changes (spurious TextInputGroupUtilities wrapper, build-breaking SelectOptionProps import).
- **MEDIUM tier**: 3 files "saves time" (notFound.tsx, showAggregateReportModal.tsx, ToolbarBulkSelector.tsx), 2 "costs time" (contextIcon.tsx, viewLayoutToolbar.css), 1 "roughly equivalent" (viewLayout.tsx).
- **LOW tier**: Systematic EmptyState `titleText` bug in 3 files (errorMessage.tsx, NoDataEmptyState.tsx, StateError.tsx), 2 exact matches, 4 correct subsets, 1 aggressive deletion.

### Would "adopt with caveats for mechanical changes only" be contradicted?

No -- this recommendation aligns with the evidence:

1. The 3 MEDIUM files that "save time" are all mechanical-only migrations: notFound.tsx (EmptyState prop promotion -- actually a well-handled mechanical rewrite), ToolbarBulkSelector.tsx (exact match on splitButtonItems rename), and showAggregateReportModal.tsx (Modal composition -- actually more thorough than golden-source). These support "adopt for mechanical changes."

2. All 8 HIGH files that "cost time" involve semantic/compositional rewrites that the automation does not handle. These support "caveats for non-mechanical work."

3. The LOW tier's EmptyState `titleText` bug is a caveat: even some mechanical-looking changes (EmptyState restructure) are handled incorrectly in 3 of 7 files, correctly in only 1. This means the "mechanical changes only" boundary needs to be drawn carefully -- EmptyState restructuring is NOT reliably mechanical despite appearing simple.

**One potential tension**: The showAggregateReportModal.tsx file is rated "saves time" with a SUPERSET migration (new Modal composition API instead of deprecated shim). This is more thorough than the golden-source. If the recommendation says "adopt for mechanical changes only," this file's migration goes beyond mechanical -- it performed a semantic compositional rewrite of Modal. This is an outlier that could confuse the recommendation. However, it was the ONLY Modal file that received this treatment (3 others got nothing), so it should be flagged as an inconsistency in the automation rather than evidence that semantic rewrites work reliably.

**Conclusion: No fundamental tension. The "adopt with caveats" recommendation is consistent with individual verdicts, with the caveat that the EmptyState restructure boundary and the Modal inconsistency should be explicitly noted.**

## Developer Utility Verdict Outliers

### Outlier 1: viewLayout.tsx -- "Roughly equivalent" despite ELEVATED half-migration risk

All other files with ELEVATED half-migration risk and DIVERGENT completeness received "costs time" verdicts. viewLayout.tsx is the only file rated "roughly equivalent" despite having ELEVATED half-migration risk (Masthead internals not migrated) and an extraneous `PageBreadcrumb` that must be removed. The reasoning is that `masthead` prop rename and `theme` removal save some time. This is defensible but is the most generous verdict in the dataset.

**Comparison**: contextIcon.tsx (MEDIUM tier) has a similar profile -- correct token renames but wrong approach (PF5 API pattern with PF6 tokens) -- and is rated "costs time." The situations are analogous: correct mechanical renames but wrong structural approach. The verdicts are inconsistent between these two files.

### Outlier 2: showAggregateReportModal.tsx -- "Saves time" with SUPERSET migration

This is the only file where semver-migrated produced a MORE thorough migration than the golden-source. The automation migrated Modal to the new composition API (ModalHeader/ModalBody/ModalFooter) while the golden-source only moved it to the deprecated path. This is objectively superior work. However, the pattern analysis (07-patterns.md) notes that 3 other Modal files received zero migration, making this a one-off success. The verdict is correct for this file in isolation, but the pattern inconsistency means it should not be generalized.

### Outlier 3: ExtendedButton.test.tsx -- "Roughly equivalent" vs. pattern expectation

The CSS token rename pattern has a 6/6 success rate. This test file is in the "correct subset" category but rated "roughly equivalent" because the golden-source also added async/await test improvements (non-PF6 changes). The verdict correctly identifies these as pre-existing issues, not migration gaps. Consistent with pattern analysis.

**Conclusion: One genuine outlier (viewLayout.tsx should likely be "costs time" for consistency with contextIcon.tsx). showAggregateReportModal.tsx is a correct outlier (data supports the verdict, but the pattern inconsistency should be noted). No other outliers.**

## Cross-Check: Patterns vs. Per-File Verdicts

### Pattern: Select component rewrite (0/2 success)
Per-file verdicts: MultiselectFilterControl.tsx and SelectFilterControl.tsx both show all-red criteria (imports, API, structural, TypeScript all Wrong/Missing). **Consistent.**

### Pattern: EmptyState restructure (1/7 success)
Per-file verdicts:
- notFound.tsx (MEDIUM tier): imports Correct, API Correct, structural Correct. **Consistent with 1/7 success.**
- viewCredentialsList/viewScansList/viewSourcesList (HIGH tier): all show EmptyState criteria as Wrong/Missing. **Consistent with "not attempted" failure mode.**
- errorMessage.tsx/NoDataEmptyState.tsx/StateError.tsx (LOW tier): all show "wraps Title in EmptyStateBody" divergence. **Consistent with "incorrect restructure" failure mode.**
- Pattern analysis notes 3 distinct failure modes. Per-file verdicts confirm all three. **Fully consistent.**

### Pattern: Modal deprecated path (1/4 success, superset)
Per-file verdicts:
- showAggregateReportModal.tsx: SUPERSET, saves time. **Consistent with pattern's superset note.**
- viewCredentialsList/viewScansList/viewSourcesList: all show Modal migration as Wrong/Missing. **Consistent with 0/3 on remaining files.**
- Pattern analysis notes the inconsistency. Per-file verdicts confirm it. **Fully consistent.**

### Pattern: innerRef -> ref (0/3 success)
Per-file verdicts:
- typeaheadCheckboxes.tsx: criterion 2 explicitly lists both `innerRef` instances as MISSING. **Consistent.**
- useTableWithBatteries.tsx: criterion 2 confirms `innerRef` not migrated. **Consistent.**
- (Third file is golden-only, no per-file verdict needed.)

### Pattern: CSS token/class rename (6/6 success)
Per-file verdicts: All files with CSS token changes show them as correct. viewLayoutToolbar.css is rated Partial (tokens correct but file should be deleted per golden-source) -- pattern analysis correctly notes this is "correct in isolation but wasted effort." **Consistent.**

### Pattern: ToolbarFilter chips/deleteChip rename (3/3 success)
Per-file verdicts: MultiselectFilterControl.tsx and SelectFilterControl.tsx both confirm chips/deleteChip renames were correctly applied (noted in the "WHAT SEMVER-MIGRATED DID" sections as the only correct changes). SearchFilterControl.tsx similarly noted as correctly migrated. **Consistent.**

### Pattern: PageSection variant="light" removal (4/4 partial success)
Per-file verdicts: All four files (viewCredentialsList, viewScansList, viewSourcesList, notFound.tsx) show variant removal as correct but note missing `hasBodyWrapper={false}`. **Consistent.**

### Pattern: Button icon prop (0/2 success)
Per-file verdicts:
- typeaheadCheckboxes.tsx: criterion 2 lists "Button icon prop migration: MISSING." **Consistent.**
- SearchFilterControl.tsx: LOW tier notes semver misses Button children-to-icon migration. **Consistent.**

### Pattern: Button/ActionMenu size="sm" (0/3 success)
Per-file verdicts: viewCredentialsList, viewScansList, viewSourcesList all list `size="sm"` as missing. **Consistent.**

### Pattern: Td hasAction (0/3 success)
Per-file verdicts: All three list view files note `hasAction` migration as missing. **Consistent.**

### Minor pattern discrepancy: align alignRight -> alignEnd (1/2 success)
Pattern analysis says 1/2 correct (usePaginationPropHelpers.ts correct, viewLayoutToolbar.tsx missed). Per-file verdicts: viewLayoutToolbar.tsx criterion 2 explicitly lists `alignRight` not updated to `alignEnd`. usePaginationPropHelpers.ts is listed as exact match in LOW tier. **Consistent.**

**Conclusion: Pattern-level and file-level findings are fully aligned. No mismatches found between the pattern success rates and individual file verdicts.**

## Resolutions

### Resolution 1: viewLayout.tsx verdict adjustment
**Issue**: "Roughly equivalent" verdict is inconsistent with contextIcon.tsx ("costs time") given similar profiles (correct mechanical renames, wrong structural approach, ELEVATED half-migration risk, extraneous changes to undo).
**Resolution**: Adjust viewLayout.tsx to **"costs time"** in the final report, or explicitly note that the mechanical renames (masthead, theme) provide marginal value but the Masthead restructuring is the bulk of the work and the extraneous PageBreadcrumb must be removed. The current "roughly equivalent" rating slightly overstates the automation's contribution for this file.
**Impact on summary statistics**: MEDIUM tier would change from "3 save time, 1 roughly equivalent, 2 cost time" to "3 save time, 3 cost time." This strengthens the narrative that the automation handles mechanical changes well but not structural ones.

### Resolution 2: showAggregateReportModal.tsx -- note the inconsistency context
**Issue**: This file's "saves time" verdict is correct in isolation but the Modal pattern inconsistency (1/4 success) means it should not be used to claim the automation handles Modal migration well.
**Resolution**: Keep the per-file verdict as "saves time" but in the final report, explicitly note: "One Modal file received a superior migration (new composition API), but 3 other Modal files received no migration at all. The automation's Modal handling is non-deterministic and should not be relied upon." No per-file verdict change needed.

### Resolution 3: EmptyState boundary clarification
**Issue**: The EmptyState restructure looks mechanical (move props up, remove wrapper components) but fails in 6 of 7 files. The final report should not classify this as a "mechanical" change when making the "adopt for mechanical changes only" recommendation.
**Resolution**: In the final report, explicitly list EmptyState restructuring as a SEMANTIC change that falls outside the automation's reliable capability, despite its superficial simplicity. The 1/7 success rate (with 3 distinct failure modes) is evidence of unreliability.

## Status
RESOLVED

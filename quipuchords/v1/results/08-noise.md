# Noise Quantification

## Signal-to-Noise Ratio

### All Lines (including package*.json infrastructure)

| Category | Lines | Percentage |
|----------|-------|-----------|
| Valid PF6 migration changes | 284 | 77.4% |
| Unrelated/spurious changes | 21 | 5.7% |
| Incorrect/harmful changes | 62 | 16.9% |
| **Total lines changed** | **367** | **100%** |

### Source Files Only (excluding package-lock.json and package.json)

| Category | Lines | Percentage |
|----------|-------|-----------|
| Valid PF6 migration changes | 174 | 67.7% |
| Unrelated/spurious changes | 21 | 8.2% |
| Incorrect/harmful changes | 62 | 24.1% |
| **Total source lines changed** | **257** | **100%** |

## Per-File Breakdown

| File | Added | Removed | Total | Classification | Notes |
|------|-------|---------|-------|---------------|-------|
| package-lock.json | 50 | 50 | 100 | valid | PF6 dependency version bumps |
| package.json | 5 | 5 | 10 | valid | PF6 dependency version bumps |
| aboutModal.tsx | 21 | 21 | 42 | valid | Exact match with golden-source |
| showAggregateReportModal.tsx | 20 | 15 | 35 | valid | SUPERSET of golden; new Modal API (more forward) |
| typeaheadCheckboxes.tsx | 17 | 15 | 32 | **harmful** | Spurious TextInputGroupUtilities wrapper creates structural bug; missed all real migrations (innerRef, ouiaId, Button icon) |
| viewLayoutToolbar.tsx | 8 | 7 | 15 | **mixed** (4 valid, 5 spurious, 6 harmful) | CSS renames valid; unused ToolbarExpandIconWrapper/ToolbarToggleGroup imports spurious; gap values wrong (spacerNone instead of gapNone); variant removed without replacement |
| notFound.tsx | 6 | 8 | 14 | valid | Correct EmptyState migration; only missing hasBodyWrapper |
| StateError.tsx | 7 | 7 | 14 | **mixed** (7 valid, 7 harmful) | Icon prop and import removal valid; Title wrapped in EmptyStateBody instead of titleText prop (incorrect) |
| NoDataEmptyState.tsx | 7 | 6 | 13 | **mixed** (6 valid, 7 harmful) | Same EmptyState titleText bug as StateError |
| errorMessage.tsx | 7 | 6 | 13 | **mixed** (6 valid, 7 harmful) | Same EmptyState titleText bug as StateError |
| viewLayout.tsx | 6 | 4 | 10 | **mixed** (4 valid, 6 spurious) | masthead/theme removals valid; PageBreadcrumb addition and filter().map change are non-PF6 |
| ExtendedButton.test.tsx | 4 | 4 | 8 | valid | CSS class v5->v6 rename correct |
| contextIcon.tsx | 4 | 4 | 8 | valid | Token renames mechanically correct |
| ToolbarBulkSelector.tsx | 2 | 4 | 6 | valid | Exact match with golden-source |
| useTableWithBatteries.tsx | 4 | 2 | 6 | **spurious** | Unnecessary children destructuring; missed the real migration (innerRef->ref) |
| FilterToolbar.tsx | 2 | 3 | 5 | **mixed** (2 valid, 3 harmful) | spaceItems removal correct; SelectOptionProps moved to wrong package (build-breaking) |
| showSourceConnectionsModal.css | 2 | 2 | 4 | valid | CSS token rename correct |
| addSourceModal.test.tsx | 2 | 2 | 4 | valid | CSS class rename correct |
| SelectFilterControl.tsx | 2 | 2 | 4 | valid | chips/deleteChip renames correct |
| select-overrides.css | 0 | 4 | 4 | **spurious** | Content deleted entirely; golden-source preserved and renamed tokens |
| SearchFilterControl.tsx | 2 | 2 | 4 | valid | chips/deleteChip renames correct |
| MultiselectFilterControl.tsx | 2 | 2 | 4 | valid | chips/deleteChip renames correct |
| viewLayoutToolbar.css | 2 | 2 | 4 | valid | CSS token renames mechanically correct (though file should be deleted per golden) |
| viewSourcesList.tsx | 1 | 1 | 2 | valid | variant="light" removal correct (incomplete but not wrong) |
| viewScansList.tsx | 1 | 1 | 2 | valid | variant="light" removal correct (incomplete but not wrong) |
| viewCredentialsList.tsx | 1 | 1 | 2 | valid | variant="light" removal correct (incomplete but not wrong) |
| usePaginationPropHelpers.ts | 1 | 1 | 2 | valid | Exact match with golden-source |

## Noise Threshold Assessment

**NOISE EXCEEDS 20% THRESHOLD.**

Including all files (infrastructure + source), noise is **22.6%** (83 of 367 lines are spurious or harmful). When considering source files only (excluding package*.json), noise rises to **32.3%** (83 of 257 lines).

This means the branch is **materially harder to adopt** than a clean migration. A developer reviewing this branch must:

1. **Identify and revert harmful changes** (62 lines, 16.9% of total) -- these introduce bugs or build-breaking issues that did not exist before. This is worse than starting from scratch for those files.
2. **Identify and remove spurious changes** (21 lines, 5.7% of total) -- these add review burden and obscure the actual migration signal.

### Breakdown of Harmful Changes by Category

| Harmful Change | Lines | Files Affected |
|---------------|-------|----------------|
| EmptyState titleText bug (Title in EmptyStateBody instead of titleText prop) | 21 | StateError.tsx, NoDataEmptyState.tsx, errorMessage.tsx |
| TextInputGroupUtilities spurious wrapper (structural bug) | 32 | typeaheadCheckboxes.tsx |
| Wrong gap token values (spacerNone/spacerMd instead of gapNone/gapMd) | 3 | viewLayoutToolbar.tsx |
| ToolbarGroup variant removed without replacement | 3 | viewLayoutToolbar.tsx |
| SelectOptionProps moved to wrong package (build-breaking) | 3 | FilterToolbar.tsx |

### Breakdown of Spurious Changes by Category

| Spurious Change | Lines | Files Affected |
|----------------|-------|----------------|
| Unnecessary PageBreadcrumb addition + filter().map refactor | 6 | viewLayout.tsx |
| Unnecessary children destructuring (missed real innerRef->ref migration) | 6 | useTableWithBatteries.tsx |
| Unused imports (ToolbarExpandIconWrapper, ToolbarToggleGroup) | 5 | viewLayoutToolbar.tsx |
| CSS content deletion instead of token rename | 4 | select-overrides.css |

## Key Observations

1. **The noise is concentrated**: 5 files account for all 83 noisy lines. The remaining 22 files are clean valid migrations.
2. **Harmful changes are worse than missing changes**: The 3 EmptyState files, typeaheadCheckboxes.tsx, FilterToolbar.tsx, and viewLayoutToolbar.tsx introduce bugs or build errors. A developer must not only do the missing work but also diagnose and undo incorrect work.
3. **The EmptyState titleText bug is systematic**: The automation consistently wraps `<Title>` in `<EmptyStateBody>` instead of using the PF6 `titleText` prop. This is a codemod pattern gap that affects 3 files identically.
4. **The most damaging single change** is the TextInputGroupUtilities wrapper in typeaheadCheckboxes.tsx (32 lines), which creates a structural DOM bug that would be difficult to trace back to the migration.

## AUTO-ONLY Breakdown

(none -- 0 AUTO-ONLY files; all files touched by semver-migrated were also touched by golden-source)

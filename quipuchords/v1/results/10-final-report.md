# PF5→PF6 Automated Migration Evaluation Report

**golden-source:** quipucords/quipucords-ui#664 (human-authored)
**semver-migrated:** jwmatthews/quipucords-ui#5 (automated)
**Evaluation date:** 2026-04-11

---

## Part 1: Stakeholder Brief

We evaluated an automated tool's attempt to migrate our PatternFly 5 UI to PatternFly 6 by comparing its output against a completed human-authored migration of the same codebase. The automation correctly handled simple rename-style changes (CSS class prefixes, straightforward prop renames) but failed on every component restructuring the migration requires -- it touched only 25 of the 55 files the human migration changed, and of the files it did touch, 8 of 14 substantive ones introduced incomplete or incorrect code that a developer would need to diagnose and fix. Our recommendation is **adopt with significant caveats**: the automated branch can serve as a starting point for the mechanical rename layer (dependency versions, CSS token prefixes, a handful of trivial prop renames), but a developer must still perform all structural component rewrites manually, and must also revert or fix the 5 files where the tool introduced bugs or build-breaking changes. The single metric that captures the story: of the 18 distinct PF6 migration patterns identified in the human reference, the automation handled only 4 reliably -- the remaining 14 patterns, which represent the majority of the migration effort, were either missed entirely or applied incorrectly.

---

## Part 2: Developer Punch List

| Priority | File | What to Fix | Why | Effort |
|----------|------|-------------|-----|--------|
| P0 | `FilterToolbar.tsx` | Remove `SelectOptionProps` from `@patternfly/react-core` import; rewrite `OptionPropsWithKey` as standalone interface `{ key: string; value: string | number; label?: string }` | Build-breaking: `SelectOptionProps` does not exist in PF6 main exports. TypeScript compilation will fail. | 15 min |
| P0 | `typeaheadCheckboxes.tsx` | Revert spurious `<TextInputGroupUtilities>` wrapper around `<TextInputGroupMain>`; change `innerRef` to `ref` on MenuToggle and TextInputGroupMain; change `data-ouia-component-id` to `ouiaId` on MenuToggle; move TimesIcon from Button children to `icon` prop | Structural DOM bug (duplicate TextInputGroupUtilities) breaks typeahead layout. Retained `innerRef` props silently fail in PF6. | 30 min |
| P0 | `MultiselectFilterControl.tsx` | Complete Select rewrite: replace deprecated imports with `Select, SelectList, SelectOption, MenuToggle` from `@patternfly/react-core`; add toggle render function; restructure JSX to PF6 composition model; update `onFilterSelect` callback signature and types | Deprecated PF5 Select API (`SelectVariant`, `onToggle`, `SelectOptionObject`) left intact. Will fail when deprecated exports are removed. | 1-2 hr |
| P0 | `SelectFilterControl.tsx` | Same Select rewrite as MultiselectFilterControl: replace deprecated imports, add MenuToggle toggle, restructure to PF6 composition model | Same deprecated Select issue as MultiselectFilterControl. | 1-2 hr |
| P1 | `addCredentialModal.tsx` (GOLDEN-ONLY) | Move `Modal`/`ModalVariant` imports to `@patternfly/react-core/deprecated` | Modal not exported from main `@patternfly/react-core` in PF6 -- build failure. | 5 min |
| P1 | `showScansModal.tsx` (GOLDEN-ONLY) | Move Modal to deprecated import path; restructure EmptyState (remove EmptyStateHeader/EmptyStateIcon, use `titleText`/`icon`/`headingLevel` props on EmptyState) | Build failure from both Modal import and removed EmptyState sub-components. | 30 min |
| P1 | `addSourceModal.tsx` (GOLDEN-ONLY) | Move Modal to deprecated import path; add `id="source-port-helper-text"` to HelperText | Build failure from Modal import. | 10 min |
| P1 | `addSourcesScanModal.tsx` (GOLDEN-ONLY) | Move Modal to deprecated import path | Build failure from Modal import. | 5 min |
| P1 | `showSourceConnectionsModal.tsx` (GOLDEN-ONLY) | Move Modal to deprecated import path; add `isExpandable` and `hasAnimations` props to Table | Build failure from Modal import; expandable table rows may not render correctly. | 15 min |
| P1 | `useTdWithBatteries.tsx` (GOLDEN-ONLY) | Rename `innerRef` to `ref` on Td component | PF6 removed `innerRef` on Td -- refs silently fail, breaking scroll/focus. | 5 min |
| P1 | `useThWithBatteries.tsx` (GOLDEN-ONLY) | Rename `innerRef` to `ref` on Th component | Same `innerRef` removal as Td. | 5 min |
| P1 | `useTrWithBatteries.tsx` (GOLDEN-ONLY) | Rename `innerRef` to `ref` on Tr component | Same `innerRef` removal as Tr. | 5 min |
| P1 | `viewLayoutToolbar.tsx` | Add `variant="action-group-plain"` to both ToolbarGroups; change `alignRight` to `alignEnd`; change gap values from `spacerNone`/`spacerMd` to `gapNone`/`gapMd`; change all `data-ouia-component-id` to `ouiaId`; import Avatar component and replace manual avatar CSS/HTML; delete `viewLayoutToolbar.css` and its import; add `popperProps={{ position: 'right' }}` to user Dropdown | Wrong gap values cause runtime issues. Missing variant affects toolbar layout. Avatar still uses PF5 CSS hack pattern. | 1 hr |
| P2 | `viewCredentialsList.tsx` | Add `hasBodyWrapper={false}` to PageSection; remove EmptyStateHeader/EmptyStateIcon imports; restructure EmptyState to PF6 API; move Modal to deprecated import; remove `label` from selectOptions; add `size="sm"` to Buttons/ActionMenu; add `hasAction` to Td | Only `variant="light"` removal was done. All other PF6 changes missing. | 45 min |
| P2 | `viewScansList.tsx` | Same as viewCredentialsList: EmptyState restructure, Modal to deprecated, PageSection hasBodyWrapper, Button size, Td hasAction | Same incomplete migration as viewCredentialsList. | 45 min |
| P2 | `viewSourcesList.tsx` | Same as viewCredentialsList plus: change `Td isActionCell` to `Td hasAction`; remove `label` from selectOptions | Same incomplete migration. | 45 min |
| P2 | `errorMessage.tsx` | Change EmptyState: move `<Title>` from `<EmptyStateBody>` to `titleText` prop on `<EmptyState>` | Title renders as body text instead of heading. Accessibility and visual issue. | 10 min |
| P2 | `NoDataEmptyState.tsx` | Same EmptyState `titleText` fix as errorMessage.tsx | Same systematic EmptyState bug. | 10 min |
| P2 | `StateError.tsx` | Same EmptyState `titleText` fix as errorMessage.tsx | Same systematic EmptyState bug. | 10 min |
| P2 | `viewLayout.tsx` | Remove extraneous `<PageBreadcrumb />`; restructure Masthead internals: replace `<Button variant="plain"><BarsIcon /></Button>` with `<PageToggleButton>`; wrap `<Brand>` in `<MastheadLogo>` | PF5 Masthead internal composition not migrated. Extraneous empty breadcrumb adds whitespace. | 30 min |
| P3 | `contextIcon.tsx` | Replace token-based `color` prop pattern with PF6 `<Icon status="...">` wrapper; remove `ContextIconColors` export | PF5 color prop pattern works but is not PF6-canonical. May break under PF6 dark mode theming. | 30 min |
| P3 | `useTableWithBatteries.tsx` | Revert unnecessary children destructuring; change `innerRef` to `ref` on Table | Wrong migration applied. `innerRef` removed in PF6. | 10 min |
| P3 | `app.css` (GOLDEN-ONLY) | Add PF6-specific CSS for logo/branding visibility (`filter: invert(1) brightness(1.2)` rules for masthead, about modal, dark theme) | Logo invisible or poorly contrasted against PF6 masthead background. | 15 min |
| P3 | `actionMenu.tsx` (GOLDEN-ONLY) | Add `size` prop to ActionMenu interface and pass to MenuToggle; change `data-ouia-component-id` to `ouiaId` | Action menus render oversized in table cells. | 15 min |
| P3 | `showAggregateReportModal.tsx` | Review Modal composition (ModalHeader/ModalBody/ModalFooter) for correctness; note this uses the new PF6 Modal API while golden-source uses deprecated shim -- decide which approach the team prefers and apply consistently | Non-deterministic Modal handling by automation. Approach is valid but inconsistent with other modal files. | 15 min |
| P3 | `viewLayoutToolbar.css` | Delete this file entirely (replaced by Avatar component approach in viewLayoutToolbar.tsx fix above) | File is orphaned once Avatar component migration is done. | 2 min |
| P4 | `SearchFilterControl.tsx` | Move SearchIcon from Button children to `icon` prop | Deprecated PF5 Button icon pattern. Low risk. | 5 min |
| P4 | All PageSection files | Add `hasBodyWrapper={false}` to `<PageSection>` in notFound.tsx and the 3 list views (if not already fixed above) | Minor layout difference without it. | 5 min |
| P4 | Snapshot files (15 total) | Regenerate all test snapshots after source fixes are applied | Snapshots will auto-update when running tests. | 5 min (automated) |

---

## Part 3: Technical Assessment

### Executive Summary

The automated semver-based migration tool reliably handles lexical transformations -- CSS class prefix renames, simple prop renames, and prop removals -- but fails at the structural component rewrites that constitute the majority of a PF5-to-PF6 migration. Of the 55 files changed in the human-authored reference, the tool touched only 25 (45% file coverage). Among the 18 distinct migration pattern types identified, the tool handled only 4 reliably (CSS token renames, ToolbarFilter prop renames, TextContent-to-Content, splitButtonItems). More critically, the tool introduced actively harmful changes in 5 files -- including one build-breaking import error and one structural DOM bug -- meaning a developer adopting this branch must spend time debugging and reverting automation output before beginning the real migration work. The tool has value as a mechanical pre-processing step for dependency version bumps and CSS prefix updates, but it cannot be trusted for any change that requires understanding PF6's new component composition patterns.

### Coverage and Quality Metrics

- **File coverage:** 25 of 55 golden-source files touched by semver-migrated (45%). Of these, 2 are package manifests, leaving 23 source files.
- **Pattern coverage:** 4 of 18 distinct migration pattern types handled correctly and consistently (CSS token renames, ToolbarFilter chips/deleteChip renames, TextContent-to-Content, splitButtonItems-to-splitButtonItems). An additional 2 patterns were partially handled (PageSection variant removal without hasBodyWrapper; alignRight-to-alignEnd in 1 of 2 files).
- **Line coverage:** Approximately 67.7% of semver-migrated source lines (174 of 257) are valid PF6 migration changes. However, when measured against the golden-source scope, the tool reproduced roughly 15-20% of the total golden-source line changes, since the golden-source migration is far larger in scope.

### Aggregate Findings

#### Where semver-migrated is helping (saves time)

- **aboutModal.tsx**: Exact match with golden-source. Content component migration handled perfectly.
- **usePaginationPropHelpers.ts**: Exact match. `alignRight` to `alignEnd` rename correct.
- **ToolbarBulkSelector.tsx**: Exact match. `splitButtonOptions` to `splitButtonItems` correct.
- **notFound.tsx**: EmptyState restructure done correctly (the single EmptyState success out of 7 files). Only missing `hasBodyWrapper={false}`.
- **showAggregateReportModal.tsx**: Actually more thorough than golden-source -- migrated Modal to the new composition API (ModalHeader/ModalBody/ModalFooter) rather than the deprecated shim. Saves time, though the non-deterministic nature of this success (3 other Modal files got nothing) means it should not be generalized.
- **CSS token renames across 6 files**: All `pf-v5-*` to `pf-v6-*` renames are correct.
- **ToolbarFilter prop renames across 3 files**: `chips`/`deleteChip` to `labels`/`deleteLabel` correct everywhere.
- **Package version bumps**: All PF6 dependency versions correctly updated with lock file.

#### Where semver-migrated is hurting (costs time, introduces risk)

- **typeaheadCheckboxes.tsx** (HIGH risk): Spurious `TextInputGroupUtilities` wrapper creates a structural DOM bug. Missed `innerRef`-to-`ref`, `ouiaId`, and Button `icon` prop migrations. Developer must revert and redo.
- **FilterToolbar.tsx** (HIGH risk): `SelectOptionProps` moved to `@patternfly/react-core` (does not exist there in PF6). Build-breaking TypeScript error.
- **viewLayoutToolbar.tsx** (HIGH risk): Wrong gap token values (`spacerNone` instead of `gapNone`), variant removed without replacement, `alignRight` not updated, all `ouiaId` renames missed.
- **errorMessage.tsx, NoDataEmptyState.tsx, StateError.tsx** (MEDIUM risk each): Systematic EmptyState bug -- `<Title>` wrapped in `<EmptyStateBody>` instead of using `titleText` prop. Title renders as body text, not heading.
- **useTableWithBatteries.tsx**: Unnecessary children restructuring applied instead of the actual `innerRef`-to-`ref` migration.
- **viewLayout.tsx**: Extraneous `<PageBreadcrumb />` added (not in golden-source); `routes.filter().map()` refactor is a non-PF6 change.

#### Where semver-migrated is neutral

- **contextIcon.tsx**: Token renames are mechanically correct but the PF5 color-prop API pattern was retained instead of migrating to PF6 `<Icon status="...">`. Works but not canonical.
- **viewLayoutToolbar.css**: CSS tokens correctly renamed, but the file should be deleted entirely per the golden-source approach (replaced by Avatar component).
- **select-overrides.css**: File content deleted by automation; golden-source preserved and renamed tokens. Either approach may be valid depending on whether PF6 Select needs the override.

#### Coverage gaps (GOLDEN-ONLY files)

30 files in the golden-source were not touched by semver-migrated at all. The most impactful gaps:

1. **Modal import path (5 files)**: `addCredentialModal.tsx`, `showScansModal.tsx`, `addSourceModal.tsx`, `addSourcesScanModal.tsx`, `showSourceConnectionsModal.tsx` -- all require moving `Modal`/`ModalVariant` to `@patternfly/react-core/deprecated`. These will cause **build failures**.
2. **Table innerRef-to-ref (3 files)**: `useTdWithBatteries.tsx`, `useThWithBatteries.tsx`, `useTrWithBatteries.tsx` -- PF6 removed `innerRef` on Table sub-components. Refs silently fail, **breaking scroll/focus behavior**.
3. **app.css**: Missing PF6 CSS overrides for logo/branding visibility. Logo will be invisible or poorly contrasted.
4. **actionMenu.tsx**, **simpleDropdown.tsx**: Missing `size` prop and `ouiaId` rename.
5. **15 snapshot files**: Will auto-regenerate but confirm source-level gaps.

#### Half-migrations detected

- **innerRef retained on PF6 components** (typeaheadCheckboxes.tsx, useTableWithBatteries.tsx): PF5 `innerRef` prop used with PF6 packages that no longer support it.
- **PageSection variant removed but hasBodyWrapper not added** (4 files): Functionally tolerable but layout may differ.
- **viewLayoutToolbar.tsx gap values**: PF6 `gap` prop name with PF5 `spacerNone`/`spacerMd` values.
- **contextIcon.tsx**: PF6 token variable names with PF5 inline-color API pattern.
- **FilterToolbar.tsx**: `SelectOptionProps` referenced from main exports (does not exist in PF6).

#### AUTO-ONLY files

0 AUTO-ONLY files. The automation did not produce any spurious file changes outside the golden-source scope. This is a positive signal -- no noise from extra files.

### Appendix: Automation Tool Assessment

**1. Effective ceiling?**

**Mechanical reliable, semantic unreliable.** The tool has a clear competence boundary: it reliably handles lexical/syntactic transformations (string renames, prop removals, CSS prefix updates) with a success rate above 90% for those patterns. It fails at semantic transformations (component composition rewrites, new prop additions, type interface rewrites, JSX tree restructuring) with a success rate below 15%. The PF5-to-PF6 migration is predominantly semantic, which means the tool's effective ceiling covers roughly 20% of the total migration effort.

**2. Developer time savings?**

- **Mechanical-only files** (aboutModal.tsx, usePaginationPropHelpers.ts, ToolbarBulkSelector.tsx, CSS-only files): **Genuine time savings.** These files require zero developer intervention. Estimated savings: 30-60 minutes across all mechanical files combined.
- **High-complexity rewrites** (Select, EmptyState, Masthead, Modal): **Net negative.** The tool either did nothing (requiring the developer to do all work from scratch) or introduced incorrect code that must be diagnosed and reverted before the real migration can begin. Estimated cost: 30-60 minutes of debugging/reverting added on top of the full manual effort.
- **Test files**: **Minimal savings.** CSS class renames in tests are correct but trivial. The tool did not handle test infrastructure changes (async/await, selector updates, snapshot regeneration). Estimated savings: 10-15 minutes.
- **Net across entire migration**: Roughly break-even to slight negative. The mechanical savings (~1 hour) are offset by the cost of reviewing all automation output for correctness, reverting harmful changes (~30-60 minutes), and the cognitive overhead of working from a partially-migrated codebase rather than a clean starting point.

**3. Top 3 failure modes?**

1. **Component composition rewrites not attempted** (Select, Masthead, Modal new API). The tool does not understand PF6's shift from monolithic components with many props to compositional patterns with render functions and sub-components. This is the single largest gap, affecting the most complex and time-consuming parts of the migration. 0/2 Select files, 0/1 Masthead file handled.
2. **Inconsistent handling of the same pattern across files** (EmptyState: 1 correct, 3 wrong, 3 skipped; Modal: 1 superset, 3 skipped; alignRight: 1 correct, 1 missed). The tool's behavior appears sensitive to the syntactic context surrounding the pattern, producing different results for the same logical transformation. This makes its output untrustworthy even for patterns it sometimes handles correctly.
3. **Incorrect structural changes** (typeaheadCheckboxes.tsx spurious wrapper, FilterToolbar.tsx wrong import path, wrong gap values). When the tool attempts changes beyond its competence boundary, it sometimes introduces bugs rather than simply skipping the change. These are worse than omissions because they require active debugging.

**4. Highest-risk items to fix? (by file, ordered by risk)**

1. `FilterToolbar.tsx` -- build-breaking `SelectOptionProps` import (blocks compilation)
2. `typeaheadCheckboxes.tsx` -- structural DOM bug from spurious wrapper (blocks UI rendering of typeahead)
3. `addCredentialModal.tsx` -- Modal import path (blocks credential modal rendering)
4. `showScansModal.tsx` -- Modal import + EmptyState removal (blocks scan modal rendering)
5. `addSourceModal.tsx` -- Modal import path (blocks source modal rendering)
6. `addSourcesScanModal.tsx` -- Modal import path (blocks scan modal rendering)
7. `showSourceConnectionsModal.tsx` -- Modal import + Table props (blocks connection modal)
8. `useTdWithBatteries.tsx` / `useThWithBatteries.tsx` / `useTrWithBatteries.tsx` -- `innerRef` removal (breaks all table ref forwarding)
9. `MultiselectFilterControl.tsx` / `SelectFilterControl.tsx` -- deprecated Select API on PF6 runtime (filter dropdowns may fail)
10. `viewLayoutToolbar.tsx` -- wrong gap values and missing variant (toolbar layout issues)

**5. What would make it genuinely useful?**

The single gap that would most improve the tool's value is **support for PF6 component composition rewrites** -- specifically, the ability to transform deprecated monolithic component APIs (PF5 Select, PF5 Modal, PF5 EmptyState with sub-components) into their PF6 compositional equivalents (Select+SelectList+MenuToggle, ModalHeader+ModalBody+ModalFooter, EmptyState with inline props). These rewrites account for roughly 60% of the human migration effort in this codebase. If the tool could handle even the Select and EmptyState patterns reliably and consistently across files, it would shift the net developer time calculation from break-even to a meaningful 40-50% reduction in manual effort. The mechanical renames the tool already handles are useful but represent the easy part of the migration that developers can do quickly with find-and-replace anyway.

# Cross-File Pattern Analysis

## Pattern: Select Component Rewrite (deprecated PF5 Select → PF6 composition model)
Files affected: 2 (MultiselectFilterControl.tsx, SelectFilterControl.tsx)
semver-migrated success rate: 0 of 2 files handled correctly
Failure mode: The automation did not attempt the Select rewrite at all. PF5 deprecated Select API (`SelectVariant`, `onToggle`, `selections`, `placeholderText`, `SelectOptionObject`) was left intact. The only changes applied were the unrelated ToolbarFilter `chips`→`labels` / `deleteChip`→`deleteLabel` renames on the surrounding ToolbarFilter wrapper. The core migration -- replacing deprecated `<Select>` with the PF6 composition model (`<Select toggle={...}><SelectList><SelectOption>`) plus `MenuToggle` render function -- was completely absent in both files.
Consistency: Yes (consistently failed -- the Select rewrite was missed in both files identically)

---

## Pattern: EmptyState Restructure (EmptyStateHeader/EmptyStateIcon removal → inline props)
Files affected: 8 (viewCredentialsList.tsx, viewScansList.tsx, viewSourcesList.tsx, showScansModal.tsx [golden-only], notFound.tsx, errorMessage.tsx, NoDataEmptyState.tsx, StateError.tsx)
semver-migrated success rate: 1 of 7 overlapping files handled correctly (notFound.tsx)
Failure mode: Three distinct failure modes observed:
  1. **Not attempted** (3 files: viewCredentialsList, viewScansList, viewSourcesList): EmptyState was left entirely in PF5 form -- `EmptyStateHeader` and `EmptyStateIcon` sub-components still used.
  2. **Incorrect restructure** (3 files: errorMessage.tsx, NoDataEmptyState.tsx, StateError.tsx): The automation promoted `icon` to an EmptyState prop correctly, but placed `<Title>` inside an `<EmptyStateBody>` instead of using the PF6 `titleText` prop. This is semantically wrong -- the title renders as body text, not as the EmptyState heading.
  3. **Golden-only** (1 file: showScansModal.tsx): File was not touched by semver-migrated at all.
  4. **Correct** (1 file: notFound.tsx): Correctly moved `titleText`, `icon`, and `headingLevel` to EmptyState props.
Consistency: **No** -- highly inconsistent. The same pattern was handled three different ways: correctly (notFound.tsx), incorrectly via wrong `titleText` placement (3 files), and not attempted at all (3 files). This is a significant quality signal indicating the automation is sensitive to syntactic variations in EmptyState usage.

---

## Pattern: Modal → deprecated import path
Files affected: 8 (showAggregateReportModal.tsx, viewCredentialsList.tsx, viewScansList.tsx, viewSourcesList.tsx, addCredentialModal.tsx [golden-only], showScansModal.tsx [golden-only], addSourceModal.tsx [golden-only], addSourcesScanModal.tsx [golden-only], showSourceConnectionsModal.tsx [golden-only])
semver-migrated success rate: 1 of 4 overlapping files handled correctly (showAggregateReportModal.tsx -- actually a SUPERSET, migrated to the new Modal composition API rather than deprecated path)
Failure mode: In the 3 overlapping files that failed (viewCredentialsList, viewScansList, viewSourcesList), Modal/ModalVariant imports were left at `@patternfly/react-core` instead of being moved to `@patternfly/react-core/deprecated`. Five additional modal files were golden-only (not touched at all). If PF6 removes Modal from the main export, these would cause build failures.
Consistency: **No** -- showAggregateReportModal.tsx was migrated to the NEW Modal composition API (ModalHeader/ModalBody/ModalFooter), which is more thorough than golden-source. But 3 other overlapping files had zero Modal migration. The inconsistency suggests the automation handled one Modal file differently based on syntactic context.

---

## Pattern: innerRef → ref rename
Files affected: 6 (typeaheadCheckboxes.tsx [MenuToggle + TextInputGroupMain], useTableWithBatteries.tsx [Table], useTdWithBatteries.tsx [golden-only], useThWithBatteries.tsx [golden-only], useTrWithBatteries.tsx [golden-only])
semver-migrated success rate: 0 of 3 overlapping files handled correctly
Failure mode: In all overlapping files, `innerRef` was left as-is. In typeaheadCheckboxes.tsx, two `innerRef` usages (MenuToggle + TextInputGroupMain) were both missed. In useTableWithBatteries.tsx, `innerRef` on Table was missed and an unrelated children restructuring was done instead. Three additional files (Td, Th, Tr batteries) were golden-only and not touched. PF6 removed the `innerRef` prop on these components, so refs silently fail to attach.
Consistency: Yes (consistently failed -- no `innerRef`→`ref` migration was performed in any file)

---

## Pattern: data-ouia-component-id → ouiaId
Files affected: 5+ (typeaheadCheckboxes.tsx, viewLayoutToolbar.tsx, actionMenu.tsx [golden-only], simpleDropdown.tsx [golden-only], viewLayoutToolbarInteractions.test.tsx [golden-only])
semver-migrated success rate: 0 of 2 overlapping files handled correctly
Failure mode: In both overlapping files, `data-ouia-component-id` HTML attribute was left unchanged instead of being migrated to the PF6 `ouiaId` component prop. Multiple instances were missed per file (viewLayoutToolbar.tsx had instances on MenuToggle and DropdownItem). The attribute may still work as an HTML passthrough, but the canonical PF6 approach uses the `ouiaId` prop for proper OUIA integration.
Consistency: Yes (consistently failed -- no `data-ouia-component-id`→`ouiaId` migration was performed)

---

## Pattern: PageSection variant="light" removal
Files affected: 5 (viewCredentialsList.tsx, viewScansList.tsx, viewSourcesList.tsx, notFound.tsx -- via golden adding hasBodyWrapper)
semver-migrated success rate: 4 of 4 overlapping files partially correct (variant removed, but `hasBodyWrapper={false}` not added)
Failure mode: In all 4 files, `variant="light"` was correctly removed from `<PageSection>`. However, the golden-source additionally added `hasBodyWrapper={false}` which semver-migrated did not. The result is functionally tolerable (no build errors) but may produce minor layout differences versus the golden-source intent.
Consistency: Yes (consistently applied the same partial migration -- variant removed, hasBodyWrapper omitted)

---

## Pattern: ToolbarFilter chips → labels / deleteChip → deleteLabel
Files affected: 3 (MultiselectFilterControl.tsx, SelectFilterControl.tsx, SearchFilterControl.tsx)
semver-migrated success rate: 3 of 3 files handled correctly
Failure mode: N/A -- all instances migrated correctly.
Consistency: Yes (consistently correct across all 3 files)

---

## Pattern: CSS token/class rename (pf-v5-* → pf-v6-*)
Files affected: 6+ (viewLayoutToolbar.tsx, viewLayoutToolbar.css, showAggregateReportModal.tsx, ExtendedButton.test.tsx, addSourceModal.test.tsx, showSourceConnectionsModal.css)
semver-migrated success rate: 6 of 6 overlapping files handled correctly (mechanical rename applied)
Failure mode: N/A -- all CSS token renames were applied correctly.
Note: In viewLayoutToolbar.css, the CSS tokens were correctly renamed, but the golden-source deleted the file entirely (replaced manual CSS avatar with PF6 Avatar component). The token rename is correct in isolation but wasted effort if the file should be deleted. In select-overrides.css, semver-migrated deleted the entire file content instead of renaming tokens (aggressive approach). These are approach differences, not failures.
Consistency: Yes (consistently applied mechanical CSS renames)

---

## Pattern: TextContent/TextList/TextListItem → Content component
Files affected: 1 (aboutModal.tsx)
semver-migrated success rate: 1 of 1 files handled correctly (exact match with golden-source)
Failure mode: N/A
Consistency: N/A (only 1 file)

---

## Pattern: ToolbarGroup variant rename (icon-button-group → action-group-plain)
Files affected: 1 (viewLayoutToolbar.tsx)
semver-migrated success rate: 0 of 1 files handled correctly
Failure mode: The `variant="icon-button-group"` prop was removed entirely instead of being renamed to `variant="action-group-plain"`. This leaves the ToolbarGroup without a variant, which may affect toolbar layout behavior.
Consistency: N/A (only 1 file)

---

## Pattern: spacer → gap (with value rename)
Files affected: 1 (viewLayoutToolbar.tsx)
semver-migrated success rate: 0 of 1 files handled correctly
Failure mode: The prop name was correctly renamed from `spacer` to `gap`, but the values were NOT updated: kept `spacerNone`/`spacerMd` instead of PF6 `gapNone`/`gapMd`. This is a half-migration that uses PF6 prop names with PF5 values.
Consistency: N/A (only 1 file)

---

## Pattern: align alignRight → alignEnd
Files affected: 2 (viewLayoutToolbar.tsx, usePaginationPropHelpers.ts)
semver-migrated success rate: 1 of 2 files handled correctly
Failure mode: usePaginationPropHelpers.ts was correctly migrated (exact match). viewLayoutToolbar.tsx left `alignRight` unchanged.
Consistency: **No** -- correct in one file, missed in the other.

---

## Pattern: Masthead/Nav restructuring (PageToggleButton, MastheadLogo)
Files affected: 1 (viewLayout.tsx)
semver-migrated success rate: 0 of 1 files handled correctly
Failure mode: `header`→`masthead` prop and `theme="dark"` removal were correctly applied. But the Masthead internal composition was not restructured: still uses PF5 `<Button variant="plain"><BarsIcon /></Button>` instead of PF6 `<PageToggleButton>`, and `<MastheadBrand>` was not restructured with `<MastheadLogo>`. An extraneous `<PageBreadcrumb />` was also added.
Consistency: N/A (only 1 file)

---

## Pattern: Button icon prop (children icon → icon={} prop)
Files affected: 2 (typeaheadCheckboxes.tsx, SearchFilterControl.tsx)
semver-migrated success rate: 0 of 2 files handled correctly
Failure mode: In both files, icon elements (TimesIcon, SearchIcon) remained as Button children instead of being moved to the `icon` prop. PF6 expects icons to be passed via the `icon` prop.
Consistency: Yes (consistently failed)

---

## Pattern: Button/ActionMenu size="sm" prop addition
Files affected: 4 (viewCredentialsList.tsx, viewScansList.tsx, viewSourcesList.tsx, actionMenu.tsx [golden-only])
semver-migrated success rate: 0 of 3 overlapping files handled correctly
Failure mode: The `size="sm"` prop was not added to any Button or ActionMenu in table row contexts. This causes oversized buttons/menus in table cells.
Consistency: Yes (consistently failed)

---

## Pattern: Td hasAction / isActionCell → hasAction
Files affected: 3 (viewCredentialsList.tsx, viewScansList.tsx, viewSourcesList.tsx)
semver-migrated success rate: 0 of 3 files handled correctly
Failure mode: Neither `hasAction` additions to Td elements nor `isActionCell`→`hasAction` renames were performed.
Consistency: Yes (consistently failed)

---

## Pattern: MenuToggle splitButtonOptions → splitButtonItems
Files affected: 1 (ToolbarBulkSelector.tsx)
semver-migrated success rate: 1 of 1 files handled correctly (exact match with golden-source)
Failure mode: N/A
Consistency: N/A (only 1 file)

---

## Pattern: SelectOptionProps / OptionPropsWithKey interface rewrite
Files affected: 1 (FilterToolbar.tsx)
semver-migrated success rate: 0 of 1 files handled correctly
Failure mode: `SelectOptionProps` was moved from `@patternfly/react-core/deprecated` to `@patternfly/react-core` (incorrect -- this type does not exist in PF6 main exports). Should have been removed entirely with `OptionPropsWithKey` rewritten as a standalone interface. This causes a build-breaking TypeScript error.
Consistency: N/A (only 1 file)

---

## Pattern: Icon component wrapper (color prop → `<Icon status="...">`)
Files affected: 1 (contextIcon.tsx)
semver-migrated success rate: 0 of 1 files handled correctly
Failure mode: Token variable names were renamed to PF6 equivalents, but the component API was not changed from inline `color` prop to the PF6 `<Icon status="...">` wrapper pattern. Half-migration: PF6 tokens + PF5 API pattern.
Consistency: N/A (only 1 file)

---

## Pattern: PF6 CSS overrides for branding/theming (app.css)
Files affected: 1 (app.css [golden-only])
semver-migrated success rate: 0 of 0 overlapping files (file not touched at all)
Failure mode: app.css was golden-only. Missing PF6-specific CSS rules for logo visibility (filter: invert/brightness), masthead branding, and about modal theming. Logo would be invisible or poorly contrasted against PF6 masthead background.
Consistency: N/A

---

## Pattern: Table innerRef → ref (Td/Th/Tr batteries)
Files affected: 3 (useTdWithBatteries.tsx, useThWithBatteries.tsx, useTrWithBatteries.tsx -- all golden-only)
semver-migrated success rate: 0 of 0 overlapping files (all golden-only, not touched)
Failure mode: All three files were golden-only. PF6 removed `innerRef` on Table sub-components (Td, Th, Tr). Refs would silently fail to attach, breaking scroll/focus behavior.
Consistency: N/A (all golden-only)

---

## Pattern Summary

| Pattern | Files | Success Rate | Consistent? |
|---------|-------|-------------|-------------|
| Select component rewrite | 2 | 0/2 | Yes (all failed) |
| EmptyState restructure | 8 | 1/7 overlapping | **No** (3 ways: correct, wrong titleText, not attempted) |
| Modal → deprecated path | 8+ | 1/4 overlapping (superset) | **No** (1 migrated to new API, 3 not touched) |
| innerRef → ref | 6 | 0/3 overlapping | Yes (all failed) |
| data-ouia-component-id → ouiaId | 5+ | 0/2 overlapping | Yes (all failed) |
| PageSection variant="light" removal | 4 | 4/4 (partial -- missing hasBodyWrapper) | Yes |
| ToolbarFilter chips→labels / deleteChip→deleteLabel | 3 | 3/3 | Yes |
| CSS token/class rename (pf-v5→pf-v6) | 6+ | 6/6 | Yes |
| TextContent→Content | 1 | 1/1 | N/A |
| ToolbarGroup variant rename | 1 | 0/1 | N/A |
| spacer→gap (with value rename) | 1 | 0/1 | N/A |
| align alignRight→alignEnd | 2 | 1/2 | **No** |
| Masthead/Nav restructuring | 1 | 0/1 | N/A |
| Button icon prop migration | 2 | 0/2 | Yes (all failed) |
| Button/ActionMenu size="sm" | 4 | 0/3 overlapping | Yes (all failed) |
| Td hasAction / isActionCell→hasAction | 3 | 0/3 | Yes (all failed) |
| splitButtonOptions→splitButtonItems | 1 | 1/1 | N/A |
| SelectOptionProps interface rewrite | 1 | 0/1 (build-breaking) | N/A |
| Icon component wrapper pattern | 1 | 0/1 | N/A |
| PF6 CSS branding overrides | 1 | 0/0 (golden-only) | N/A |
| Table Td/Th/Tr innerRef→ref | 3 | 0/0 (all golden-only) | N/A |

## Cross-Cutting Observations

### What the automation handles well (consistently correct)
1. **Mechanical CSS token/class renames** (pf-v5-* → pf-v6-*): 6/6 success. This is the automation's strongest capability -- direct string substitution patterns.
2. **Simple prop renames on the same component**: `chips`→`labels`, `deleteChip`→`deleteLabel` (3/3), `splitButtonOptions`→`splitButtonItems` (1/1), `TextContent`→`Content` (1/1).
3. **Simple prop removals**: `variant="light"` on PageSection (4/4), `spaceItems` on ToolbarToggleGroup (1/1), `theme="dark"` on Nav/PageSidebar (1/1).

### What the automation consistently fails at
1. **Component composition rewrites** (Select, EmptyState, Masthead, Modal new API): These require understanding PF6's new compositional patterns and restructuring JSX trees. 0% success rate across Select and Masthead rewrites.
2. **Prop renames that cross component boundaries**: `innerRef`→`ref` (0/3), `data-ouia-component-id`→`ouiaId` (0/2) -- these are prop renames but the automation didn't handle them, possibly because they aren't simple `oldName`→`newName` within a single component's import.
3. **Value renames within prop objects**: `spacerNone`→`gapNone` (0/1), `alignRight`→`alignEnd` (1/2 -- inconsistent). The automation sometimes renames the prop key but not the value.
4. **New prop additions**: `hasBodyWrapper={false}`, `size="sm"`, `hasAction`, `popperProps` -- the automation never adds new props that weren't already present.

### Inconsistency as a quality signal
Three patterns showed inconsistent handling across files:
- **EmptyState**: Correct in 1 file, incorrectly structured in 3, not attempted in 3. This is the most concerning inconsistency -- the same migration pattern produced three different outcomes depending on the file's specific JSX structure.
- **Modal migration**: One file got a SUPERSET migration (new composition API), three files got nothing. This suggests the automation may have different codepaths or heuristics that activate non-deterministically.
- **alignRight→alignEnd**: Correct in usePaginationPropHelpers.ts, missed in viewLayoutToolbar.tsx. Minor but confirms syntactic sensitivity.

### Automation boundary
The data reveals a clear boundary: the automation reliably handles **lexical/syntactic transformations** (token renames, prop renames, prop removals) but fails at **semantic transformations** (component restructuring, compositional API changes, new prop additions, type interface rewrites). The PF5→PF6 migration is predominantly semantic, which explains the overall low success rate on HIGH-priority files.

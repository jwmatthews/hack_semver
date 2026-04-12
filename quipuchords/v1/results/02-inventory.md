# File Inventory and Priority Triage

## Inventory Table

| File | In golden-source | In semver-migrated | Status |
|------|------------------|--------------------|--------|
| package-lock.json | Yes | Yes | OVERLAP |
| package.json | Yes | Yes | OVERLAP |
| src/app.css | Yes | No | GOLDEN-ONLY |
| src/components/aboutModal/__tests__/__snapshots__/aboutModal.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/components/aboutModal/aboutModal.tsx | Yes | Yes | OVERLAP |
| src/components/actionMenu/__tests__/__snapshots__/actionMenu.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/components/actionMenu/actionMenu.tsx | Yes | No | GOLDEN-ONLY |
| src/components/contextIcon/__tests__/__snapshots__/contextIcon.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/components/contextIcon/contextIcon.tsx | Yes | Yes | OVERLAP |
| src/components/errorMessage/__tests__/__snapshots__/errorMessage.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/components/errorMessage/errorMessage.tsx | Yes | Yes | OVERLAP |
| src/components/simpleDropdown/__tests__/__snapshots__/simpleDropdown.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/components/simpleDropdown/simpleDropdown.tsx | Yes | No | GOLDEN-ONLY |
| src/components/typeAheadCheckboxes/typeaheadCheckboxes.tsx | Yes | Yes | OVERLAP |
| src/components/viewLayout/__tests__/__snapshots__/viewLayout.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/components/viewLayout/__tests__/__snapshots__/viewLayoutNavGroup.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/components/viewLayout/__tests__/__snapshots__/viewLayoutToolbar.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/components/viewLayout/__tests__/viewLayoutToolbarInteractions.test.tsx | Yes | No | GOLDEN-ONLY |
| src/components/viewLayout/viewLayout.tsx | Yes | Yes | OVERLAP |
| src/components/viewLayout/viewLayoutToolbar.css | Yes | Yes | OVERLAP |
| src/components/viewLayout/viewLayoutToolbar.tsx | Yes | Yes | OVERLAP |
| src/vendor/react-table-batteries/components/ExtendedButton/__tests__/__snapshots__/ExtendedButton.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/vendor/react-table-batteries/components/ExtendedButton/__tests__/ExtendedButton.test.tsx | Yes | Yes | OVERLAP |
| src/vendor/react-table-batteries/components/useTableWithBatteries.tsx | Yes | Yes | OVERLAP |
| src/vendor/react-table-batteries/components/useTdWithBatteries.tsx | Yes | No | GOLDEN-ONLY |
| src/vendor/react-table-batteries/components/useThWithBatteries.tsx | Yes | No | GOLDEN-ONLY |
| src/vendor/react-table-batteries/components/useTrWithBatteries.tsx | Yes | No | GOLDEN-ONLY |
| src/vendor/react-table-batteries/hooks/pagination/usePaginationPropHelpers.ts | Yes | Yes | OVERLAP |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/FilterToolbar.tsx | Yes | Yes | OVERLAP |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/MultiselectFilterControl.tsx | Yes | Yes | OVERLAP |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/SearchFilterControl.tsx | Yes | Yes | OVERLAP |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/select-overrides.css | Yes | Yes | OVERLAP |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/SelectFilterControl.tsx | Yes | Yes | OVERLAP |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/TableControls/NoDataEmptyState.tsx | Yes | Yes | OVERLAP |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/TableControls/StateError.tsx | Yes | Yes | OVERLAP |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/ToolbarBulkSelector.tsx | Yes | Yes | OVERLAP |
| src/views/credentials/__tests__/__snapshots__/addCredentialModal.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/views/credentials/addCredentialModal.tsx | Yes | No | GOLDEN-ONLY |
| src/views/credentials/viewCredentialsList.tsx | Yes | Yes | OVERLAP |
| src/views/notFound/__tests__/__snapshots__/notFound.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/views/notFound/notFound.tsx | Yes | Yes | OVERLAP |
| src/views/scans/__tests__/__snapshots__/showAggregateReportModal.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/views/scans/__tests__/__snapshots__/showScansModal.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/views/scans/showAggregateReportModal.tsx | Yes | Yes | OVERLAP |
| src/views/scans/showScansModal.tsx | Yes | No | GOLDEN-ONLY |
| src/views/scans/viewScansList.tsx | Yes | Yes | OVERLAP |
| src/views/sources/__tests__/__snapshots__/addSourceModal.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/views/sources/__tests__/__snapshots__/addSourcesScanModal.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/views/sources/__tests__/__snapshots__/showSourceConnectionsModal.test.tsx.snap | Yes | No | GOLDEN-ONLY |
| src/views/sources/__tests__/addSourceModal.test.tsx | Yes | Yes | OVERLAP |
| src/views/sources/addSourceModal.tsx | Yes | No | GOLDEN-ONLY |
| src/views/sources/addSourcesScanModal.tsx | Yes | No | GOLDEN-ONLY |
| src/views/sources/showSourceConnectionsModal.css | Yes | Yes | OVERLAP |
| src/views/sources/showSourceConnectionsModal.tsx | Yes | No | GOLDEN-ONLY |
| src/views/sources/viewSourcesList.tsx | Yes | Yes | OVERLAP |
| tests/__snapshots__/code.test.ts.snap | Yes | No | GOLDEN-ONLY |
| tests/__snapshots__/dist.test.ts.snap | Yes | No | GOLDEN-ONLY |

## Priority Triage (OVERLAP files only)

Note: package-lock.json and package.json are excluded from triage as they are dependency manifest files, not component code.

### HIGH PRIORITY
| File | Reason |
|------|--------|
| src/components/typeAheadCheckboxes/typeaheadCheckboxes.tsx | Contains MenuToggle with `innerRef`->`ref`, `data-ouia-component-id`->`ouiaId` prop renames, and Button `icon` prop migration (children icon to prop). Golden rewrites structure; semver wraps TextInputGroupMain in extra TextInputGroupUtilities and retains deprecated `innerRef`/`data-ouia-component-id`. |
| src/components/viewLayout/viewLayoutToolbar.tsx | Contains Dropdown component with Toolbar `variant="icon-button-group"`->`"action-group-plain"`, `spacer`->`gap`, `alignRight`->`alignEnd`, `data-ouia-component-id`->`ouiaId`. Golden replaces avatar CSS hack with `<Avatar>` component and `avatarImage` import; semver only does CSS class renames and adds `ToolbarExpandIconWrapper`/`ToolbarToggleGroup` imports. Major structural divergence. |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/MultiselectFilterControl.tsx | Full Select component rewrite: golden migrates from deprecated `Select`/`SelectOption`/`SelectVariant` to new `Select`/`SelectList`/`SelectOption`/`MenuToggle` API with new `onSelect` signature, `toggle` render prop, `labels`/`deleteLabel` replacing `chips`/`deleteChip`. Semver only renames `chips`->`labels`, `deleteChip`->`deleteLabel` without migrating the Select component itself. |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/SelectFilterControl.tsx | Full Select component rewrite: golden migrates from deprecated `Select`/`SelectOption`/`SelectOptionObject` to new Select API with `MenuToggle`, `SelectList`, new `onSelect` signature. Semver only renames `chips`->`labels`, `deleteChip`->`deleteLabel`. |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/FilterToolbar.tsx | Contains Dropdown, SelectOptionProps migration. Golden removes deprecated `SelectOptionProps` import and redefines `OptionPropsWithKey` interface; removes `spaceItems` prop from `ToolbarToggleGroup`. Semver moves `SelectOptionProps` import from deprecated to main, and removes `spaceItems`. Different approaches to the same deprecated API. |
| src/views/credentials/viewCredentialsList.tsx | Golden removes `EmptyStateHeader`/`EmptyStateIcon` (promoting to `EmptyState` props), moves Modal to deprecated import, removes `label` from selectOptions (adapting to new Select API), adds `PageSection hasBodyWrapper={false}`, adds `Button size="sm"`. Semver only removes `PageSection variant="light"`. Large delta between the two diffs. |
| src/views/scans/viewScansList.tsx | Golden removes `EmptyStateHeader`/`EmptyStateIcon`, moves Modal to deprecated, adds `PageSection hasBodyWrapper={false}`, `Button size="sm"`, `Td hasAction`, formatting changes. Semver only removes `PageSection variant="light"`. Large scope divergence. |
| src/views/sources/viewSourcesList.tsx | Same pattern as viewCredentialsList: golden removes `EmptyStateHeader`/`EmptyStateIcon`, moves Modal to deprecated, removes `label` from selectOptions, adds `PageSection hasBodyWrapper={false}`, `Button size="sm"`, `Td hasAction`/`isActionCell` changes. Semver only removes `PageSection variant="light"`. |

### MEDIUM PRIORITY
| File | Reason |
|------|--------|
| src/components/contextIcon/contextIcon.tsx | Golden replaces `@patternfly/react-tokens` color tokens with PF6 `<Icon status="...">` wrapper pattern and removes the entire `ContextIconColors` type/object. Semver only renames token imports (`global_Color_dark_100`->`t_global_text_color_regular`, etc.) without structural changes. Different migration strategies for the same component. |
| src/components/viewLayout/viewLayout.tsx | Golden adds `MastheadLogo`, `PageToggleButton`, restructures Masthead hierarchy (wrapping Brand in MastheadLogo, replacing Button with PageToggleButton). Semver adds `PageBreadcrumb`, changes `header`->`masthead` prop, removes `theme="dark"` from Nav/PageSidebar, but does NOT add MastheadLogo/PageToggleButton. Both remove `theme="dark"`. |
| src/components/viewLayout/viewLayoutToolbar.css | Golden deletes the file entirely (replaced by Avatar component approach). Semver renames CSS variables (`pf-v5`->`pf-v6`) and class selectors. Structural divergence - golden eliminates the file, semver preserves it with renames. |
| src/views/notFound/notFound.tsx | Golden removes `EmptyStateHeader`/`EmptyStateIcon` imports, promotes `icon`/`titleText`/`headingLevel` to `EmptyState` props, adds `PageSection hasBodyWrapper={false}`. Semver does the same EmptyState refactor but keeps `PageSection` without `hasBodyWrapper`. Minor divergence. |
| src/views/scans/showAggregateReportModal.tsx | Golden moves Modal to `@patternfly/react-core/deprecated`, renames `pf-v5-u-mb-lg`->`pf-v6-u-mb-lg`. Semver adds `ModalHeader`/`ModalBody`/`ModalFooter` wrapper components (new composable Modal API) and restructures the Modal content. Different Modal migration strategies. |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/ToolbarBulkSelector.tsx | Both diffs are identical: `splitButtonOptions={{ items: [...] }}`->`splitButtonItems={[...]}`. Exact match. |

### LOW PRIORITY
| File | Reason |
|------|--------|
| src/components/aboutModal/aboutModal.tsx | Import path changes only: `TextContent`/`TextList`/`TextListItem` replaced with `Content` component. Both diffs are identical. |
| src/components/errorMessage/errorMessage.tsx | EmptyState refactor: both remove `EmptyStateIcon`, promote `icon` to `EmptyState` prop. Minor structural difference in how `titleText` is placed (golden uses `titleText` prop on EmptyState; semver wraps Title in EmptyStateBody). |
| src/vendor/react-table-batteries/components/ExtendedButton/__tests__/ExtendedButton.test.tsx | CSS class renames only: `pf-v5-c-button`->`pf-v6-c-button`. Golden also adds `async`/`await waitFor()` to test functions; semver only does class renames. |
| src/vendor/react-table-batteries/components/useTableWithBatteries.tsx | Golden renames `innerRef`->`ref` on Table component. Semver restructures to destructure children and pass as child element, keeps `innerRef`. Different approaches, small scope. |
| src/vendor/react-table-batteries/hooks/pagination/usePaginationPropHelpers.ts | Both diffs are identical: `alignRight`->`alignEnd`. Exact match. |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/SearchFilterControl.tsx | Both rename `chips`->`labels`, `deleteChip`->`deleteLabel`. Golden also moves SearchIcon to Button `icon` prop. Small prop renames. |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/select-overrides.css | Golden renames `pf-v5`->`pf-v6` in CSS selectors. Semver deletes the file entirely (removes the override). Small CSS file. |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/TableControls/NoDataEmptyState.tsx | EmptyState refactor: both remove `EmptyStateIcon`, promote `icon` to EmptyState prop. Golden uses `titleText` prop; semver wraps Title in EmptyStateBody. Minor structural difference. |
| src/vendor/react-table-batteries/tackle2-ui-legacy/components/TableControls/StateError.tsx | EmptyState refactor: both remove `EmptyStateIcon` and `global_danger_color_200` token. Golden uses `titleText` prop; semver wraps Title in EmptyStateBody. Minor structural difference. |
| src/views/sources/__tests__/addSourceModal.test.tsx | Test selector update: golden replaces `closest('.pf-v5-c-form__group').querySelector('.pf-v5-c-helper-text')` with `querySelector('#source-port-helper-text')`. Semver only renames `pf-v5`->`pf-v6` in selectors. |
| src/views/sources/showSourceConnectionsModal.css | CSS token renames: both rename `pf-v5`->`pf-v6` and `PaddingTop`->`PaddingBlockStart`. Golden also adds `PaddingBlockEnd`. |

## GOLDEN-ONLY Files
- src/app.css
- src/components/aboutModal/__tests__/__snapshots__/aboutModal.test.tsx.snap
- src/components/actionMenu/__tests__/__snapshots__/actionMenu.test.tsx.snap
- src/components/actionMenu/actionMenu.tsx
- src/components/contextIcon/__tests__/__snapshots__/contextIcon.test.tsx.snap
- src/components/errorMessage/__tests__/__snapshots__/errorMessage.test.tsx.snap
- src/components/simpleDropdown/__tests__/__snapshots__/simpleDropdown.test.tsx.snap
- src/components/simpleDropdown/simpleDropdown.tsx
- src/components/viewLayout/__tests__/__snapshots__/viewLayout.test.tsx.snap
- src/components/viewLayout/__tests__/__snapshots__/viewLayoutNavGroup.test.tsx.snap
- src/components/viewLayout/__tests__/__snapshots__/viewLayoutToolbar.test.tsx.snap
- src/components/viewLayout/__tests__/viewLayoutToolbarInteractions.test.tsx
- src/vendor/react-table-batteries/components/ExtendedButton/__tests__/__snapshots__/ExtendedButton.test.tsx.snap
- src/vendor/react-table-batteries/components/useTdWithBatteries.tsx
- src/vendor/react-table-batteries/components/useThWithBatteries.tsx
- src/vendor/react-table-batteries/components/useTrWithBatteries.tsx
- src/views/credentials/__tests__/__snapshots__/addCredentialModal.test.tsx.snap
- src/views/credentials/addCredentialModal.tsx
- src/views/notFound/__tests__/__snapshots__/notFound.test.tsx.snap
- src/views/scans/__tests__/__snapshots__/showAggregateReportModal.test.tsx.snap
- src/views/scans/__tests__/__snapshots__/showScansModal.test.tsx.snap
- src/views/scans/showScansModal.tsx
- src/views/sources/__tests__/__snapshots__/addSourceModal.test.tsx.snap
- src/views/sources/__tests__/__snapshots__/addSourcesScanModal.test.tsx.snap
- src/views/sources/__tests__/__snapshots__/showSourceConnectionsModal.test.tsx.snap
- src/views/sources/addSourceModal.tsx
- src/views/sources/addSourcesScanModal.tsx
- src/views/sources/showSourceConnectionsModal.tsx
- tests/__snapshots__/code.test.ts.snap
- tests/__snapshots__/dist.test.ts.snap

## AUTO-ONLY Files
(none)

## Summary
- OVERLAP: 27 files (25 code files + 2 package manifests)
  - HIGH: 7 files (Select/Dropdown rewrites, EmptyState+Modal+selectOptions+PageSection combined migrations)
  - MEDIUM: 6 files (Masthead/Nav restructuring, Modal migration strategy divergence, icon/token approach differences)
  - LOW: 11 files (CSS class renames, identical diffs, minor prop renames)
  - SKIPPED: 2 files (package.json, package-lock.json - dependency manifests)
  - Exact matches (identical diffs): 3 files (aboutModal.tsx, usePaginationPropHelpers.ts, ToolbarBulkSelector.tsx)
- GOLDEN-ONLY: 30 files (15 snapshot files, 8 component files, 4 test files, 2 build snapshot files, 1 CSS file)
- AUTO-ONLY: 0 files

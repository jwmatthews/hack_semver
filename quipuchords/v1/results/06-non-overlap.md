# GOLDEN-ONLY and AUTO-ONLY File Analysis

## AUTO-ONLY Files
(none -- semver-migrated produced no files that golden-source didn't also touch)

## GOLDEN-ONLY Files (Coverage Gaps)

### Snapshot Files (category analysis)

The 15 snapshot files are auto-generated test outputs that reflect the rendered DOM of components. They are NOT independent PF6 changes -- they are downstream reflections of source-level changes in component files. Specifically, the snapshot diffs show:

1. **CSS class prefix updates**: `pf-v5-*` classes becoming `pf-v6-*` classes in rendered HTML (e.g., `pf-v5-c-menu-toggle` to `pf-v6-c-menu-toggle`, `pf-v5-c-modal-box__title-text` to `pf-v6-c-modal-box__title-text`)
2. **OUIA component type version bumps**: `PF5/Dropdown` to `PF6/Dropdown`, `PF5/Button` to `PF6/Button`, etc.
3. **Structural changes from PF6 API changes**: e.g., `TextContent`/`TextList`/`TextListItem` becoming `Content`, `EmptyStateHeader`/`EmptyStateIcon` props being inlined into `EmptyState`, Button text now wrapped in `<span class="pf-v6-c-button__text">`, removal of `aria-disabled="false"` attribute
4. **Removed attributes**: `ariaLeftScroll`/`ariaRightScroll` removed from `NavList`, `theme="dark"` removed from `PageSidebar` and `Nav`
5. **Renamed props reflected in output**: `header` to `masthead` on Page, `alignRight` to `alignEnd`, `spacer` to `gap`

**Significance of semver-migrated missing them**: LOW individually. These will auto-regenerate when tests are run against the migrated source code. However, their absence indicates that the underlying component source changes were also missed, and running tests without updating both source and snapshots would cause test failures. The snapshots serve as a litmus test -- their staleness confirms the source-level coverage gaps documented below.

### Component Files

`src/components/actionMenu/actionMenu.tsx` *(not touched by semver-migrated)*
  What golden-source changed: Added `size` prop (with `'default' | 'sm'` type and default of `'default'`) to the ActionMenu component interface and passed it through to `MenuToggle`. Changed `data-ouia-component-id` to `ouiaId` on the MenuToggle.
  Significance of gap: MEDIUM
  Impact: degraded UI -- action menus in table rows would render at full size instead of compact `sm` size, looking oversized in table cells. The ouiaId change affects test selectors but not end-user functionality.

`src/components/simpleDropdown/simpleDropdown.tsx` *(not touched by semver-migrated)*
  What golden-source changed: Single-line change replacing `data-ouia-component-id={menuToggleOuiaId}` with `ouiaId={menuToggleOuiaId}` on the MenuToggle component. This is NOT a full Dropdown rewrite as initially suspected -- it is a minimal prop rename.
  Significance of gap: LOW
  Impact: cosmetic / test-only -- the `data-ouia-component-id` attribute may still work as a passthrough HTML attribute, but the canonical PF6 way is `ouiaId`. Mainly affects OUIA-based test selectors and automated testing frameworks.

`src/vendor/react-table-batteries/components/useTdWithBatteries.tsx` *(not touched by semver-migrated)*
  What golden-source changed: Renamed `innerRef` prop to `ref` on the `Td` component (PF6 removed the `innerRef` prop in favor of standard React `ref`).
  Significance of gap: HIGH
  Impact: visible breakage -- `innerRef` is no longer a valid prop on PF6's `Td` component. Passing it would be silently ignored, meaning any code relying on the ref to access the DOM element (e.g., for scrolling, focus management) would break. The ref would be `null`.

`src/vendor/react-table-batteries/components/useThWithBatteries.tsx` *(not touched by semver-migrated)*
  What golden-source changed: Renamed `innerRef` prop to `ref` on the `Th` component (same pattern as Td).
  Significance of gap: HIGH
  Impact: visible breakage -- same as useTdWithBatteries. `innerRef` is removed in PF6. Any ref-dependent behavior on table headers would fail silently.

`src/vendor/react-table-batteries/components/useTrWithBatteries.tsx` *(not touched by semver-migrated)*
  What golden-source changed: Renamed `innerRef` prop to `ref` on the `Tr` component (same pattern as Td/Th).
  Significance of gap: HIGH
  Impact: visible breakage -- same as useTd/useThWithBatteries. Table row refs would be broken.

`src/views/credentials/addCredentialModal.tsx` *(not touched by semver-migrated)*
  What golden-source changed: Moved `Modal` and `ModalVariant` imports from `@patternfly/react-core` to `@patternfly/react-core/deprecated`. This is required because PF6 moved the legacy Modal to a deprecated subpath.
  Significance of gap: HIGH
  Impact: visible breakage -- if `Modal` and `ModalVariant` are no longer exported from `@patternfly/react-core` in PF6, this import would fail at build time, preventing the credential modal from rendering at all.

`src/views/scans/showScansModal.tsx` *(not touched by semver-migrated)*
  What golden-source changed: (1) Moved `Modal`/`ModalVariant` imports to `@patternfly/react-core/deprecated`. (2) Removed `EmptyStateHeader` and `EmptyStateIcon` imports -- replaced with inline props on `EmptyState` (`headingLevel`, `icon`, `titleText` as direct props). This is the PF6 EmptyState API consolidation.
  Significance of gap: HIGH
  Impact: visible breakage -- both the Modal import path change and the EmptyState API change would cause build/runtime failures. `EmptyStateHeader` and `EmptyStateIcon` are removed in PF6.

`src/views/sources/addSourceModal.tsx` *(not touched by semver-migrated)*
  What golden-source changed: (1) Moved `Modal`/`ModalVariant` imports to `@patternfly/react-core/deprecated`. (2) Added `id="source-port-helper-text"` to `HelperText` components for accessibility linkage.
  Significance of gap: HIGH
  Impact: visible breakage for the Modal import issue. The HelperText id addition is a minor accessibility improvement (LOW impact on its own).

`src/views/sources/addSourcesScanModal.tsx` *(not touched by semver-migrated)*
  What golden-source changed: Moved `Modal`/`ModalVariant` imports from `@patternfly/react-core` to `@patternfly/react-core/deprecated`.
  Significance of gap: HIGH
  Impact: visible breakage -- same Modal import path issue as other modal files.

`src/views/sources/showSourceConnectionsModal.tsx` *(not touched by semver-migrated)*
  What golden-source changed: (1) Moved `Modal`/`ModalVariant` imports to `@patternfly/react-core/deprecated`. (2) Added `isExpandable` and `hasAnimations` props to the `Table` component.
  Significance of gap: HIGH
  Impact: visible breakage for the Modal import. The Table prop additions (`isExpandable`, `hasAnimations`) are PF6 requirements for expandable table behavior -- without them the expandable rows may not render or animate correctly.

### Test Files

`src/components/viewLayout/__tests__/viewLayoutToolbarInteractions.test.tsx` *(not touched by semver-migrated)*
  What golden-source changed: Rewrote test selectors to accommodate PF6 DOM changes: (1) replaced `document.querySelector('button[data-ouia-component-id="..."]')` with `screen.getAllByRole('button')` approach since OUIA IDs moved to the `ouiaId` prop, (2) added `waitFor()` calls for async dropdown rendering, (3) changed close button selector from `{ name: 'Close Dialog' }` to `{ name: /close/i }` to match PF6's AboutModal. This tests PF6-specific behavior.
  Significance of gap: MEDIUM
  Impact: test failures -- tests would fail under PF6 because they rely on PF5 DOM structure and OUIA attribute placement. No production breakage, but CI would fail.

`tests/__snapshots__/code.test.ts.snap` *(not touched by semver-migrated)*
  What golden-source changed: Updated line numbers in console.error location tracking snapshot to reflect code changes in view files (line shifts from import reorganization).
  Significance of gap: LOW
  Impact: test failure only -- this is a line-number tracking snapshot that would auto-update when re-generated.

`tests/__snapshots__/dist.test.ts.snap` *(not touched by semver-migrated)*
  What golden-source changed: Updated expected build distribution file list: PF6 ships different font files (fewer woff2 font files, different hashes). This reflects the PF6 CSS/font bundle changes.
  Significance of gap: LOW
  Impact: test failure only -- the dist snapshot test would fail because PF6 produces a different font bundle, but the application itself would work correctly.

### CSS Files

`src/app.css` *(not touched by semver-migrated)*
  What golden-source changed: Added 24 lines of PF6-specific CSS overrides: (1) Logo theming rules targeting `pf-v6-c-masthead__brand`, `pf-v6-c-about-modal-box__brand-image`, and `pf-v6-c-brand` with `filter: invert(1) brightness(1.2)` for light theme visibility. (2) Dark theme adjustments that remove the filter for `.pf-v6-theme-dark`. (3) About modal background image theming with `filter: none` for light and `filter: invert(1.5) contrast(1.2)` for dark theme.
  Significance of gap: MEDIUM
  Impact: degraded UI -- without these CSS rules, the application logo would likely be invisible or poorly contrasted against the PF6 masthead (PF6 changed masthead background colors). The about modal background would also display incorrectly. The app would be functionally usable but visually broken in the header/about areas.

### Coverage Gap Summary

- Total GOLDEN-ONLY files: 30
- High significance gaps: 8
- Would cause visible breakage: 8 (5 Modal import path failures, 3 Table innerRef->ref failures)
- Key missing migrations:
  1. **Modal -> deprecated path** (5 GOLDEN-ONLY files): `addCredentialModal.tsx`, `showScansModal.tsx`, `addSourceModal.tsx`, `addSourcesScanModal.tsx`, `showSourceConnectionsModal.tsx` -- PF6 moved Modal to `@patternfly/react-core/deprecated`. This is the single most impactful gap: these modal dialogs would fail to build.
  2. **Table component innerRef -> ref** (3 files): `useTdWithBatteries.tsx`, `useThWithBatteries.tsx`, `useTrWithBatteries.tsx` -- PF6 removed the `innerRef` prop on Table subcomponents. All table ref forwarding is broken.
  3. **EmptyState API consolidation** (multiple view files): `EmptyStateHeader`/`EmptyStateIcon` removed in favor of props on `EmptyState`. Affects `showScansModal.tsx` and related view files.
  4. **PF6 CSS class prefix in app.css**: Logo/branding visibility depends on `pf-v6-*` selectors that were never added.
  5. **data-ouia-component-id -> ouiaId**: Multiple components still use the HTML attribute passthrough instead of the PF6 `ouiaId` prop, affecting test infrastructure.
  6. **ActionMenu size prop**: Missing `size="sm"` support causes oversized action menus in table rows.

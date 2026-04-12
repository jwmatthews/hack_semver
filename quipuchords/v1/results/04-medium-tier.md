# MEDIUM Priority File Analysis

---

## File 1

```
─────────────────────────────────────────────
`src/components/contextIcon/contextIcon.tsx`  [MEDIUM PRIORITY]
─────────────────────────────────────────────

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes — PF5 token renames (global_Color_dark_100 → t_global_text_color_regular, etc.)
  Semantic changes present:    no in semver-migrated; yes in golden-source (restructured from inline color props to <Icon status="..."> wrapper pattern)

CRITERIA ASSESSMENT (5 criteria):

  1. Import correctness
     SEMVER-MIGRATED: Keeps `@patternfly/react-tokens` import but renames the four token
     names to their PF6 equivalents (t_global_text_color_regular, t_global_color_status_success_default,
     t_global_color_status_warning_default, t_global_color_status_danger_default). Does NOT import
     `Icon` from @patternfly/react-core (which golden-source adds).
     GOLDEN-SOURCE: Removes @patternfly/react-tokens entirely; adds `Icon` from @patternfly/react-core.
     [MEDIUM CONFIDENCE] — semver-migrated token names are plausible PF6 renames but the golden-source
     chose to eliminate tokens entirely, using <Icon status="..."> instead.

  2. Component API alignment
     SEMVER-MIGRATED: Retains the PF5 pattern of passing `{ color: <token>.value }` as a prop spread
     onto icons (e.g., `<ExclamationCircleIcon {...{ ...{ color: red.value }, ...props }} />`).
     This pattern is preserved unchanged in JSX — only the token variable binding changes.
     GOLDEN-SOURCE: Replaces all color-prop icon usages with `<Icon status="danger|warning|success">`.
     Replaces `<Spinner size={size} {...props} />` with `<Icon size={size} isInline><Spinner /></Icon>`.
     Removes `ContextIconColors` export entirely.
     [HIGH CONFIDENCE — verified by reading both diffs]

  3. Half-migration risk ⚠️ ELEVATED
     YES — The semver-migrated version renames tokens to PF6 equivalents but continues using
     the PF5 icon-coloring pattern (inline `color` prop). In PF6, the recommended approach is
     the `<Icon status="...">` wrapper. The renamed tokens may resolve at runtime, but this is
     a half-migration: PF6 tokens + PF5 API pattern.
     Additionally, `ContextIconColors` is still exported in semver-migrated but removed in golden-source.

  4. Correctness risk (RISK LEVEL: MEDIUM)
     The token renames are likely valid and icons will probably render with correct colors.
     However, the PF6 `<Icon>` wrapper approach is the canonical pattern, and custom `color`
     props may interact poorly with PF6 theming (e.g., dark mode). The `Spinner` in particular
     may have changed its `size` prop behavior in PF6.
     No build-breaking issues expected, but visual/behavioral deviations possible.

  5. Completeness vs. golden-source (DIVERGENT)
     Golden-source: removes token imports, adds Icon wrapper, restructures 6 icon cases,
     removes ContextIconColors export.
     Semver-migrated: only renames 4 token imports, zero JSX changes.
     The approach is fundamentally different.

DEVELOPER UTILITY VERDICT:
  Costs time — Developer must redo this file almost entirely to match PF6 best practice.
  The token rename provides marginal value. The missing <Icon status="..."> restructuring
  is the bulk of the work, and is not started.

IF RISK LEVEL IS HIGH — REQUIRED FIX:
  N/A (MEDIUM risk — no mandatory fix, but recommended: adopt <Icon status="..."> pattern
  and remove ContextIconColors export as golden-source does).
```

---

## File 2

```
─────────────────────────────────────────────
`src/components/viewLayout/viewLayout.tsx`  [MEDIUM PRIORITY]
─────────────────────────────────────────────

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes — `header=` → `masthead=` prop rename on <Page>,
                               `theme="dark"` removal from <Nav> and <PageSidebar>
  Semantic changes present:    yes in golden-source (Masthead restructure with MastheadLogo,
                               PageToggleButton, BarsIcon removal); partially in semver-migrated
                               (routes.map → routes.filter().map, PageBreadcrumb addition)

CRITERIA ASSESSMENT (5 criteria):

  1. Import correctness
     SEMVER-MIGRATED: Adds `PageBreadcrumb` import. Does NOT add `MastheadLogo`, `PageToggleButton`,
     or `MastheadBrand` restructuring. Does NOT remove `Button` or `BarsIcon` imports.
     GOLDEN-SOURCE: Removes `Button` import, adds `MastheadLogo`, `PageToggleButton`, restructures
     `MastheadBrand`; removes `BarsIcon` import from @patternfly/react-icons.
     [HIGH CONFIDENCE — verified by reading both diffs]

  2. Component API alignment
     SEMVER-MIGRATED: Correctly changes `header={Header}` → `masthead={Header}` on <Page>.
     Correctly removes `theme="dark"` from <Nav> and <PageSidebar>. These are valid PF6 changes.
     However, the Masthead internals are LEFT UNCHANGED — still uses the PF5 pattern with
     `<Button variant="plain">` wrapping `<BarsIcon />` inside `<MastheadToggle>`.
     GOLDEN-SOURCE: Restructures to `<MastheadMain>` → `<MastheadToggle>` → `<PageToggleButton>`
     and `<MastheadBrand>` → `<MastheadLogo>` → `<Brand>`.
     [HIGH CONFIDENCE]

  3. Half-migration risk ⚠️ ELEVATED
     YES — The semver-migrated version has a clear half-migration:
     - `masthead` prop: migrated (correct)
     - `theme` removal: migrated (correct)
     - Masthead internal composition (MastheadToggle/MastheadBrand/MastheadLogo/PageToggleButton):
       NOT migrated. Still uses PF5 `<Button variant="plain"><BarsIcon /></Button>` pattern.
     This is a moderate/high-complexity change per the reference.

     Additional semver-migrated-only changes:
     - Adds `<PageBreadcrumb />` (empty, no content) — not present in golden-source
     - Changes `routes.map((route, idx) => route.label && ...)` to `routes.filter(route => route.label).map(...)` — this is a non-PF6 logic change, not present in golden-source. Not penalized but noted.

  4. Correctness risk (RISK LEVEL: MEDIUM)
     The Masthead internals using PF5 Button+BarsIcon may cause runtime warnings or visual
     issues in PF6. The `<PageBreadcrumb />` addition renders an empty breadcrumb container
     which may add unwanted whitespace. The `header` → `masthead` and `theme` removals are
     correct and safe.

  5. Completeness vs. golden-source (SUBSET + DIVERGENT)
     Subset: Missing Masthead restructuring (MastheadLogo, PageToggleButton).
     Divergent: Adds PageBreadcrumb (not in golden-source), adds routes.filter() change
     (non-PF6, not in golden-source).

DEVELOPER UTILITY VERDICT:
  Roughly equivalent — The mechanical changes (masthead prop, theme removal) save a small
  amount of time. But the missing Masthead restructuring is the main work item, and the
  extraneous PageBreadcrumb addition needs to be removed. Net: slight time savings but
  developer must still do the complex restructuring.
```

---

## File 3

```
─────────────────────────────────────────────
`src/components/viewLayout/viewLayoutToolbar.css`  [MEDIUM PRIORITY]
─────────────────────────────────────────────

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes — CSS token rename (--pf-v5-* → --pf-t--global--*),
                               CSS class rename (pf-v5-c-avatar → pf-v6-c-avatar)
  Semantic changes present:    no in semver-migrated; yes in golden-source (file deleted entirely)

CRITERIA ASSESSMENT (5 criteria):

  1. Import correctness
     N/A — CSS file, no JS imports.

  2. Component API alignment
     SEMVER-MIGRATED: Updates `--pf-v5-global--spacer--sm` → `--pf-t--global--spacer--200`
     and `.pf-v5-c-avatar` → `.pf-v6-c-avatar`. These are valid PF6 CSS token renames.
     GOLDEN-SOURCE: Deletes the file entirely. The golden-source moves avatar styling
     to use the PF6 `<Avatar>` component with `src` prop instead of CSS background-image.

  3. Half-migration risk ⚠️ ELEVATED
     YES — The semver-migrated version correctly renames tokens within a file that the
     golden-source eliminates. The CSS is migrated but the overall approach is wrong because
     golden-source uses the `<Avatar>` component directly, making this CSS file unnecessary.
     This couples with the viewLayoutToolbar.tsx analysis — the semver-migrated toolbar still
     uses the CSS-background-image avatar approach while golden-source uses `<Avatar src={...}>`.

  4. Correctness risk (RISK LEVEL: LOW)
     The CSS token renames are valid and will work at runtime. No breakage expected. However
     this file should ultimately be deleted per the golden-source approach.

  5. Completeness vs. golden-source (DIVERGENT)
     Golden-source deletes the file; semver-migrated preserves and updates it.
     Functionally different end states.

DEVELOPER UTILITY VERDICT:
  Costs time — Developer will need to delete this file (as golden-source does), so the
  CSS token renames are wasted effort that must be undone.
```

---

## File 4

```
─────────────────────────────────────────────
`src/views/notFound/notFound.tsx`  [MEDIUM PRIORITY]
─────────────────────────────────────────────

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes — EmptyState API migration (remove EmptyStateHeader/EmptyStateIcon,
                               move props to EmptyState directly)
  Semantic changes present:    no (both diffs make the same structural change)

CRITERIA ASSESSMENT (5 criteria):

  1. Import correctness
     SEMVER-MIGRATED: Removes `EmptyStateHeader` and `EmptyStateIcon` imports. Keeps
     `Button, EmptyState, EmptyStateBody, EmptyStateFooter, PageSection`.
     GOLDEN-SOURCE: Same removals. Additionally removes the unused curly-brace multiline
     import format to single line.
     Both are correct. [HIGH CONFIDENCE — verified by reading both diffs]

  2. Component API alignment
     SEMVER-MIGRATED: Moves `titleText`, `icon`, `headingLevel` from `<EmptyStateHeader>` to
     `<EmptyState>` as direct props. Uses `icon={ExclamationTriangleIcon}` (component reference,
     not JSX element). This matches PF6 API.
     GOLDEN-SOURCE: Same API changes. Additionally adds `hasBodyWrapper={false}` to `<PageSection>`.
     Both use the correct PF6 EmptyState pattern.
     [HIGH CONFIDENCE]

  3. Half-migration risk ⚠️ ELEVATED
     NO — The EmptyState migration is complete in semver-migrated. No PF5 remnants remain.
     The only difference is the missing `hasBodyWrapper={false}` on PageSection.

  4. Correctness risk (RISK LEVEL: LOW)
     The EmptyState migration is correct. The missing `hasBodyWrapper={false}` on <PageSection>
     is a minor difference — in PF6, PageSection default body wrapper behavior changed,
     but this won't cause errors, only potentially minor layout differences.

  5. Completeness vs. golden-source (SUBSET)
     Missing: `hasBodyWrapper={false}` on <PageSection> (golden-source adds this).
     Otherwise equivalent.

DEVELOPER UTILITY VERDICT:
  Saves time — The core EmptyState migration is done correctly. Developer only needs to
  optionally add `hasBodyWrapper={false}` to PageSection, which is a trivial one-line change.
```

---

## File 5

```
─────────────────────────────────────────────
`src/views/scans/showAggregateReportModal.tsx`  [MEDIUM PRIORITY]
─────────────────────────────────────────────

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes — CSS class rename (pf-v5-u-mb-lg → pf-v6-u-mb-lg)
  Semantic changes present:    yes — Modal API migration (both diffs address this differently)

CRITERIA ASSESSMENT (5 criteria):

  1. Import correctness
     SEMVER-MIGRATED: Adds `ModalBody`, `ModalFooter`, `ModalHeader` imports from
     `@patternfly/react-core`. Keeps `Modal` and `ModalVariant` in main @patternfly/react-core.
     GOLDEN-SOURCE: Moves `Modal` and `ModalVariant` to `@patternfly/react-core/deprecated`.
     Does NOT add ModalBody/ModalFooter/ModalHeader.
     [HIGH CONFIDENCE — verified by reading both diffs]
     These represent two different valid PF6 migration strategies:
     - Semver-migrated: migrates to PF6 new Modal composition API (ModalHeader, ModalBody, ModalFooter)
     - Golden-source: uses PF6's deprecated compatibility shim

  2. Component API alignment
     SEMVER-MIGRATED: Restructures Modal to use new composition pattern:
     - Removes `title` prop from <Modal>
     - Adds `<ModalHeader title="..." />`
     - Wraps content in `<ModalBody>`
     - Converts `actions` prop to `<ModalFooter>{actions}</ModalFooter>`
     - Updates CSS class `pf-v5-u-mb-lg` → `pf-v6-u-mb-lg`
     This is the PF6-forward approach.

     GOLDEN-SOURCE: Keeps the old Modal prop-based API but imports from deprecated path.
     Only changes the CSS utility class `pf-v5-u-mb-lg` → `pf-v6-u-mb-lg`.

     [HIGH CONFIDENCE]

  3. Half-migration risk ⚠️ ELEVATED
     NO — semver-migrated is fully migrated to the new Modal API. No PF5 remnants.
     In fact, semver-migrated is MORE migrated than golden-source here.

  4. Correctness risk (RISK LEVEL: LOW)
     The new Modal composition API is the canonical PF6 approach. The semver-migrated version
     correctly uses ModalHeader/ModalBody/ModalFooter. The `actions` → `<ModalFooter>` conversion
     looks correct (conditional rendering with `{actions && <ModalFooter>{actions}</ModalFooter>}`).
     The `onClose` callback removal from Modal props and handling appears consistent.

  5. Completeness vs. golden-source (SUPERSET)
     The semver-migrated version is MORE complete than golden-source. It migrates to the
     new Modal API while golden-source only moves to the deprecated compatibility path.
     If the project intends to eventually use the new Modal API, semver-migrated is ahead.

DEVELOPER UTILITY VERDICT:
  Saves time — The semver-migrated version performs a more thorough migration than golden-source.
  If the goal is eventual PF6 best practice, this is better. However, if the developer wants
  to match golden-source exactly (using deprecated Modal), they'd need to revert this, which
  would cost time. Net: saves time for forward-looking migration.
```

---

## File 6

```
─────────────────────────────────────────────
`src/vendor/react-table-batteries/tackle2-ui-legacy/components/ToolbarBulkSelector.tsx`  [MEDIUM PRIORITY]
─────────────────────────────────────────────

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes — MenuToggle splitButtonOptions API change
  Semantic changes present:    no

CRITERIA ASSESSMENT (5 criteria):

  1. Import correctness
     No import changes in either diff for this file. Both diffs only modify JSX props.
     [HIGH CONFIDENCE]

  2. Component API alignment
     SEMVER-MIGRATED: Changes `splitButtonOptions={{ items: [...] }}` → `splitButtonItems={[...]}`.
     GOLDEN-SOURCE: Identical change — `splitButtonOptions={{ items: [...] }}` → `splitButtonItems={[...]}`.
     Both diffs produce exactly the same result.
     [HIGH CONFIDENCE — verified by reading both diffs line by line; the hunks are identical]

  3. Half-migration risk ⚠️ ELEVATED
     NO — The change is complete and identical between both versions. No PF5 remnants.

  4. Correctness risk (RISK LEVEL: NONE)
     Identical to golden-source. The `splitButtonItems` prop is the correct PF6 API for
     MenuToggle split button.

  5. Completeness vs. golden-source (EQUIVALENT)
     The changes are identical.

DEVELOPER UTILITY VERDICT:
  Saves time — This change is done correctly and identically to the golden-source.
  No developer intervention needed for this file.
```

---

## Mini-Checkpoint

- Evidence cited for all positive verdicts: **Yes** — each assessment references specific diff lines, prop names, import changes, and component patterns verified by reading both diff files.
- Specific fix described for all HIGH risk: **N/A** — no files received HIGH risk rating. The highest rating was MEDIUM (contextIcon.tsx and viewLayout.tsx), for which recommended (not required) remediation is described.

### Summary Table

| File | Risk Level | Completeness | Verdict |
|------|-----------|-------------|---------|
| contextIcon.tsx | MEDIUM | DIVERGENT | Costs time |
| viewLayout.tsx | MEDIUM | SUBSET+DIVERGENT | Roughly equivalent |
| viewLayoutToolbar.css | LOW | DIVERGENT | Costs time |
| notFound.tsx | LOW | SUBSET | Saves time |
| showAggregateReportModal.tsx | LOW | SUPERSET | Saves time |
| ToolbarBulkSelector.tsx | NONE | EQUIVALENT | Saves time |

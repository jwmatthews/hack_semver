# PF6 Migration Automation — Detailed Gap Analysis

---

## Section A: BREAKAGE Findings

---

### `src/components/viewLayout/viewLayoutToolbar.tsx` [BREAKAGE] [HIGH CONFIDENCE]

**What the automation did:**

PR/5 made several changes to this file:
- Renamed `spacer` prop to `gap` (correct prop rename)
- Removed `variant="icon-button-group"` from ToolbarGroup (correct)
- Updated CSS class references `pf-v5-theme-dark` → `pf-v6-theme-dark` and `pf-v5-c-avatar` → `pf-v6-c-avatar` (correct)
- Added imports for `ToolbarExpandIconWrapper` and `ToolbarToggleGroup` (incorrect — these were unused)

However, PR/5 **failed to update the prop values** when renaming `spacer` to `gap`, and **failed to update** `alignRight`:

```tsx
// PR/5 produced this (BROKEN):
<ToolbarGroup
  align={{ default: 'alignRight' }}
  gap={{ default: 'spacerNone', md: 'spacerMd' }}
>
```

**What was actually needed:**

```tsx
// PR/6 corrected to:
<ToolbarGroup align={{ default: 'alignEnd' }} gap={{ default: 'gapNone', md: 'gapMd' }}>
```

Additionally, PR/6 made three more fixes the automation missed entirely:

1. **DropdownList wrapper** — PF6 requires `<DropdownItem>` children to be wrapped in `<DropdownList>`:
```tsx
// Before (PR/5 left as-is):
<Dropdown ...>
  <DropdownItem onClick={onAbout} value="about">About</DropdownItem>
</Dropdown>

// After (PR/6):
<Dropdown ...>
  <DropdownList>
    <DropdownItem onClick={onAbout} value="about">About</DropdownItem>
  </DropdownList>
</Dropdown>
```

2. **`data-ouia-component-id` → `ouiaId`** — PF6's MenuToggle uses `useOUIAProps` internally, overriding raw HTML data attributes:
```tsx
// Before (PR/5 left as-is):
<MenuToggle data-ouia-component-id="help_menu_toggle">

// After (PR/6):
<MenuToggle ouiaId="help_menu_toggle">
```

3. **Unused imports removed** — PR/5 added `ToolbarExpandIconWrapper` and `ToolbarToggleGroup` imports that were never used, causing lint failures.

**Developer reference (PR/664):**
PR/664 made the same corrections — `alignEnd`, `gapNone`/`gapMd`, `DropdownList` wrapper, `ouiaId` prop, and no unused imports.

**Impact:** 3 TS2322 build errors. DropdownList omission caused silent rendering failure (menu items don't appear). OUIA ID issue broke test selectors.

---

## Section B: INCOMPLETE Findings

---

### `src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/MultiselectFilterControl.tsx` [INCOMPLETE] [HIGH CONFIDENCE]

**What the automation did:**

PR/5 renamed ToolbarFilter props:
```tsx
// PR/5 changed:
chips={chips} → labels={chips}
deleteChip={(_, chip) => ...} → deleteLabel={(_, chip) => ...}
```

But PR/5 **left the deprecated Select imports completely untouched**:
```tsx
// Still importing from deprecated path after PR/5:
import { Select, SelectOption, SelectOptionObject, SelectVariant, SelectProps } from '@patternfly/react-core/deprecated';
```

**What was actually needed:**

PR/6 performed a complete rewrite — replacing the entire deprecated Select with PF6's composition-based Select:
```tsx
// PR/6 imports:
import { MenuToggle, MenuSearch, MenuSearchInput, SearchInput, Select, SelectList, SelectOption, ToolbarFilter } from '@patternfly/react-core';

// PR/6 replaced the PF5 Select:
<Select
  isOpen={isFilterDropdownOpen}
  onSelect={onFilterSelect}
  onOpenChange={setIsFilterDropdownOpen}
  toggle={toggleRef => (
    <MenuToggle ref={toggleRef} onClick={...} isExpanded={isFilterDropdownOpen}>
      {placeholderText}
    </MenuToggle>
  )}
>
  <MenuSearch>
    <MenuSearchInput>
      <SearchInput value={filterInput} onChange={...} onClear={...} />
    </MenuSearchInput>
  </MenuSearch>
  <SelectList>
    {filteredOptions.map(opt => (
      <SelectOption key={opt.key} value={opt.value} hasCheckbox isSelected={...}>
        {opt.value?.toString()}
      </SelectOption>
    ))}
  </SelectList>
</Select>
```

This also required rewriting `onFilterSelect` to use the new signature `(_event, value)`, removing `SelectOptionObject` types, and managing filter state with a local `filterInput` state variable.

**Developer reference (PR/664):**
PR/664 performed a similar complete rewrite with the same composition pattern.

**Impact:** 5 TS2305 build errors — `@patternfly/react-core/deprecated` no longer exports Select, SelectOption, SelectOptionObject, SelectVariant, or SelectProps in PF6.

---

### `src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/SelectFilterControl.tsx` [INCOMPLETE] [HIGH CONFIDENCE]

**What the automation did:**

Same as MultiselectFilterControl — PR/5 renamed `chips`→`labels` and `deleteChip`→`deleteLabel` on ToolbarFilter but left the deprecated Select imports.

**What was actually needed:**

PR/6 rewrote the component to use PF6's composition-based Select with MenuToggle, SelectList, and SelectOption:
```tsx
// PR/6:
import { MenuToggle, Select, SelectList, SelectOption, ToolbarFilter } from '@patternfly/react-core';

<Select
  isOpen={isFilterDropdownOpen}
  onSelect={onFilterSelect}
  onOpenChange={setIsFilterDropdownOpen}
  selected={selections?.[0]}
  toggle={toggleRef => (
    <MenuToggle ref={toggleRef} onClick={...} isExpanded={isFilterDropdownOpen}>
      {selections?.[0]?.toString() || 'Any'}
    </MenuToggle>
  )}
>
  <SelectList>
    {category.selectOptions.map(opt => (
      <SelectOption key={opt.key} value={opt.value}>{opt.value?.toString()}</SelectOption>
    ))}
  </SelectList>
</Select>
```

**Impact:** 3 TS2305 build errors.

---

### `src/views/credentials/viewCredentialsList.tsx` [INCOMPLETE] [HIGH CONFIDENCE]

**What the automation did:**

PR/5 removed `PageSection variant="light"` (changed to just `<PageSection>`). This is correct — PF6 removed the `light` variant.

**What was actually needed:**

PR/6 made three additional fixes:

1. **EmptyState consolidation** — removed `EmptyStateHeader`/`EmptyStateIcon`, promoted props to `EmptyState`:
```tsx
// Before (after PR/5):
<EmptyState>
  <EmptyStateHeader headingLevel="h4" titleText={...} icon={<EmptyStateIcon icon={PlusCircleIcon} />} />
  ...
</EmptyState>

// After (PR/6):
<EmptyState headingLevel="h4" titleText={...} icon={PlusCircleIcon}>
  ...
</EmptyState>
```

2. **Modal `title`→`ModalHeader`:**
```tsx
// Before: <Modal title={...} ...>
// After:  <Modal ...><ModalHeader title={...} />
```

3. **Modal `actions`→`ModalFooter`:**
```tsx
// Before: <Modal actions={[<Button>...</Button>]} ...>content</Modal>
// After:  <Modal ...><ModalHeader .../> content <ModalFooter><Button>...</Button></ModalFooter></Modal>
```

**Impact:** 2 TS2305 (EmptyStateHeader, EmptyStateIcon not exported), 2 TS2322 (Modal `actions` prop removed). Runtime regression — modal titles invisible.

---

### `src/views/scans/viewScansList.tsx` [INCOMPLETE] [HIGH CONFIDENCE]

**What the automation did:**

PR/5 removed `PageSection variant="light"` only.

**What was actually needed:**

PR/6 made the same three fixes as viewCredentialsList: EmptyState consolidation, Modal `title`→`ModalHeader`, Modal `actions`→`ModalFooter`. Two separate modals required restructuring (sources modal and delete confirmation modal).

**Impact:** 2 TS2305, 4 TS2322 build errors. Runtime regression — modal titles invisible.

---

### `src/views/sources/viewSourcesList.tsx` [INCOMPLETE] [HIGH CONFIDENCE]

**What the automation did:**

PR/5 removed `PageSection variant="light"` only.

**What was actually needed:**

PR/6 made the same three fixes: EmptyState consolidation, Modal `title`→`ModalHeader`, Modal `actions`→`ModalFooter`. Two modals required restructuring (credentials modal and delete confirmation modal).

**Impact:** 2 TS2305, 4 TS2322 build errors. Runtime regression — modal titles invisible.

---

## Section C: MISS Findings

---

### `src/views/credentials/addCredentialModal.tsx` [MISS] [HIGH CONFIDENCE]

**What the automation did:** Did not touch this file.

**What was actually needed:**

PR/6 replaced Modal `title` prop with `ModalHeader` child:
```tsx
// Before:
<Modal variant={ModalVariant.small} title={titleExpression} isOpen={isOpen} onClose={() => onClose()}>

// After:
<Modal variant={ModalVariant.small} isOpen={isOpen} onClose={() => onClose()}>
  <ModalHeader title={titleExpression} />
```

Added `ModalHeader` to the import statement.

**Impact:** Runtime regression — modal title renders as an HTML `title` attribute (tooltip) instead of a visible heading. No build error, but functionally broken.

---

### `src/views/scans/showScansModal.tsx` [MISS] [HIGH CONFIDENCE]

**What the automation did:** Did not touch this file.

**What was actually needed:**

PR/6 made three changes:

1. **EmptyState consolidation:**
```tsx
// Before:
<EmptyState>
  <EmptyStateHeader titleText="Loading scans" headingLevel="h2" icon={<EmptyStateIcon icon={Spinner} />} />
</EmptyState>

// After:
<EmptyState titleText="Loading scans" headingLevel="h2" icon={Spinner} />
```

2. **Modal `title`→`ModalHeader`**
3. **Modal `actions`→`ModalFooter`:**
```tsx
// Before: <Modal ... {...(actions && { actions })}>
// After:  <Modal ...><ModalHeader .../> ... {actions && <ModalFooter>{actions}</ModalFooter>}</Modal>
```

**Impact:** 2 TS2305 build errors (EmptyStateHeader, EmptyStateIcon). Runtime regression — invisible modal title.

---

### `src/views/sources/addSourceModal.tsx` [MISS] [HIGH CONFIDENCE]

**What the automation did:** Did not touch this file.

**What was actually needed:**

PR/6 replaced Modal `title` with `ModalHeader` child. Same pattern as addCredentialModal.

**Impact:** Runtime regression — invisible modal title.

---

### `src/views/sources/addSourcesScanModal.tsx` [MISS] [HIGH CONFIDENCE]

**What the automation did:** Did not touch this file.

**What was actually needed:**

PR/6 replaced Modal `title` with `ModalHeader` child:
```tsx
// Before:
<Modal variant={ModalVariant.small} title="Scan" isOpen={isOpen} onClose={() => onCloseModal()}>

// After:
<Modal variant={ModalVariant.small} isOpen={isOpen} onClose={() => onCloseModal()}>
  <ModalHeader title="Scan" />
```

**Impact:** Runtime regression — invisible modal title.

---

### `src/views/sources/showSourceConnectionsModal.tsx` [MISS] [HIGH CONFIDENCE]

**What the automation did:** Did not touch this file.

**What was actually needed:**

PR/6 made two changes:
1. Modal `title`→`ModalHeader`
2. Modal `actions`→`ModalFooter` — moved the Close button from the `actions` array into a `<ModalFooter>` child.

**Code evidence:**
```tsx
// Before:
<Modal variant={ModalVariant.small} title={source?.name} isOpen={isOpen}
  onClose={...} actions={[<Button key="cancel" variant="secondary" onClick={...}>Close</Button>]}>

// After:
<Modal variant={ModalVariant.small} isOpen={isOpen} onClose={...}>
  <ModalHeader title={source?.name} />
  <Table ...> ... </Table>
  <ModalFooter>
    <Button key="cancel" variant="secondary" onClick={...}>Close</Button>
  </ModalFooter>
</Modal>
```

**Impact:** TS2322 build error (`actions` prop removed). Runtime regression — invisible modal title.

---

### `src/components/viewLayout/__tests__/viewLayoutToolbarInteractions.test.tsx` [MISS] [HIGH CONFIDENCE]

**What the automation did:** Did not touch this file.

**What was actually needed:**

PR/6 fixed three test interaction issues caused by PF6's behavioral changes:

1. **PF6 Popper portal rendering** — Changed from `userEvent.click()` to `fireEvent.click()` wrapped in `act()` to avoid race conditions with Dropdown's internal window click handler:
```tsx
// Before:
await user.click(document.querySelector('button[data-ouia-component-id="help_menu_toggle"]')!);

// After:
const helpToggle = document.querySelector('[data-ouia-component-id="help_menu_toggle"]');
expect(helpToggle).not.toBeNull();
await act(async () => { fireEvent.click(helpToggle!); });
```

2. **OUIA ID selectors** — Changed user dropdown selector from OUIA-based to content-based:
```tsx
// Before:
await user.click(document.querySelector('button[data-ouia-component-id="user_dropdown_button"]')!);

// After:
const userNameElement = screen.getByText('Dolor sit');
const userToggle = userNameElement.closest('button');
```

3. **Added `fireEvent` import** from `@testing-library/react`.

**Impact:** 3 test failures — dropdown menu items not found, click events not firing.

---

## Section D: Quality Sweep Findings (Phase 2)

These are files changed in PR/5 that PR/6 did NOT touch — meaning the automation's changes compile and pass tests. Each is compared against PR/664 (developer reference).

---

### `src/components/errorMessage/errorMessage.tsx` [NON-IDIOMATIC] [HIGH CONFIDENCE]

**What the automation did:** Promoted `icon` from `<EmptyStateIcon icon={X} />` to `<EmptyState icon={X}>` (correct). But kept `<Title>` as a child wrapped in an extra `<EmptyStateBody>` instead of using EmptyState's `titleText` prop.

**Code produced by PR/5:**
```tsx
<EmptyState variant={EmptyStateVariant.full} icon={ExclamationCircleIcon}>
  <EmptyStateBody>
    <Title headingLevel="h2" size="lg">{title || ...}</Title>
  </EmptyStateBody>
  <EmptyStateBody>{description || ...}</EmptyStateBody>
</EmptyState>
```

**Developer reference (PR/664):** Used `titleText` and `icon` as direct props on EmptyState, removed `EmptyStateIcon`, no Title wrapper:
```tsx
<EmptyState variant={EmptyStateVariant.full} icon={ExclamationCircleIcon}
  titleText={title || ...} headingLevel="h2">
  <EmptyStateBody>{description || ...}</EmptyStateBody>
</EmptyState>
```

**Why it matters:** Creates two `<EmptyStateBody>` elements and doesn't use PF6's built-in title rendering. The `titleText` prop is the recommended PF6 pattern.

---

### `src/vendor/react-table-batteries/tackle2-ui-legacy/components/TableControls/NoDataEmptyState.tsx` [NON-IDIOMATIC] [HIGH CONFIDENCE]

Same issue as errorMessage.tsx — icon promoted correctly but `<Title>` in `<EmptyStateBody>` instead of `titleText` prop. PR/664 used `titleText` directly (though with some formatting issues of its own).

---

### `src/vendor/react-table-batteries/tackle2-ui-legacy/components/TableControls/StateError.tsx` [NON-IDIOMATIC] [HIGH CONFIDENCE]

Same Title-in-EmptyStateBody pattern. Additionally, the automation correctly removed the `globalDangerColor200` token and `color` prop from EmptyStateIcon. However, PR/664 also removed the color but did not replace it with an `<Icon status="danger">` wrapper, meaning the error icon loses its red color in both approaches — a potential UX regression worth reviewing.

---

### `src/components/typeAheadCheckboxes/typeaheadCheckboxes.tsx` [DIVERGENT] [MEDIUM CONFIDENCE]

**What the automation did:** Wrapped `<TextInputGroupMain>` inside a `<TextInputGroupUtilities>`:
```tsx
<TextInputGroup isPlain>
  <TextInputGroupUtilities>     {/* ← automation added this wrapper */}
    <TextInputGroupMain ... />
  </TextInputGroupUtilities>
  <TextInputGroupUtilities>    {/* ← original utilities for clear button */}
    ...
  </TextInputGroupUtilities>
</TextInputGroup>
```

**Developer reference (PR/664):** Did NOT wrap TextInputGroupMain. Instead made three different changes: `innerRef`→`ref` on MenuToggle and TextInputGroupMain, `data-ouia-component-id`→`ouiaId` on MenuToggle, moved `<TimesIcon>` from Button children to the `icon` prop.

**Assessment:** PR/5 and PR/664 made completely different changes to this file. The automation's TextInputGroupUtilities wrapping is not part of the standard PF6 migration and may cause layout issues. PR/664's changes (ref rename, ouiaId, icon prop) are standard PF6 renames that PR/5 missed entirely. Flag for manual review — the automation's wrapper should likely be reverted and PR/664's changes applied instead.

---

### `src/components/contextIcon/contextIcon.tsx` [DIVERGENT] [MEDIUM CONFIDENCE]

**What the automation did:** Renamed PF5 design tokens to PF6 equivalents:
```tsx
// PR/5:
import { t_global_text_color_regular as gray, t_global_color_status_success_default as green, ... } from '@patternfly/react-tokens';
```

**Developer reference (PR/664):** Took a fundamentally different approach — removed `@patternfly/react-tokens` imports entirely and replaced inline `color` props with PF6's `<Icon status="danger|warning|success">` wrapper component.

**Assessment:** PR/5's token rename approach works correctly — the new token names resolve to valid PF6 color values. PR/664's approach using `<Icon status>` is more idiomatic PF6 (semantically marks status intent rather than hardcoding color values). Neither is wrong, but PR/664's approach is more future-proof. Worth reviewing but not urgent.

---

### `src/components/viewLayout/viewLayout.tsx` [DIVERGENT] [MEDIUM CONFIDENCE]

**What the automation did:** Changed `header`→`masthead` on Page, removed `theme="dark"` from Nav and PageSidebar, added `PageBreadcrumb`. All correct.

**Developer reference (PR/664):** Made the same core changes plus additional Masthead restructuring: moved `MastheadToggle` inside `MastheadMain`, replaced `Button` + `BarsIcon` with `PageToggleButton` (with `isHamburgerButton`), added `MastheadLogo` wrapper inside `MastheadBrand`.

**Assessment:** PR/5's changes are valid and functional but represent a partial migration. PR/664 applied a more thorough Masthead restructuring following PF6's updated component composition. The missing `PageToggleButton` and `MastheadLogo` changes may cause visual differences but shouldn't break functionality.

---

### `src/components/viewLayout/viewLayoutToolbar.css` [DIVERGENT] [LOW CONFIDENCE — depends on viewLayoutToolbar.tsx changes]

**What the automation did:** Updated CSS variables and class selectors from pf-v5 to pf-v6.

**Developer reference (PR/664):** Deleted the file entirely, replacing the custom CSS with PF6 `Avatar` component props (`src`, `size`) directly in the TSX file.

**Assessment:** PR/5's CSS update works but keeps custom CSS that PR/664 eliminated by using PF6's built-in component props. The CSS approach is more fragile if PF6 changes Avatar markup in future releases. Worth reviewing during a followup cleanup pass.

---

### `src/vendor/react-table-batteries/components/useTableWithBatteries.tsx` [DIVERGENT] [MEDIUM CONFIDENCE]

**What the automation did:** Destructured `children` from props and passed explicitly to `<Table>`:
```tsx
React.forwardRef(({ children, ...props }, ref) => (
  <Table {...propHelpers.tableProps} innerRef={ref} {...props}>{children}</Table>
))
```

**Developer reference (PR/664):** Made a different change — renamed `innerRef` to `ref` (PF6 Table prop rename). Did not change the children handling.

**Assessment:** Both changes may be needed. PR/5 addressed a children-passing issue, PR/664 addressed the ref rename. Neither is wrong; they're complementary. The file may need both changes.

---

### `src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/select-overrides.css` [DIVERGENT] [LOW CONFIDENCE]

**What the automation did:** Cleared the file entirely (removed `.pf-v5-c-select.isScrollable .pf-v5-c-select__menu` override).

**Developer reference (PR/664):** Updated the selectors to `pf-v6-c-select` / `pf-v6-c-select__menu`.

**Assessment:** PR/5's approach (clearing the file) may actually be more correct — PF6 rebuilt Select on Menu components, so these class selectors likely target nonexistent DOM. PR/664's update keeps potentially dead CSS. Neither approach verifiably works without runtime testing. Low priority.

---

### Files that MATCH the developer reference

The following 8 PR/5-only files align well with PR/664's approach:

| File | Change Summary |
|------|---------------|
| `aboutModal.tsx` | `TextContent`→`Content`, `TextList`→`Content`, `TextListItem`→`Content` |
| `ExtendedButton.test.tsx` | `pf-v5-c-button`→`pf-v6-c-button` in class assertions |
| `usePaginationPropHelpers.ts` | `alignRight`→`alignEnd` |
| `SearchFilterControl.tsx` | `chips`→`labels`, `deleteChip`→`deleteLabel` |
| `ToolbarBulkSelector.tsx` | `splitButtonOptions`→`splitButtonItems` |
| `FilterToolbar.tsx` | Moved `SelectOptionProps` import from deprecated path, removed `spaceItems` prop |
| `addSourceModal.test.tsx` | `pf-v5`→`pf-v6` CSS class selectors in DOM queries |
| `showSourceConnectionsModal.css` | `pf-v5-c-table`→`pf-v6-c-table`, `PaddingTop`→`PaddingBlockStart` |

These are mechanical, well-scoped changes where the automation performed correctly.

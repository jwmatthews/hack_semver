# PF6 Migration Automation — Punch List

Actionable items grouped by pattern, ordered by effort. Each entry includes the specific fix from PR/6 and PR/664 where relevant.

---

## 1. Modal `title` → `ModalHeader` child component

**Files (9 total, 8 need fixing — showAggregateReportModal was handled by automation):**
- `src/views/credentials/addCredentialModal.tsx` [MISS]
- `src/views/credentials/viewCredentialsList.tsx` [INCOMPLETE — 2 modals]
- `src/views/scans/showScansModal.tsx` [MISS]
- `src/views/scans/viewScansList.tsx` [INCOMPLETE — 2 modals]
- `src/views/sources/addSourceModal.tsx` [MISS]
- `src/views/sources/addSourcesScanModal.tsx` [MISS]
- `src/views/sources/showSourceConnectionsModal.tsx` [MISS]
- `src/views/sources/viewSourcesList.tsx` [INCOMPLETE — 2 modals]

**What's wrong:** PF6's Modal `title` prop only sets an HTML `title` attribute (tooltip). It no longer renders a visible heading. All modals silently lost their visible titles.

**What the fix looks like:** Remove `title` prop from `<Modal>`, add `<ModalHeader title={...} />` as first child. Add `ModalHeader` to imports.

**Code example** (from addCredentialModal.tsx):
```tsx
// Before:
<Modal variant={ModalVariant.small} title={titleExpression} isOpen={isOpen} onClose={() => onClose()}>

// After:
import { ..., ModalHeader, ... } from '@patternfly/react-core';
<Modal variant={ModalVariant.small} isOpen={isOpen} onClose={() => onClose()}>
  <ModalHeader title={titleExpression} />
```

**Effort:** trivial — mechanical prop-to-child move, < 5 minutes per file

---

## 2. Modal `actions` → `ModalFooter` child component

**Files (6 total, 5 need fixing — showAggregateReportModal was handled by automation):**
- `src/views/credentials/viewCredentialsList.tsx` [INCOMPLETE — 2 modals]
- `src/views/scans/showScansModal.tsx` [MISS]
- `src/views/scans/viewScansList.tsx` [INCOMPLETE — 2 modals]
- `src/views/sources/showSourceConnectionsModal.tsx` [MISS]
- `src/views/sources/viewSourcesList.tsx` [INCOMPLETE — 2 modals]

**What's wrong:** PF6 removed the `actions` prop from Modal. Build error TS2322.

**What the fix looks like:** Remove `actions` prop/spread from `<Modal>`, unwrap the actions array elements into a `<ModalFooter>` child at the end of Modal's children. Add `ModalFooter` to imports.

**Code example** (from viewCredentialsList.tsx):
```tsx
// Before:
<Modal variant={ModalVariant.small} title={...} isOpen={...} onClose={...}
  actions={[
    <Button key="confirm" variant="danger" onClick={...}>Delete</Button>,
    <Button key="cancel" variant="link" onClick={...}>Cancel</Button>
  ]}>
  {bodyContent}
</Modal>

// After:
<Modal variant={ModalVariant.small} isOpen={...} onClose={...}>
  <ModalHeader title={...} />
  {bodyContent}
  <ModalFooter>
    <Button key="confirm" variant="danger" onClick={...}>Delete</Button>
    <Button key="cancel" variant="link" onClick={...}>Cancel</Button>
  </ModalFooter>
</Modal>
```

Note: Some modals use conditional actions (`{...( actions && { actions })}`). Convert to: `{actions && <ModalFooter>{actions}</ModalFooter>}`.

**Effort:** trivial — mechanical restructuring, < 5 minutes per modal instance

---

## 3. EmptyState consolidation (`EmptyStateHeader`/`EmptyStateIcon` → direct props)

**Files needing the change (4 remaining — automation handled 4 others):**
- `src/views/credentials/viewCredentialsList.tsx` [INCOMPLETE]
- `src/views/scans/showScansModal.tsx` [MISS]
- `src/views/scans/viewScansList.tsx` [INCOMPLETE]
- `src/views/sources/viewSourcesList.tsx` [INCOMPLETE]

**Files where automation used non-idiomatic pattern (should also fix):**
- `src/components/errorMessage/errorMessage.tsx` [NON-IDIOMATIC]
- `src/vendor/.../TableControls/NoDataEmptyState.tsx` [NON-IDIOMATIC]
- `src/vendor/.../TableControls/StateError.tsx` [NON-IDIOMATIC]

**What's wrong:** PF6 removed `EmptyStateHeader` and `EmptyStateIcon` as separate components. Props are promoted to `<EmptyState>` directly. Remaining files have build errors (TS2305, TS2724). The 3 non-idiomatic files work but use a `<Title>` child pattern instead of the `titleText` prop.

**What the fix looks like:**

**Code example** (from viewCredentialsList.tsx):
```tsx
// Before:
import { EmptyState, EmptyStateBody, EmptyStateFooter, EmptyStateHeader, EmptyStateIcon } from '@patternfly/react-core';
<EmptyState>
  <EmptyStateHeader headingLevel="h4" titleText={...} icon={<EmptyStateIcon icon={PlusCircleIcon} />} />
  <EmptyStateBody>...</EmptyStateBody>
</EmptyState>

// After:
import { EmptyState, EmptyStateBody, EmptyStateFooter } from '@patternfly/react-core';
<EmptyState headingLevel="h4" titleText={...} icon={PlusCircleIcon}>
  <EmptyStateBody>...</EmptyStateBody>
</EmptyState>
```

For the non-idiomatic files (errorMessage, NoDataEmptyState, StateError), replace `<EmptyStateBody><Title>...</Title></EmptyStateBody>` with the `titleText` prop.

**Effort:** trivial — mechanical prop extraction, < 5 minutes per file

---

## 4. Deprecated Select → PF6 Menu-based Select

**Files:**
- `src/vendor/.../FilterToolbar/MultiselectFilterControl.tsx` [INCOMPLETE]
- `src/vendor/.../FilterToolbar/SelectFilterControl.tsx` [INCOMPLETE]

**What's wrong:** PF6 completely removed the deprecated Select/SelectOption/SelectVariant exports from `@patternfly/react-core/deprecated`. Build fails with 8 TS2305 errors across these two files.

**What the fix looks like:** Complete component rewrite using PF6's composition-based Select with `MenuToggle`, `SelectList`, `SelectOption`, and for multiselect, `MenuSearch`/`SearchInput` for inline filtering.

**Code example** (from SelectFilterControl.tsx):
```tsx
// Before:
import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core/deprecated';
<Select toggleId={...} onToggle={...} selections={...} onSelect={(_, value) => onFilterSelect(value)}
  isOpen={...} placeholderText="Any" isDisabled={...}>
  {renderSelectOptions(category.selectOptions)}
</Select>

// After:
import { MenuToggle, Select, SelectList, SelectOption } from '@patternfly/react-core';
<Select isOpen={...} onSelect={onFilterSelect} onOpenChange={setIsFilterDropdownOpen}
  selected={selections?.[0]}
  toggle={toggleRef => (
    <MenuToggle ref={toggleRef} onClick={...} isExpanded={...} isDisabled={...}>
      {selections?.[0]?.toString() || 'Any'}
    </MenuToggle>
  )}>
  <SelectList>
    {category.selectOptions.map(opt => (
      <SelectOption key={opt.key} value={opt.value}>{opt.value?.toString()}</SelectOption>
    ))}
  </SelectList>
</Select>
```

Multiselect variant additionally needs `hasCheckbox`, `isSelected`, `MenuSearch`/`SearchInput`, and local filter state.

**Effort:** significant — complete API rewrite, requires understanding both old and new Select APIs, 30-60 min per file

---

## 5. ToolbarGroup prop value corrections

**Files:**
- `src/components/viewLayout/viewLayoutToolbar.tsx` [BREAKAGE]

**What's wrong:** Automation renamed `spacer` prop to `gap` (correct) but left old values `spacerNone`/`spacerMd` (should be `gapNone`/`gapMd`). Also left `alignRight` (should be `alignEnd`). Causes 3 TS2322 build errors.

**What the fix looks like:**
```tsx
// Before (PR/5 output):
<ToolbarGroup align={{ default: 'alignRight' }} gap={{ default: 'spacerNone', md: 'spacerMd' }}>

// After:
<ToolbarGroup align={{ default: 'alignEnd' }} gap={{ default: 'gapNone', md: 'gapMd' }}>
```

**Effort:** trivial — 3 string replacements

---

## 6. DropdownList wrapper for DropdownItem children

**Files:**
- `src/components/viewLayout/viewLayoutToolbar.tsx` [BREAKAGE]

**What's wrong:** PF6's Dropdown requires DropdownItem children to be wrapped in `<DropdownList>`. Without it, menu items don't render (silent failure, no build error).

**What the fix looks like:**
```tsx
// Before:
<Dropdown ...>
  <DropdownItem onClick={onAbout} value="about">About</DropdownItem>
</Dropdown>

// After:
import { ..., DropdownList, ... } from '@patternfly/react-core';
<Dropdown ...>
  <DropdownList>
    <DropdownItem onClick={onAbout} value="about">About</DropdownItem>
  </DropdownList>
</Dropdown>
```

3 Dropdown instances in the file need this wrapper.

**Effort:** trivial — wrap children, add import

---

## 7. MenuToggle `data-ouia-component-id` → `ouiaId` prop

**Files:**
- `src/components/viewLayout/viewLayoutToolbar.tsx` [BREAKAGE]

**What's wrong:** PF6's MenuToggle uses `useOUIAProps` internally, which auto-generates OUIA IDs and overrides raw HTML `data-ouia-component-id` attributes. Test selectors targeting these IDs fail silently.

**What the fix looks like:**
```tsx
// Before:
<MenuToggle data-ouia-component-id="help_menu_toggle">

// After:
<MenuToggle ouiaId="help_menu_toggle">
```

2 MenuToggle instances need this change.

**Effort:** trivial — prop rename

---

## 8. Unused import cleanup

**Files:**
- `src/components/viewLayout/viewLayoutToolbar.tsx` [BREAKAGE]

**What's wrong:** Automation added `ToolbarExpandIconWrapper` and `ToolbarToggleGroup` imports that are never used. Causes `@typescript-eslint/no-unused-vars` lint failures.

**What the fix looks like:** Remove the two unused imports from the `@patternfly/react-core` import block.

**Effort:** trivial — delete 2 lines

---

## 9. Test interaction fixes for PF6 Popper

**Files:**
- `src/components/viewLayout/__tests__/viewLayoutToolbarInteractions.test.tsx` [MISS]

**What's wrong:** PF6's Dropdown renders via Popper portal. `userEvent.click()` triggers a race condition with PF6's internal window click handler, causing dropdowns to open and immediately close.

**What the fix looks like:**
- Replace `userEvent.click()` with `fireEvent.click()` wrapped in `act()` for dropdown toggle clicks
- Add `fireEvent` import from `@testing-library/react`
- Change OUIA-based selectors to content-based selectors where OUIA IDs are auto-generated

```tsx
// Before:
await user.click(document.querySelector('button[data-ouia-component-id="help_menu_toggle"]')!);

// After:
const helpToggle = document.querySelector('[data-ouia-component-id="help_menu_toggle"]');
expect(helpToggle).not.toBeNull();
await act(async () => { fireEvent.click(helpToggle!); });
```

**Effort:** moderate — requires understanding PF6 Popper behavior and JSDOM event propagation, 15-30 min

---

## 10. Quality sweep — non-idiomatic EmptyState pattern

**Files:**
- `src/components/errorMessage/errorMessage.tsx` [NON-IDIOMATIC]
- `src/vendor/.../TableControls/NoDataEmptyState.tsx` [NON-IDIOMATIC]
- `src/vendor/.../TableControls/StateError.tsx` [NON-IDIOMATIC]

**What's wrong:** These files use `<Title>` wrapped in `<EmptyStateBody>` instead of the PF6 `titleText` prop. Works but not idiomatic.

**Effort:** trivial — move title text to `titleText` prop, remove `<Title>` wrapper

---

## 11. Quality sweep — divergent typeaheadCheckboxes pattern

**Files:**
- `src/components/typeAheadCheckboxes/typeaheadCheckboxes.tsx` [DIVERGENT]

**What's wrong:** Automation wrapped `TextInputGroupMain` in `TextInputGroupUtilities` (not the standard migration). PR/664 instead changed `innerRef`→`ref` and `data-ouia-component-id`→`ouiaId`. The automation's wrapping should be reverted and PR/664's changes applied.

**Effort:** moderate — requires reverting automation's change and applying correct PF6 renames, 15-30 min

---

## Summary Table

| # | Pattern | Files | Classification | Effort | Total Est. |
|---|---------|-------|----------------|--------|------------|
| 1 | Modal `title`→`ModalHeader` | 8 | MISS/INCOMPLETE | trivial | ~40 min |
| 2 | Modal `actions`→`ModalFooter` | 5 (10 modal instances) | MISS/INCOMPLETE | trivial | ~50 min |
| 3 | EmptyState consolidation | 4 broken + 3 non-idiomatic | MISS/INCOMPLETE/NON-IDIOMATIC | trivial | ~35 min |
| 4 | Deprecated Select rewrite | 2 | INCOMPLETE | significant | ~90 min |
| 5 | ToolbarGroup prop values | 1 | BREAKAGE | trivial | ~5 min |
| 6 | DropdownList wrapper | 1 (3 instances) | BREAKAGE | trivial | ~5 min |
| 7 | MenuToggle ouiaId | 1 (2 instances) | BREAKAGE | trivial | ~5 min |
| 8 | Unused import cleanup | 1 | BREAKAGE | trivial | ~2 min |
| 9 | Test Popper interaction | 1 | MISS | moderate | ~30 min |
| 10 | Non-idiomatic EmptyState | 3 | NON-IDIOMATIC | trivial | ~15 min |
| 11 | Divergent typeahead | 1 | DIVERGENT | moderate | ~20 min |
| | **Totals** | **31 files/instances** | | | **~5 hrs** |

Items 5-8 are all in `viewLayoutToolbar.tsx` and can be done in a single pass (~15 min total).

Items 1-3 overlap in several files (`viewCredentialsList.tsx`, `viewScansList.tsx`, `viewSourcesList.tsx` each need all three patterns), so doing them file-by-file is more efficient than pattern-by-pattern.

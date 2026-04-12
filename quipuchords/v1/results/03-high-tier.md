# HIGH Priority File Analysis

---

## File 1

```
---------------------------------------------
`src/components/typeAheadCheckboxes/typeaheadCheckboxes.tsx`  [HIGH PRIORITY]
---------------------------------------------
```

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes -- ToolbarFilter `chips`/`deleteChip` rename (not in this file's diff but related), CSS token updates
  Semantic changes present:    yes -- MenuToggle `innerRef` -> `ref`, `data-ouia-component-id` -> `ouiaId`, Button `icon` prop refactor, TextInputGroupMain `innerRef` -> `ref`
  Non-PF6 changes in golden-source: no

CRITERIA ASSESSMENT:

  1. Import correctness
     **semver-migrated**: No import changes in the diff hunk.
     **golden-source**: No import changes in the diff hunk either.
     Both leave imports unchanged. N/A -- no import migration was required in either PR for this file.

  2. Component API alignment
     **golden-source** changed:
     - `MenuToggle innerRef={toggleRef}` -> `ref={toggleRef}` (PF6 change: `innerRef` deprecated)
     - `MenuToggle data-ouia-component-id={menuToggleOuiaId}` -> `ouiaId={menuToggleOuiaId}` (PF6 change)
     - `TextInputGroupMain innerRef={textInputRef}` -> `ref={textInputRef}` (PF6 change)
     - Button: children `<TimesIcon aria-hidden />` moved to `icon={<TimesIcon aria-hidden />}` prop, self-closing Button (PF6 pattern)

     **semver-migrated** changed: NONE of the above. Instead it:
     - Wrapped `TextInputGroupMain` in an extra `<TextInputGroupUtilities>`, creating a DUPLICATE nested `TextInputGroupUtilities`. The original code already had a `<TextInputGroupUtilities>` below for the clear button. Semver added another one around the input, which is structurally wrong.

     Verdict: ❌ Wrong/Missing
     - `innerRef` -> `ref` migration: MISSING on both MenuToggle and TextInputGroupMain
     - `data-ouia-component-id` -> `ouiaId` migration: MISSING on MenuToggle
     - Button `icon` prop migration: MISSING
     - Spurious `TextInputGroupUtilities` wrapper added around `TextInputGroupMain`: INCORRECT

  3. Structural/JSX correctness
     ❌ Wrong -- The semver-migrated diff introduces a structural error: it wraps `TextInputGroupMain` inside a second `TextInputGroupUtilities`, producing nested/duplicate `TextInputGroupUtilities`. The golden-source did NOT restructure this area at all; the existing structure was already correct.
     Evidence from semver-migrated diff (lines 345-361):
     ```
     +        <TextInputGroupUtilities>
     +          <TextInputGroupMain ... />
     +        </TextInputGroupUtilities>
              <TextInputGroupUtilities>
     ```
     This creates two adjacent `TextInputGroupUtilities` blocks, the first incorrectly wrapping the input.

  4. CSS token migration
     N/A -- No CSS tokens in this file's diff.

  5. TypeScript correctness
     N/A -- No type changes in either diff for this file.

  6. Completeness vs. golden-source
     **DIVERGENT** -- semver-migrated makes a wrong structural change that golden-source did not make, and misses three prop renames (`innerRef`->`ref` x2, `data-ouia-component-id`->`ouiaId`) plus the Button `icon` prop migration.

  7. Half-migration risk
     ⚠️ ELEVATED -- The component retains PF5 `innerRef` and `data-ouia-component-id` props while running on PF6 packages. These props are deprecated/removed in PF6.

  8. Correctness risk
     RISK LEVEL: **HIGH**
     - The spurious `TextInputGroupUtilities` wrapper around `TextInputGroupMain` will break the visual layout of the typeahead input
     - Retained `innerRef` props may cause runtime warnings or silently fail to attach refs

EVIDENCE REQUIREMENT:
  All assessments verified by reading both diff hunks directly.

WHAT GOLDEN-SOURCE DID:
  Renamed `innerRef` to `ref` on MenuToggle and TextInputGroupMain, changed `data-ouia-component-id` to `ouiaId` on MenuToggle, and moved the TimesIcon from Button children to the `icon` prop (PF6 Button pattern). No structural JSX changes.

WHAT SEMVER-MIGRATED DID:
  Incorrectly wrapped `TextInputGroupMain` in an additional `TextInputGroupUtilities` container, creating a broken nesting structure. Did not address `innerRef`->`ref`, `data-ouia-component-id`->`ouiaId`, or Button `icon` prop migrations.

DELTA:
  - REMOVE the extra `<TextInputGroupUtilities>` wrapper around `TextInputGroupMain`
  - Change `innerRef={toggleRef}` to `ref={toggleRef}` on MenuToggle
  - Change `innerRef={textInputRef}` to `ref={textInputRef}` on TextInputGroupMain
  - Change `data-ouia-component-id={menuToggleOuiaId}` to `ouiaId={menuToggleOuiaId}` on MenuToggle
  - Move `<TimesIcon aria-hidden />` from Button children to `icon={<TimesIcon aria-hidden />}` prop, make Button self-closing

DEVELOPER UTILITY VERDICT:
  **Costs time** -- The spurious structural change must be reverted and the missing prop renames must be applied manually. The developer would be better off starting from the PF5 source for this component.

IF RISK LEVEL IS HIGH -- REQUIRED FIX:
  1. Remove the wrapping `<TextInputGroupUtilities>` around `<TextInputGroupMain>` (revert semver change)
  2. On `<MenuToggle>`: change `innerRef={toggleRef}` to `ref={toggleRef}`
  3. On `<MenuToggle>`: change `data-ouia-component-id={menuToggleOuiaId}` to `ouiaId={menuToggleOuiaId}`
  4. On `<TextInputGroupMain>`: change `innerRef={textInputRef}` to `ref={textInputRef}`
  5. On the clear `<Button>`: add `icon={<TimesIcon aria-hidden />}` prop, remove children, make self-closing

---

## File 2

```
---------------------------------------------
`src/components/viewLayout/viewLayoutToolbar.tsx`  [HIGH PRIORITY]
---------------------------------------------
```

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes -- `pf-v5-theme-dark` -> `pf-v6-theme-dark`, `pf-v5-c-avatar` -> `pf-v6-c-avatar`, CSS token updates
  Semantic changes present:    yes -- ToolbarGroup `variant` removal/rename, `spacer`->`gap`, `data-ouia-component-id`->`ouiaId`, Avatar component usage, CSS file deletion, user dropdown restructure
  Non-PF6 changes in golden-source: no (all changes are PF6-related)

CRITERIA ASSESSMENT:

  1. Import correctness
     **golden-source** added: `Avatar` import, replaced `import './viewLayoutToolbar.css'` with `import avatarImage from '../../images/imgAvatar.svg'`
     **semver-migrated** added: `ToolbarExpandIconWrapper`, `ToolbarToggleGroup` (neither is used in the diff hunks shown). Did NOT add `Avatar` import.

     Verdict: ⚠️ Partial
     - `ToolbarExpandIconWrapper` and `ToolbarToggleGroup` imports are unnecessary/unused additions [MEDIUM CONFIDENCE]
     - Missing `Avatar` import needed for the proper PF6 avatar pattern

  2. Component API alignment
     **golden-source** changed:
     - `ToolbarGroup variant="icon-button-group"` -> `variant="action-group-plain"` (PF6 rename)
     - `align={{ default: 'alignRight' }}` -> `align={{ default: 'alignEnd' }}` (PF6 rename)
     - `spacer={{ default: 'spacerNone', md: 'spacerMd' }}` -> `gap={{ default: 'gapNone', md: 'gapMd' }}` (PF6 rename)
     - Multiple `data-ouia-component-id` -> `ouiaId` renames on MenuToggle and DropdownItem
     - MenuToggle `variant="plain"` -> `icon={<Avatar .../>}` (PF6 Avatar pattern)

     **semver-migrated** changed:
     - `ToolbarGroup variant="icon-button-group"` -> removed (left blank line) -- partial, should be `variant="action-group-plain"`
     - `spacer={{ default: 'spacerNone', md: 'spacerMd' }}` -> `gap={{ default: 'spacerNone', md: 'spacerMd' }}` -- WRONG VALUES: kept `spacerNone`/`spacerMd` instead of `gapNone`/`gapMd`
     - Inner `ToolbarGroup variant="icon-button-group"` -> removed variant entirely -- partial, should be `variant="action-group-plain"`
     - `align={{ default: 'alignRight' }}` kept as-is -- MISSING the `alignEnd` rename
     - All `data-ouia-component-id` props: NOT changed to `ouiaId`

     Verdict: ❌ Wrong/Missing
     - `variant` removed instead of renamed to `"action-group-plain"`
     - `gap` values use old `spacerNone`/`spacerMd` tokens instead of PF6 `gapNone`/`gapMd`
     - `alignRight` not updated to `alignEnd`
     - All `data-ouia-component-id` -> `ouiaId` renames missing
     - `popperProps` addition on user Dropdown missing

  3. Structural/JSX correctness
     **golden-source** restructured the user dropdown:
     - Removed `variant="plain"` on MenuToggle, added `icon={<Avatar alt="User avatar" src={avatarImage} size="sm" />}`
     - Removed `<div className="quipucords-toolbar__user-dropdown"><span className="pf-v5-c-avatar" />{userName}</div>` wrapper
     - Simplified to just `{userName}` as MenuToggle children
     - Added `popperProps={{ position: 'right' }}` to Dropdown

     **semver-migrated**: Only changed `pf-v5-c-avatar` -> `pf-v6-c-avatar` in the span. Kept the old structural pattern with div wrapper and manual avatar span.

     Verdict: ❌ Wrong/Missing -- kept PF5 structural pattern for avatar/dropdown.

  4. CSS token migration
     **golden-source**: Deleted `viewLayoutToolbar.css` entirely (replaced manual avatar CSS with PF6 Avatar component)
     **semver-migrated**: Updated CSS tokens in the file (`pf-v5-global--spacer--sm` -> `pf-t--global--spacer--200`, `pf-v5-c-avatar` -> `pf-v6-c-avatar`). The file was NOT deleted.

     Verdict: ⚠️ Partial -- CSS tokens were updated mechanically, but the golden-source approach was to delete the file entirely and use the Avatar component instead. The semver-migrated CSS file is orphaned if the proper Avatar component migration is done. The CSS token update (`--pf-t--global--spacer--200`) is correct PF6 token format [LOW CONFIDENCE - unverified pattern].

  5. TypeScript correctness
     N/A -- No type changes needed.

  6. Completeness vs. golden-source
     **SUBSET** with errors -- semver-migrated addressed the mechanical CSS class/token renames but missed all semantic API changes (variant renames, align/gap value renames, ouiaId, Avatar restructure, Dropdown popperProps).

  7. Half-migration risk
     ⚠️ ELEVATED -- PF5 `variant="icon-button-group"` was removed (blank) instead of replaced with PF6 value. `alignRight` is PF5 terminology. `spacerNone`/`spacerMd` are PF5 gap values.

  8. Correctness risk
     RISK LEVEL: **HIGH**
     - `gap={{ default: 'spacerNone', md: 'spacerMd' }}` uses invalid PF6 gap token values
     - Missing `variant` on ToolbarGroup may affect toolbar layout behavior
     - `alignRight` is deprecated in PF6

EVIDENCE REQUIREMENT:
  Verified by reading diff lines 450-473 (semver) vs. 1829-1901 (golden). The semver diff line 455 shows `variant="icon-button-group"` removed with blank line, not replaced. Line 458 shows `gap={{ default: 'spacerNone'...` with old values.

WHAT GOLDEN-SOURCE DID:
  Comprehensively updated ToolbarGroup variants to `"action-group-plain"`, renamed align/gap values to PF6 equivalents, replaced manual avatar CSS/HTML with PF6 Avatar component, migrated all `data-ouia-component-id` to `ouiaId`, deleted the now-unnecessary CSS file, and added `popperProps` for dropdown positioning.

WHAT SEMVER-MIGRATED DID:
  Applied mechanical CSS class renames (`pf-v5-*` -> `pf-v6-*`), partially migrated `spacer` -> `gap` (with wrong values), removed `variant` prop without replacement, and updated the CSS token in the stylesheet. Missed all semantic changes.

DELTA:
  - Add `variant="action-group-plain"` to both ToolbarGroups
  - Change `align={{ default: 'alignRight' }}` to `align={{ default: 'alignEnd' }}`
  - Change `gap={{ default: 'spacerNone', md: 'spacerMd' }}` to `gap={{ default: 'gapNone', md: 'gapMd' }}`
  - Change all `data-ouia-component-id` to `ouiaId` on MenuToggle and DropdownItem elements
  - Import `Avatar` component; replace `variant="plain"` MenuToggle + div/span avatar with `icon={<Avatar>}` pattern
  - Delete `viewLayoutToolbar.css`; import `avatarImage` from SVG
  - Add `popperProps={{ position: 'right' }}` to user Dropdown

DEVELOPER UTILITY VERDICT:
  **Costs time** -- The mechanical CSS renames are correct but the semantic API migration is substantially incomplete and contains incorrect values that would cause runtime issues. Developer needs to redo most of the migration manually.

IF RISK LEVEL IS HIGH -- REQUIRED FIX:
  1. Both `<ToolbarGroup>` elements: add `variant="action-group-plain"`
  2. Outer `<ToolbarGroup>`: change `align={{ default: 'alignRight' }}` to `align={{ default: 'alignEnd' }}`
  3. Outer `<ToolbarGroup>`: change `gap={{ default: 'spacerNone', md: 'spacerMd' }}` to `gap={{ default: 'gapNone', md: 'gapMd' }}`
  4. All `data-ouia-component-id` attributes -> `ouiaId`
  5. Import `Avatar` from `@patternfly/react-core`, import `avatarImage` from SVG
  6. On user dropdown MenuToggle: replace `variant="plain"` with `icon={<Avatar alt="User avatar" src={avatarImage} size="sm" />}`, remove the `<div>/<span>` avatar wrapper, keep only `{userName}` as children
  7. Delete `viewLayoutToolbar.css`, remove its import
  8. Add `popperProps={{ position: 'right' }}` to user Dropdown

---

## File 3

```
---------------------------------------------
`src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/MultiselectFilterControl.tsx`  [HIGH PRIORITY]
---------------------------------------------
```

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes -- `chips`->`labels`, `deleteChip`->`deleteLabel` (ToolbarFilter prop renames)
  Semantic changes present:    yes -- Complete Select component rewrite from deprecated PF5 Select to PF6 composition model
  Non-PF6 changes in golden-source: no

CRITERIA ASSESSMENT:

  1. Import correctness
     **golden-source**: Replaced `import { Select, SelectOption, SelectOptionObject, SelectVariant, SelectProps } from '@patternfly/react-core/deprecated'` with `import { ToolbarFilter, Select, SelectList, SelectOption, MenuToggle } from '@patternfly/react-core'` -- correct PF6 imports.
     **semver-migrated**: No import changes at all in the diff. The PF5 deprecated Select imports remain.

     Verdict: ❌ Wrong/Missing -- PF5 deprecated imports (`@patternfly/react-core/deprecated`) not updated.

  2. Component API alignment
     **golden-source**: Complete rewrite of Select usage:
     - Removed: `SelectVariant.checkbox`, `hasInlineFilter`, `onFilter`, `selections`, `placeholderText`, `toggleId`, `onToggle`
     - Added: `selected`, `onSelect` (new signature with event+value), `onOpenChange`, `toggle` (render function with MenuToggle)
     - Changed `onFilterSelect` signature from `(value: string | SelectOptionObject)` to `(event, value: string | number | undefined)`
     - `SelectOption` rendering changed to include children text and `isSelected` prop

     **semver-migrated**: Only changed `chips`->`labels` and `deleteChip`->`deleteLabel` on ToolbarFilter. The entire Select component and its API remain PF5 deprecated.

     Verdict: ❌ Wrong/Missing -- The core Select rewrite is completely missing. Only the ToolbarFilter prop renames were done.

  3. Structural/JSX correctness
     **golden-source**: Replaced the deprecated `<Select>` with the PF6 composition model: `<Select toggle={renderFunc}>` containing `<SelectList><SelectOption>` children. Added a `toggle` render function returning `<MenuToggle>`.
     **semver-migrated**: No structural changes to Select. The PF5 deprecated Select API is entirely retained.

     Verdict: ❌ Wrong/Missing -- No structural rewrite performed.

  4. CSS token migration
     N/A -- No CSS tokens in this component.

  5. TypeScript correctness
     **golden-source**: Replaced `SelectOptionObject` type references with `string | number`. Removed `SelectProps['onFilter']` type usage.
     **semver-migrated**: No type changes.

     Verdict: ❌ Wrong/Missing -- deprecated PF5 types (`SelectOptionObject`, `SelectVariant`) still referenced.

  6. Completeness vs. golden-source
     **DIVERGENT** -- semver-migrated only did ToolbarFilter prop renames (2 lines). Golden-source rewrote the entire component (~80 lines changed). The Select migration is the most critical change and is completely absent.

  7. Half-migration risk
     ⚠️ ELEVATED -- The component uses `@patternfly/react-core/deprecated` Select with PF6 packages. While `deprecated` exports may still work in PF6 temporarily, they are slated for removal and represent a half-migrated state.

  8. Correctness risk
     RISK LEVEL: **HIGH**
     - The deprecated PF5 Select from `@patternfly/react-core/deprecated` may or may not function with PF6 runtime. If it does, the behavior is on borrowed time.
     - The `SelectOptionObject` type, `SelectVariant`, `onToggle` callback pattern are all PF5-only APIs.

EVIDENCE REQUIREMENT:
  Semver diff (lines 573-583) shows ONLY the `chips`/`deleteChip` rename. Golden diff (lines 2115-2262) shows complete rewrite of imports, types, Select component, toggle function, and SelectOption rendering.

WHAT GOLDEN-SOURCE DID:
  Performed a complete semantic rewrite of the component: replaced deprecated PF5 Select/SelectVariant/SelectOptionObject with PF6 Select+SelectList+SelectOption composition model, added MenuToggle-based toggle render function, updated callback signatures, and renamed ToolbarFilter props.

WHAT SEMVER-MIGRATED DID:
  Only renamed two ToolbarFilter props (`chips`->`labels`, `deleteChip`->`deleteLabel`). The critical Select component migration was not attempted.

DELTA:
  The entire Select rewrite must be done manually. This includes:
  - Replace imports from `@patternfly/react-core/deprecated` with `Select, SelectList, SelectOption, MenuToggle` from `@patternfly/react-core`
  - Rewrite `onFilterSelect` callback signature
  - Replace `SelectOptionObject` with `string | number`
  - Add `toggle` render function with `MenuToggle`
  - Restructure JSX to use `<Select toggle={toggle}><SelectList>...</SelectList></Select>`
  - Remove deprecated props: `variant`, `hasInlineFilter`, `onFilter`, `placeholderText`, `toggleId`, `onToggle`, `selections`

DEVELOPER UTILITY VERDICT:
  **Costs time** -- The ToolbarFilter rename saves trivial effort (2 prop renames). The critical Select rewrite (~80 lines) is completely missing. A developer would need to do essentially 100% of the meaningful work.

IF RISK LEVEL IS HIGH -- REQUIRED FIX:
  Complete rewrite following the golden-source pattern:
  1. Replace deprecated imports with: `import { ToolbarFilter, Select, SelectList, SelectOption, MenuToggle } from '@patternfly/react-core'`
  2. Change `getOptionKeyFromOptionValue` param type from `string | SelectOptionObject` to `string | number`
  3. Change `getChipFromOptionValue` param type similarly
  4. Rewrite `onFilterSelect` to accept `(event: React.MouseEvent | undefined, value: string | number | undefined)`
  5. Change `selections` to `selected`, `chips` to label array
  6. Add `toggle` render function returning `<MenuToggle ref={toggleRef} ... >`
  7. Restructure Select JSX: remove all deprecated props, use `toggle`, `selected`, `onSelect`, `onOpenChange`; wrap children in `<SelectList>`
  8. Update `renderSelectOptions` to pass `isSelected` and children text

---

## File 4

```
---------------------------------------------
`src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/SelectFilterControl.tsx`  [HIGH PRIORITY]
---------------------------------------------
```

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes -- `chips`->`labels`, `deleteChip`->`deleteLabel` (ToolbarFilter prop renames)
  Semantic changes present:    yes -- Complete Select component rewrite from deprecated PF5 Select to PF6 composition model
  Non-PF6 changes in golden-source: no

CRITERIA ASSESSMENT:

  1. Import correctness
     **golden-source**: Replaced `import { Select, SelectOption, SelectOptionObject } from '@patternfly/react-core/deprecated'` with `import { ToolbarFilter, Select, SelectList, SelectOption, MenuToggle } from '@patternfly/react-core'`.
     **semver-migrated**: No import changes.

     Verdict: ❌ Wrong/Missing -- PF5 deprecated imports remain.

  2. Component API alignment
     **golden-source**: Complete rewrite identical in pattern to MultiselectFilterControl:
     - Removed: `selections`, `onToggle`, `placeholderText`, `toggleId`, deprecated Select props
     - Added: `selected`, `onSelect` (new signature), `onOpenChange`, `toggle` render function
     - Changed callback signature, type references

     **semver-migrated**: Only changed `chips`->`labels` and `deleteChip`->`deleteLabel` on ToolbarFilter.

     Verdict: ❌ Wrong/Missing

  3. Structural/JSX correctness
     ❌ Wrong/Missing -- Same as MultiselectFilterControl: no Select rewrite performed.

  4. CSS token migration
     N/A

  5. TypeScript correctness
     ❌ Wrong/Missing -- `SelectOptionObject` type still referenced in PF5 form.

  6. Completeness vs. golden-source
     **DIVERGENT** -- Only ToolbarFilter renames done; the entire Select component rewrite (~50+ lines) is missing.

  7. Half-migration risk
     ⚠️ ELEVATED -- deprecated PF5 Select still used with PF6 packages.

  8. Correctness risk
     RISK LEVEL: **HIGH**
     - Same risk as MultiselectFilterControl: deprecated Select API on PF6 runtime.

EVIDENCE REQUIREMENT:
  Semver diff (lines 603-613) shows ONLY `chips`/`deleteChip` rename. Golden diff (lines 2295-2407) shows complete rewrite including new imports, `onToggleClick`, `selected`, `toggle` render function, `SelectList` wrapper, and `MenuToggle`.

WHAT GOLDEN-SOURCE DID:
  Complete semantic rewrite from deprecated PF5 Select to PF6 Select composition model with MenuToggle, SelectList, and updated callback signatures.

WHAT SEMVER-MIGRATED DID:
  Only renamed `chips`->`labels` and `deleteChip`->`deleteLabel` on ToolbarFilter. The Select migration was not attempted.

DELTA:
  Same as MultiselectFilterControl -- the entire Select rewrite must be done manually. See File 3 delta for the full pattern.

DEVELOPER UTILITY VERDICT:
  **Costs time** -- Trivial 2-line rename done, ~50+ lines of critical Select rewrite missing. Developer must do all meaningful work.

IF RISK LEVEL IS HIGH -- REQUIRED FIX:
  Same pattern as MultiselectFilterControl (File 3):
  1. Replace deprecated imports
  2. Update type references (`SelectOptionObject` -> `string | number`)
  3. Rewrite `onFilterSelect` callback signature
  4. Add `onToggleClick` helper
  5. Add `toggle` render function with `MenuToggle`
  6. Restructure Select JSX with PF6 composition pattern
  7. Wrap options in `<SelectList>`

---

## File 5

```
---------------------------------------------
`src/vendor/react-table-batteries/tackle2-ui-legacy/components/FilterToolbar/FilterToolbar.tsx`  [HIGH PRIORITY]
---------------------------------------------
```

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes -- `SelectOptionProps` import path change, `spaceItems` removal
  Semantic changes present:    yes -- `OptionPropsWithKey` interface rewrite, `SelectOptionProps` dependency removal, trailing comma formatting
  Non-PF6 changes in golden-source: yes -- minor trailing comma formatting changes (cosmetic, not functional)

CRITERIA ASSESSMENT:

  1. Import correctness
     **golden-source**: Removed `import { SelectOptionProps } from '@patternfly/react-core/deprecated'` entirely. Kept the rest of the imports unchanged. The `OptionPropsWithKey` interface no longer extends `SelectOptionProps`.
     **semver-migrated**: Moved `SelectOptionProps` from `@patternfly/react-core/deprecated` to `@patternfly/react-core` (added to the main import block).

     Verdict: ❌ Wrong/Missing -- `SelectOptionProps` does not exist in `@patternfly/react-core` in PF6 (it was part of the deprecated Select). The semver-migrated approach will cause a TypeScript compilation error. [HIGH CONFIDENCE]

  2. Component API alignment
     **golden-source**: Rewrote `OptionPropsWithKey` from `extends SelectOptionProps { key: string }` to a standalone interface `{ key: string; value: string | number; label?: string }`. Also removed `spaceItems` prop from `ToolbarToggleGroup`.
     **semver-migrated**: Did NOT change `OptionPropsWithKey` interface. Only removed `spaceItems` prop (left blank line).

     Verdict: ⚠️ Partial -- `spaceItems` removal is correct. But `OptionPropsWithKey` still extends `SelectOptionProps` which may not exist in PF6 main exports.

  3. Structural/JSX correctness
     Both removed `spaceItems` from `ToolbarToggleGroup`. This is correct as `spaceItems` was removed in PF6.
     Verdict: ✅ Correct for the `spaceItems` removal. Evidence: semver diff line 564-565 shows `spaceItems={showFiltersSideBySide ? { default: 'spaceItemsMd' } : undefined}` replaced with blank line.

  4. CSS token migration
     N/A

  5. TypeScript correctness
     ❌ Wrong/Missing -- Importing `SelectOptionProps` from `@patternfly/react-core` will likely fail at compile time since this type was part of the deprecated Select API.

  6. Completeness vs. golden-source
     **DIVERGENT** -- The import path change is wrong (moved to wrong location instead of removing). The `OptionPropsWithKey` interface rewrite is missing. The `spaceItems` removal is correct.

  7. Half-migration risk
     ⚠️ ELEVATED -- `SelectOptionProps` import from main `@patternfly/react-core` will likely break compilation.

  8. Correctness risk
     RISK LEVEL: **HIGH**
     - `SelectOptionProps` imported from `@patternfly/react-core` almost certainly does not exist in PF6, causing a build failure.

EVIDENCE REQUIREMENT:
  Semver diff lines 551-556 show `SelectOptionProps` moved from deprecated to main import. Golden diff lines 2063-2080 show it removed entirely and `OptionPropsWithKey` rewritten as standalone interface.

WHAT GOLDEN-SOURCE DID:
  Removed the dependency on deprecated `SelectOptionProps` entirely by rewriting `OptionPropsWithKey` as a standalone interface with explicit `key`, `value`, and `label` properties. Removed `spaceItems` prop. Minor trailing comma formatting.

WHAT SEMVER-MIGRATED DID:
  Moved `SelectOptionProps` import from deprecated path to main path (incorrect -- it doesn't exist there). Removed `spaceItems` prop. Did not rewrite `OptionPropsWithKey` interface.

DELTA:
  - Remove `SelectOptionProps` from imports entirely
  - Rewrite `OptionPropsWithKey` interface:
    ```typescript
    export interface OptionPropsWithKey {
      key: string;
      value: string | number;
      label?: string;
    }
    ```
  - This change propagates to MultiselectFilterControl and SelectFilterControl which consume this interface

DEVELOPER UTILITY VERDICT:
  **Costs time** -- The `SelectOptionProps` import will cause a build error. Developer must fix the import and rewrite the interface. The `spaceItems` removal saves trivial effort.

IF RISK LEVEL IS HIGH -- REQUIRED FIX:
  1. Remove `SelectOptionProps` from the `@patternfly/react-core` import block
  2. Change `OptionPropsWithKey` from `extends SelectOptionProps { key: string }` to:
     ```typescript
     export interface OptionPropsWithKey {
       key: string;
       value: string | number;
       label?: string;
     }
     ```

---

## File 6

```
---------------------------------------------
`src/views/credentials/viewCredentialsList.tsx`  [HIGH PRIORITY]
---------------------------------------------
```

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes -- `PageSection variant="light"` removal
  Semantic changes present:    yes -- EmptyState restructure, Modal migration, selectOptions label removal, Button/ActionMenu `size` prop, Td `hasAction`
  Non-PF6 changes in golden-source: no (all changes are PF6-migration related)

CRITERIA ASSESSMENT:

  1. Import correctness
     **golden-source**: Removed `EmptyStateHeader`, `EmptyStateIcon` imports. Moved `Modal`, `ModalVariant` to `@patternfly/react-core/deprecated`.
     **semver-migrated**: No import changes.

     Verdict: ❌ Wrong/Missing -- `EmptyStateHeader` and `EmptyStateIcon` imports still present (they are removed/deprecated in PF6). Modal not moved to deprecated path.

  2. Component API alignment
     **golden-source**:
     - `PageSection variant="light"` -> `PageSection hasBodyWrapper={false}` (PF6: `variant="light"` removed, `hasBodyWrapper` is new)
     - EmptyState: moved `icon`, `headingLevel`, `titleText` to props on `<EmptyState>` directly; removed `<EmptyStateHeader>` and `<EmptyStateIcon>`
     - selectOptions: removed `label` property from all selectOption entries (since the new `OptionPropsWithKey` interface uses `value` for display)
     - Added `size="sm"` to Buttons and ActionMenu
     - Added `hasAction` to Td components containing action buttons

     **semver-migrated**:
     - `PageSection variant="light"` -> `PageSection` (removed variant, but did NOT add `hasBodyWrapper={false}`)

     Verdict: ❌ Wrong/Missing -- Only the `variant="light"` removal was done. All other changes (EmptyState restructure, Modal migration, selectOptions, size/hasAction props) are missing.

  3. Structural/JSX correctness
     **golden-source**: Restructured EmptyState from `<EmptyState><EmptyStateHeader icon={<EmptyStateIcon>} titleText headingLevel />` to `<EmptyState icon headingLevel titleText>`.
     **semver-migrated**: No EmptyState changes.

     Verdict: ❌ Wrong/Missing

  4. CSS token migration
     N/A for this file.

  5. TypeScript correctness
     N/A -- no type-specific changes needed beyond what's covered by imports.

  6. Completeness vs. golden-source
     **SUBSET** -- Only 1 of ~8 distinct changes made. The `variant="light"` removal is a tiny fraction of the golden-source migration.

  7. Half-migration risk
     ⚠️ ELEVATED -- `EmptyStateHeader` and `EmptyStateIcon` are used but may not exist in PF6. `PageSection` is missing `hasBodyWrapper={false}`.

  8. Correctness risk
     RISK LEVEL: **HIGH**
     - `EmptyStateHeader` and `EmptyStateIcon` components may not exist in PF6 `@patternfly/react-core`, causing build failures
     - `PageSection` without `hasBodyWrapper={false}` may render differently than expected

EVIDENCE REQUIREMENT:
  Semver diff (lines 706-714): only change is `<PageSection variant="light">` -> `<PageSection>`. Golden diff (lines 2542-2644): shows import changes, EmptyState restructure, selectOptions label removal, Button size prop, Td hasAction, Modal migration -- none of which appear in semver.

WHAT GOLDEN-SOURCE DID:
  Comprehensive migration: restructured EmptyState to PF6 API (moved icon/title to props), migrated Modal to deprecated import path, removed selectOptions `label` properties (aligned with new OptionPropsWithKey interface), added `size="sm"` to action Buttons, added `hasAction` to Td elements, and changed PageSection to `hasBodyWrapper={false}`.

WHAT SEMVER-MIGRATED DID:
  Only removed `variant="light"` from PageSection. All other migrations (EmptyState, Modal, selectOptions, Button size, Td hasAction) were not attempted.

DELTA:
  - Add `hasBodyWrapper={false}` to PageSection
  - Remove `EmptyStateHeader`, `EmptyStateIcon` imports
  - Move `Modal`, `ModalVariant` to `@patternfly/react-core/deprecated`
  - Restructure EmptyState JSX to PF6 pattern
  - Remove `label` property from all selectOption entries
  - Add `size="sm"` to action Buttons and ActionMenu
  - Add `hasAction` to Td elements containing action buttons

DEVELOPER UTILITY VERDICT:
  **Costs time** -- Only 1 trivial change out of ~8 was made. Developer must handle all the substantial EmptyState, Modal, and prop migrations manually.

IF RISK LEVEL IS HIGH -- REQUIRED FIX:
  1. Imports: remove `EmptyStateHeader`, `EmptyStateIcon`; move `Modal, ModalVariant` to `@patternfly/react-core/deprecated`
  2. `<PageSection>` -> `<PageSection hasBodyWrapper={false}>`
  3. Restructure `<EmptyState>` to: `<EmptyState headingLevel="h4" icon={PlusCircleIcon} titleText={...}>`
  4. Remove `label` from all selectOption objects
  5. Add `size="sm"` to all action `<Button>` and `<ActionMenu>` components
  6. Add `hasAction` prop to `<Td>` elements containing action buttons/links

---

## File 7

```
---------------------------------------------
`src/views/scans/viewScansList.tsx`  [HIGH PRIORITY]
---------------------------------------------
```

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes -- `PageSection variant="light"` removal
  Semantic changes present:    yes -- EmptyState restructure, Modal migration, Button `size`, Td `hasAction`
  Non-PF6 changes in golden-source: yes -- minor formatting changes (line wrapping for long translation strings, object destructuring formatting)

CRITERIA ASSESSMENT:

  1. Import correctness
     **golden-source**: Removed `EmptyStateHeader`, `EmptyStateIcon`. Moved `Modal`, `ModalVariant` to `@patternfly/react-core/deprecated`.
     **semver-migrated**: No import changes.

     Verdict: ❌ Wrong/Missing

  2. Component API alignment
     **golden-source**:
     - `PageSection variant="light"` -> `PageSection hasBodyWrapper={false}`
     - EmptyState restructure (same pattern as credentials)
     - `size="sm"` added to action Buttons and ActionMenu
     - `hasAction` added to Td elements
     - `Td columnKey="most_recent"` -> `Td hasAction columnKey="most_recent"`

     **semver-migrated**:
     - `PageSection variant="light"` -> `PageSection` (no `hasBodyWrapper={false}`)

     Verdict: ❌ Wrong/Missing

  3. Structural/JSX correctness
     ❌ Wrong/Missing -- EmptyState restructure not performed.

  4. CSS token migration
     N/A

  5. TypeScript correctness
     N/A

  6. Completeness vs. golden-source
     **SUBSET** -- Only 1 change out of ~8 distinct changes. The non-PF6 formatting changes from golden-source should not be penalized.

  7. Half-migration risk
     ⚠️ ELEVATED -- Same as viewCredentialsList: `EmptyStateHeader`/`EmptyStateIcon` usage with PF6 packages.

  8. Correctness risk
     RISK LEVEL: **HIGH**
     - `EmptyStateHeader` and `EmptyStateIcon` may not exist in PF6
     - `PageSection` without `hasBodyWrapper={false}` may render differently

EVIDENCE REQUIREMENT:
  Semver diff (lines 807-815): only `<PageSection variant="light">` -> `<PageSection>`. Golden diff (lines 2855-2995): shows import changes, EmptyState restructure, Button size, Td hasAction, Modal migration, plus formatting.

WHAT GOLDEN-SOURCE DID:
  Same comprehensive migration pattern as viewCredentialsList: EmptyState restructure, Modal to deprecated, PageSection `hasBodyWrapper`, Button `size="sm"`, Td `hasAction`. Also includes formatting changes for readability.

WHAT SEMVER-MIGRATED DID:
  Only removed `variant="light"` from PageSection.

DELTA:
  Same as viewCredentialsList (File 6). All EmptyState, Modal, Button size, and Td hasAction changes must be applied manually.

DEVELOPER UTILITY VERDICT:
  **Costs time** -- Minimal value from the single change. All substantive work remains.

IF RISK LEVEL IS HIGH -- REQUIRED FIX:
  Same pattern as File 6. See viewCredentialsList required fixes.

---

## File 8

```
---------------------------------------------
`src/views/sources/viewSourcesList.tsx`  [HIGH PRIORITY]
---------------------------------------------
```

CHANGE CLASSIFICATION:
  Mechanical changes present:  yes -- `PageSection variant="light"` removal
  Semantic changes present:    yes -- EmptyState restructure, Modal migration, selectOptions label removal, Button `size`, Td `hasAction`/`isActionCell`
  Non-PF6 changes in golden-source: no

CRITERIA ASSESSMENT:

  1. Import correctness
     **golden-source**: Removed `EmptyStateHeader`, `EmptyStateIcon`. Moved `Modal`, `ModalVariant` to `@patternfly/react-core/deprecated`.
     **semver-migrated**: No import changes.

     Verdict: ❌ Wrong/Missing

  2. Component API alignment
     **golden-source**:
     - `PageSection variant="light"` -> `PageSection hasBodyWrapper={false}`
     - EmptyState restructure
     - selectOptions: removed `label` property
     - `size="sm"` on action Buttons and ActionMenu
     - `Td columnKey="connection"` -> `Td hasAction columnKey="connection"`
     - `Td columnKey="credentials"` -> `Td hasAction columnKey="credentials"`
     - `Td isActionCell columnKey="scan"` -> `Td hasAction columnKey="scan"`
     - `Button variant={ButtonVariant.link}` -> added `size="sm"`

     **semver-migrated**:
     - `PageSection variant="light"` -> `PageSection` (no `hasBodyWrapper={false}`)

     Verdict: ❌ Wrong/Missing

  3. Structural/JSX correctness
     ❌ Wrong/Missing -- EmptyState restructure not performed.

  4. CSS token migration
     N/A for this file (CSS changes are in separate showSourceConnectionsModal.css).

  5. TypeScript correctness
     N/A

  6. Completeness vs. golden-source
     **SUBSET** -- Only 1 change out of ~10 distinct changes.

  7. Half-migration risk
     ⚠️ ELEVATED -- Same as other list views.

  8. Correctness risk
     RISK LEVEL: **HIGH**
     - `EmptyStateHeader` and `EmptyStateIcon` may not exist in PF6
     - `isActionCell` prop on Td may behave differently in PF6 vs `hasAction`

EVIDENCE REQUIREMENT:
  Semver diff (lines 846-854): only `<PageSection variant="light">` -> `<PageSection>`. Golden diff (lines 3284-3421): shows complete migration with import changes, EmptyState, Modal, selectOptions labels, Button size, Td hasAction, ActionMenu size.

WHAT GOLDEN-SOURCE DID:
  Same comprehensive pattern as the other list views: EmptyState restructure, Modal to deprecated path, selectOptions label removal, Button/ActionMenu `size="sm"`, Td `hasAction` replacing `isActionCell`, PageSection `hasBodyWrapper={false}`.

WHAT SEMVER-MIGRATED DID:
  Only removed `variant="light"` from PageSection.

DELTA:
  Same as viewCredentialsList and viewScansList. Additionally:
  - `Td isActionCell` -> `Td hasAction` (the `isActionCell` prop renamed to `hasAction` in PF6)
  - All selectOptions: remove `label` property

DEVELOPER UTILITY VERDICT:
  **Costs time** -- Same situation as the other list views. Minimal value from single change.

IF RISK LEVEL IS HIGH -- REQUIRED FIX:
  Same pattern as Files 6 and 7, plus:
  - Change `Td isActionCell` to `Td hasAction` on the scan action cell
  - Remove `label` property from all selectOption objects

---

## Mini-Checkpoint

- Evidence cited for all Correct verdicts: **Yes** -- The single Correct verdict (File 5, criterion 3 for `spaceItems` removal) cites the specific diff lines (semver diff line 564-565).
- Specific fix described for all HIGH risk: **Yes** -- All 8 files have HIGH risk and each has a detailed "REQUIRED FIX" section with specific lines, props, and PF6 API patterns.

## Summary Statistics

| File | Risk Level | Completeness | Developer Utility |
|------|-----------|-------------|-------------------|
| typeaheadCheckboxes.tsx | HIGH | DIVERGENT | Costs time |
| viewLayoutToolbar.tsx | HIGH | SUBSET w/errors | Costs time |
| MultiselectFilterControl.tsx | HIGH | DIVERGENT | Costs time |
| SelectFilterControl.tsx | HIGH | DIVERGENT | Costs time |
| FilterToolbar.tsx | HIGH | DIVERGENT | Costs time |
| viewCredentialsList.tsx | HIGH | SUBSET | Costs time |
| viewScansList.tsx | HIGH | SUBSET | Costs time |
| viewSourcesList.tsx | HIGH | SUBSET | Costs time |

**Key Patterns Across All Files:**
1. **Select component rewrite completely missing** (Files 3, 4): The most complex migration -- PF5 deprecated Select to PF6 composition model -- was not attempted by the automation.
2. **EmptyState restructure completely missing** (Files 6, 7, 8): The PF6 EmptyState API change (EmptyStateHeader/EmptyStateIcon removal) was not handled.
3. **Prop renames consistently missed**: `innerRef`->`ref`, `data-ouia-component-id`->`ouiaId`, `variant="icon-button-group"`->`variant="action-group-plain"`, `alignRight`->`alignEnd`, `isActionCell`->`hasAction`.
4. **Only mechanical CSS class/token renames and trivial prop removals were performed**: `pf-v5-*`->`pf-v6-*`, `variant="light"` removal, `chips`->`labels`/`deleteChip`->`deleteLabel`, `spaceItems` removal.
5. **One actively harmful change** (File 1): The spurious `TextInputGroupUtilities` wrapper introduces a structural bug.
6. **One likely build-breaking change** (File 5): `SelectOptionProps` imported from `@patternfly/react-core` (doesn't exist in PF6).

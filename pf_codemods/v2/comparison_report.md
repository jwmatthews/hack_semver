# PatternFly 5 to 6 Migration Detection: pf-codemods vs. frontend-analyzer-provider

## Overview

| Dimension | pf-codemods | frontend-analyzer-provider |
|---|---|---|
| **Approach** | ESLint plugin with AST-aware rules | Automated semver diff analysis + multi-tier fix engine |
| **Total rules** | 106 | 950 |
| **Auto-fix rules** | 75 (71%) | 646 (68%) |
| **Warning / manual-only** | 31 (29%) | 290 (31%) + 36 Manual-strategy |
| **Fix mechanism** | ESLint `--fix` (AST transforms) | Deterministic text replacement, LLM-assisted transforms, structured guidance |
| **Packages covered** | `react-core`, `react-core/deprecated`, `react-core/next`, `react-charts`, `react-tokens`, **`react-component-groups`** | `react-core`, `react-core/deprecated`, `react-core/next`, `react-charts`, `react-tokens`, **`react-table`**, **`react-templates`**, **`react-code-editor`**, **`react-drag-drop`**, `react-icons` |
| **Detection scope** | JSX/TSX source code (imports, props, components) | Source code + CSS stylesheets + TypeScript types + component composition + test impact |

Both tools can **detect AND fix** migration issues. They are not detection-only scanners -- each has a fully functional fix engine, though the approaches differ fundamentally.

---

## Fix Engine Comparison

### pf-codemods: ESLint `--fix`

- **Mechanism:** AST-aware structural transforms via ESLint's fixer API
- **Strengths:** Operates on the parsed AST, so fixes are structurally correct (e.g., moving a prop from one component to a parent, wrapping children in new components, restructuring imports)
- **Scope:** Single-pass per rule; rules can chain (e.g., rename component, then rename its props)
- **75 auto-fix rules** out of 106 total

### frontend-analyzer-provider: Multi-Tier Fix Engine

The fix engine operates in four tiers:

| Tier | Strategy Types | Count | Description |
|---|---|---|---|
| **Deterministic** | CssVariablePrefix, ImportPathChange, Rename, RemoveProp, PropValueChange, UpdateDependency, DeprecatedMigration, ConstantGroup | **485** | Text-replacement fixes with exact search/replace patterns |
| **LLM-assisted** | LlmAssisted | **162** | Structured context (member_mappings, removed_members, overlap_ratio) for AI-guided transforms |
| **Structured guidance** | PropTypeChange, CompositionChange, PropToChild, PropToChildren, ChildToProp | **217** | Machine-readable fix metadata (before/after, strategy details) for semi-automated application |
| **Manual** | Manual | **36** | No automated path; human judgment required |

#### Detailed Strategy Breakdown

| Strategy | Count | Example |
|---|---|---|
| CssVariablePrefix | 235 | `--pf-v5-global--BorderColor--100` -> `--pf-t--global--border--color--default` |
| PropTypeChange | 182 | `DualListSelectorListItem.innerRef`: `RefObject<HTMLLIElement>` -> `RefObject<HTMLLIElement \| null>` |
| LlmAssisted | 162 | SelectProps migration: 7 member mappings, 51 removed members, overlap_ratio=0.318 |
| PropValueChange | 87 | DrawerPanelContent `colorVariant`: `'light-200'` -> `'secondary'` |
| ImportPathChange | 78 | `@patternfly/react-charts` -> `@patternfly/react-charts/victory` |
| RemoveProp | 44 | ToolbarItemVariant: remove `bulk-select`, `chip-group`, `overflow-menu`, `search-filter` |
| Manual | 36 | DualListSelectorTreeItem removed -- no automated migration path |
| CompositionChange | 28 | NotificationDrawerListItemBody must be inside NotificationDrawerListItem |
| Rename | 24 | `TextVariants` -> `ContentVariants` |
| UpdateDependency | 13 | Update `@patternfly/react-table` to `^6.4.1` |
| PropToChild | 4 | Modal `titleIconVariant` -> ModalHeader child component |
| DeprecatedMigration | 2 | Move Chip import from `@patternfly/react-core` to `@patternfly/react-core/deprecated` |
| PropToChildren | 2 | Modal `footer` prop -> ModalFooter children component |
| ConstantGroup | 2 | Combined constant group removals |
| ChildToProp | 1 | EmptyStateIcon child -> EmptyState `icon` prop |

#### LLM-Assisted Fix Details

The `LlmAssisted` strategy provides rich context for AI-guided migration of deprecated components with large API surface changes:

| Component | Mappings | Removed Members | Overlap Ratio |
|---|---|---|---|
| SelectProps | 7 (variant, isPlain, children, zIndex, onSelect, isOpen, className) | 51 (onClear, typeAheadAriaLabel, ...) | 0.318 |
| DropdownProps | 9 | 12 | 0.429 |
| DropdownItemProps | 8 | 12 | 0.727 |
| SelectOptionProps | 7 | 19 | 0.636 |
| SelectGroupProps | 3 | 1 | 1.0 |
| DropdownGroupProps | 3 | 0 | 1.0 |
| TextListVariants | 3 | 0 | 1.0 |
| TextListItemVariants | 3 | 0 | 1.0 |

#### Confidence Levels

| Confidence | Count | Description |
|---|---|---|
| Exact | 171 | Direct rename/replacement, mechanically verifiable |
| High | 475 | Deterministic fix with high certainty |
| Low | 290 | Manual review recommended, complex semantics |

---

## 1. Concerns in pf-codemods but NOT in frontend-analyzer

### 1.1 `@patternfly/react-component-groups` (12 rules)

frontend-analyzer does NOT cover this package at all. pf-codemods provides full migration support:

| Rule | Fix | Description |
|---|---|---|
| `component-groups-contentHeader-rename-to-pageHeader` | Auto-fix | Renames ContentHeader -> PageHeader |
| `componentGroups-errorState-rename-props` | Auto-fix | errorTitle -> titleText, errorDescription -> bodyText, defaultErrorDescription -> defaultBodyText |
| `component-groups-invalidObject-rename-to-missingPage` | Auto-fix | Renames InvalidObject -> MissingPage |
| `component-groups-invalidObject-rename-props` | Auto-fix | invalidObjectTitleText -> titleText, invalidObjectBodyText -> bodyText |
| `component-groups-invalidObjectProps-rename-to-missingPageProps` | Auto-fix | Renames InvalidObjectProps -> MissingPageProps |
| `component-groups-multi-content-card-remove-props` | Auto-fix | Removes leftBorderVariant, withHeaderBorder props |
| `component-groups-notAuthorized-rename-to-unauthorizedAccess` | Auto-fix | Renames NotAuthorized -> UnauthorizedAccess |
| `component-groups-notAuthorized-rename-props` | Auto-fix | description -> bodyText, title -> titleText |
| `component-groups-unavailableContent-bodyText-props-update` | Auto-fix | Merges pre/post status link text into bodyText |
| `component-groups-unavailable-content-rename-props` | Auto-fix | unavailableTitleText -> titleText |
| `componentGroups-logSnippet-rename-leftBorderVariant` | Auto-fix | leftBorderVariant -> variant, LogSnippetBorderVariant -> AlertVariant |
| `user-feedback-warn-changes` | Warning | FeedbackModal no longer references SCSS internally |

### 1.2 Behavioral/Markup Warnings (31 warning-only rules)

pf-codemods includes 31 rules that warn about DOM/markup changes, behavioral differences, or situations requiring developer judgment. frontend-analyzer does not emit these behavioral warnings (it covers some of the same concerns via `test-impact` and `conformance` rules, but not all):

| Rule | Component | Warning |
|---|---|---|
| `accordionItem-warn-update-markup` | AccordionItem | Now renders a div wrapper element |
| `button-support-favorite-variant` | Button | Recommends isFavorite/isFavorited props instead of StarIcon |
| `drawerHead-warn-updated-markup` | DrawerHead | DrawerPanelBody no longer rendered internally |
| `helperTextItem-warn-screenReaderText-update` | HelperTextItem | screenReaderText behavior changed |
| `jumpLinksItem-href-required` | JumpLinksItem | href prop now required |
| `jumpLinksItem-warn-markup-change` | JumpLinksItem | Uses Button internally now |
| `loginMainHeader-warn-updated-markup` | LoginMainHeader | Uses div instead of header element |
| `logViewer-moved-styles` | LogViewer | Stylesheet moved to LogViewer package |
| `menuItemAction-warn-update-markup` | MenuItemAction | Uses Button internally with wrapper |
| `menuToggle-warn-iconOnly-toggle` | MenuToggle | Icons should go to icon prop, not children |
| `notificationBadge-warn-markup-change` | NotificationBadge | Uses stateful button internally |
| `notificationDrawerHeader-warn-update-markup` | NotificationDrawerHeader | Renders native h1, not Text component |
| `page-warn-updated-markup` | Page | PageBody wrapper always applied |
| `pageSection-warn-variantClasses-applied` | PageSection | Variant classes only apply when type='default' |
| `pagination-warn-markup-changed` | Pagination | Wrapper element around PaginationOptionsMenu toggle |
| `popper-update-appendTo-default` | Dropdown/Select/Popper | Default appendTo changed to document.body |
| `remove-deprecated-components` | Various | ApplicationLauncher, ContextSelector, old Dropdown, etc. removed |
| `simpleFileUpload-warn-changes` | SimpleFileUpload | aria-describedby and id attributes changed |
| `sliderStep-warn-update-markup` | Slider | CSS variable name changed |
| `Th-Td-warn-update-markup` | Th/Td | CSS variable Left/Right -> InsetInlineStart/InsetInlineEnd |
| `tabs-update-markup` | Tabs | Scroll buttons markup updated |
| `toolbarLabelGroupContent-updated-markup` | ToolbarLabelGroupContent | Markup changed for filters/clear button |
| `treeView-warn-selectable-styling-modifier-removed` | TreeView | pf-m-selectable CSS class removed |
| `wizardFooter-warn-update-markup` | Wizard | Uses ActionList wrapped around Buttons |
| `wizardNavItem-warn-update-markup` | WizardNavItem | New wrapper element, error icon before content |

### 1.3 Code Quality/Workflow Utilities (3 rules)

| Rule | Description |
|---|---|
| `data-codemods-cleanup` | Removes `data-codemods` attributes and comments left by prior codemod runs |
| `no-duplicate-import-specifiers` | Removes duplicate import specifiers from @patternfly imports |
| `no-unused-imports-v6` | Removes unused PatternFly imports after other codemods run |

### 1.4 Sophisticated Component Replacement Transforms

These pf-codemods rules perform complex structural transforms that go beyond simple rename/remove:

| Rule | Description |
|---|---|
| `kebabToggle-replace-with-menuToggle` | Replaces deprecated KebabToggle with MenuToggle (variant='plain' + EllipsisVIcon) |
| `emptyStateHeader-move-into-emptyState` | Removes EmptyStateHeader/EmptyStateIcon children and moves them to EmptyState props |
| `masthead-structure-changes` | Moves MastheadToggle into MastheadMain; wraps MastheadLogo in MastheadBrand |
| `loginMainFooterLinksItem-structure-updated` | Moves href, target to child Button wrapper |
| `button-moveIcons-icon-prop` | Moves icon children to the `icon` prop |
| `pageToggleButton-replace-barsIcon-with-isHamburgerButton` | Replaces BarsIcon child with isHamburgerButton prop |
| `chip-replace-with-label` | Full Chip -> Label replacement with prop mapping |
| `text-replace-with-content` | Replaces Text/TextContent/TextList/TextListItem with unified Content |
| `enable-animations` | Adds hasAnimations prop to 6+ component types |

---

## 2. Concerns in frontend-analyzer but NOT in pf-codemods

### 2.1 TypeScript Type Compatibility Changes (77 rules)

pf-codemods does not detect or fix TypeScript type changes. frontend-analyzer covers:

- **`ReactElement` -> `ReactElement<any>`** across 30+ component props (affects type assertions, generic constraints)
- **`RefObject<T>` -> `RefObject<T | null>`** for ref props (DualListSelectorListItem, etc.)
- **Narrowed union types** (e.g., enum members removed from union props)
- **Strategy:** PropTypeChange (182 rules), with structured before/after type information
- **Confidence:** Low (requires manual review of consumer type assertions)

### 2.2 Component Composition/Conformance Rules (110 rules)

frontend-analyzer validates structural parent-child relationships that pf-codemods does not check:

- **AccordionItem must contain AccordionContent** and vice versa
- **DataList cells must be in ItemCells within Item or ItemRow**
- **DescriptionList descriptions must be in Group or Term**
- **DualListSelector panes, controls, trees have specific nesting requirements** (15+ conformance rules)
- **Nav item separators** must be in specific containers
- **NotificationDrawer list item bodies** must be inside list items
- **Table Td/Th** must be within Tr, Tbody, or Thead
- **Tabs TabAction** must be within Tab
- **Strategy:** CompositionChange (28 fix strategies) + conformance detection (110 rules)

### 2.3 React Context Dependency Changes (14 rules)

frontend-analyzer detects when components now require context providers that were previously optional:

- **DrawerContext** required for Drawer sub-components
- **NavContext** required for Nav sub-components
- **TabsContext** (5 rules) required for Tabs sub-components
- **ToolbarContext** (2 rules) required for Toolbar sub-components
- **WizardContext** required for Wizard sub-components

### 2.4 Test Impact Rules (28 rules)

frontend-analyzer flags DOM output changes that break snapshot or assertion-based tests:

- Accordion, Alert, Button, Card, Checkbox, ClipboardCopy, DataList, DatePicker, Divider, DualListSelector markup changes
- EmptyState, ExpandableSection, FileUpload, FormSelect, Hint, JumpLinks markup changes
- ListItem, LoginForm, Menu, Modal, Nav, OverflowMenu, Page, Pagination markup changes
- Progress, ProgressStepper, SearchInput, Sidebar, SimpleList, Tabs, TextInputGroup, ToggleGroup, Toolbar, TreeView, Truncate markup changes

### 2.5 Consumer CSS Variable Changes (233 rules)

frontend-analyzer detects CSS custom property renames in **stylesheets** (`.css`, `.scss`, `.less`), not just in JavaScript token imports:

- **228 global CSS variable renames** (`--pf-v5-global--*` -> `--pf-t--global--*` or `--pf-v6--*`)
- Covers colors, spacing, fonts, borders, shadows, breakpoints, palette tokens, icon sizes, link styles
- **Strategy:** CssVariablePrefix (235 fix strategies) with deterministic search/replace
- **pf-codemods** only handles JS-level token imports (`tokens-update`, `tokens-prefix-with-t`)

### 2.6 Package-Level Coverage Gaps

frontend-analyzer covers packages that pf-codemods does not:

| Package | FA Rules | Key Changes |
|---|---|---|
| `@patternfly/react-table` | 31 | IColumn, IEditableSelectInputCell, CollapseColumn, SortColumn, Td/Th/Tr, Table composition, treeRow |
| `@patternfly/react-templates` | 16 | SimpleSelect, CheckboxSelect, MultiTypeaheadSelect, TypeaheadSelect -- prop renames, type changes |
| `@patternfly/react-code-editor` | 3 | CodeEditor, CodeEditorProps changes |
| `@patternfly/react-drag-drop` | 17 | DragDropContainer, DragDropSort -- new APIs, prop changes |
| `@patternfly/react-icons` | 1 | Icon component changes |

### 2.7 Other Unique Categories

| Category | Count | Examples |
|---|---|---|
| **Signature changes** | 111 | New optional/required props added to components (not just renamed -- entirely new API surface) |
| **Required props added** | 12 | Props that were optional or did not exist are now required |
| **CSS class removals** | 8 | `pf-m-selectable`, etc. removed from component CSS |
| **Dependency updates** | 13 | Peer dependency version bumps for all PF packages |
| **Prop attribute overrides** | 2 | Prop values that override HTML attributes |
| **Manifest** | 1 | Package manifest/export map changes |

---

## 3. Areas of Strong Overlap

The following concerns are covered by **both** tools, though their fix approaches differ:

### 3.1 Prop Renames

| Component | Concern | pf-codemods Fix | FA Strategy |
|---|---|---|---|
| Avatar | `border` -> `isBordered` | ESLint auto-fix | Rename |
| Button | `isActive` -> `isClicked` | ESLint auto-fix | Rename |
| Checkbox/Radio | `isLabelBeforeButton` -> `labelPosition="start"` | ESLint auto-fix | PropValueChange |
| FormGroup | `labelIcon` -> `labelHelp` | ESLint auto-fix | Rename |
| Label | `isOverflowLabel` -> `variant="overflow"` | ESLint auto-fix | PropValueChange |
| Masthead | MastheadBrand -> MastheadLogo | ESLint auto-fix | Rename |
| MenuToggle | `splitButtonOptions` -> `splitButtonItems` | ESLint auto-fix | Rename |
| Nav | `variant="tertiary"` -> `variant="horizontal-subnav"` | ESLint auto-fix | PropValueChange |
| Page | `header` -> `masthead` | ESLint auto-fix | Rename |
| Page | `isTertiaryNavGrouped` -> `isHorizontalSubnavGrouped` | ESLint auto-fix | Rename |
| Page | `tertiaryNav` -> `horizontalSubnav` | ESLint auto-fix | Rename |
| Tabs | `isSecondary` -> `isSubtab` | ESLint auto-fix | Rename |
| Toolbar | chip-related props -> label-related props | ESLint auto-fix | Rename |
| Toolbar | `spacer` -> `gap` | ESLint auto-fix | Rename |
| ToolbarChipGroupContent | -> ToolbarLabelGroupContent | ESLint auto-fix | Rename |

### 3.2 Prop Removals

| Component | Removed Prop(s) | pf-codemods Fix | FA Strategy |
|---|---|---|---|
| AccordionContent | `isHidden` | ESLint auto-fix | RemoveProp |
| Card | isSelectableRaised, isDisabledRaised, hasSelectableInput, etc. | ESLint auto-fix | RemoveProp |
| DataListAction | `isPlainButtonAction` | ESLint auto-fix | RemoveProp |
| DrawerHead | `hasNoPadding` | ESLint auto-fix | RemoveProp |
| ExpandableSection | `isActive` | ESLint auto-fix | RemoveProp |
| HelperTextItem | `hasIcon`, `isDynamic` | ESLint auto-fix | RemoveProp |
| Masthead | `backgroundColor` | ESLint auto-fix | RemoveProp |
| Nav | `theme` | ESLint auto-fix | RemoveProp |
| NavItem | `hasNavLinkWrapper` | ESLint auto-fix | RemoveProp |
| PageSidebar | `theme` | ESLint auto-fix | RemoveProp |
| Switch | `labelOff` | ESLint auto-fix | RemoveProp |
| Toolbar | `usePageInsets`, `alignSelf`, `widths`, `alignment` | ESLint auto-fix | RemoveProp |

### 3.3 Prop Value Changes

| Component | Concern | pf-codemods Fix | FA Strategy |
|---|---|---|---|
| Banner/Label | `color='cyan'` -> `'teal'`, `'gold'` -> `'yellow'` | ESLint auto-fix | PropValueChange |
| Drawer* | `colorVariant='light-200'` -> `'secondary'` | ESLint auto-fix | PropValueChange |
| DrawerContent | `colorVariant='no-background'` removed | ESLint auto-fix | PropValueChange |
| PageSection | `variant` values restricted to 'default'/'secondary' | ESLint auto-fix | PropValueChange |
| PageSection | `type='nav'` removed | ESLint auto-fix | PropValueChange |
| Tabs | `variant='light300'` -> `'secondary'` | ESLint auto-fix | PropValueChange |
| ToolbarGroup | `'button-group'` -> `'action-group'`, `'icon-button-group'` -> `'action-group-plain'` | ESLint auto-fix | PropValueChange |
| ToolbarItem | `'chip-group'` -> `'label-group'`; remove bulk-select, overflow-menu, search-filter | ESLint auto-fix | PropValueChange |
| Toolbar | `alignLeft` -> `alignStart`, `alignRight` -> `alignEnd` | ESLint auto-fix | PropValueChange |

### 3.4 Import Path Changes

| Concern | pf-codemods | FA Strategy |
|---|---|---|
| Charts -> `@patternfly/react-charts/victory` | ESLint auto-fix (chartsImport-moved) | ImportPathChange (78 rules, one per interface) |
| Chip -> `@patternfly/react-core/deprecated` | ESLint auto-fix (chip-deprecated) | DeprecatedMigration |
| DragDrop -> `@patternfly/react-core/deprecated` | ESLint auto-fix (dragDrop-deprecated) | DeprecatedMigration |
| DualListSelector -> `@patternfly/react-core/deprecated` | ESLint auto-fix | DeprecatedMigration |
| DualListSelector from /next -> main | ESLint auto-fix | ImportPathChange |
| Modal -> `@patternfly/react-core/deprecated` | ESLint auto-fix | DeprecatedMigration |
| Modal from /next -> main | ESLint auto-fix | ImportPathChange |
| Tile -> `@patternfly/react-core/deprecated` | ESLint auto-fix | DeprecatedMigration |

### 3.5 Component Restructuring

| Concern | pf-codemods | FA Strategy |
|---|---|---|
| EmptyState: EmptyStateHeader/Icon -> props | ESLint auto-fix (complex AST transform) | ChildToProp + LlmAssisted |
| Text -> Content (unified component) | ESLint auto-fix (comprehensive rename) | Rename + LlmAssisted |
| Masthead structure (MastheadToggle, MastheadBrand) | ESLint auto-fix (structural) | Rename + CompositionChange |
| Modal restructuring (titleIconVariant -> ModalHeader, footer -> ModalFooter) | Warning only (modal-deprecated) | PropToChild + PropToChildren |
| Deprecated component removals (ApplicationLauncher, old Select, old Dropdown) | Warning only | LlmAssisted (with member mappings) |

### 3.6 Token/CSS Variable Updates

| Scope | pf-codemods | frontend-analyzer |
|---|---|---|
| **JS token imports** (`@patternfly/react-tokens`) | `tokens-update` + `tokens-prefix-with-t` (ESLint auto-fix) | Not covered at JS import level |
| **CSS stylesheet variables** (`--pf-v5-*` in .css/.scss) | Not covered | CssVariablePrefix (235 rules, deterministic fix) |

This is a key complementary split: pf-codemods handles the JavaScript side, frontend-analyzer handles the CSS side.

---

## 4. Key Takeaways

### What frontend-analyzer brings that pf-codemods cannot

1. **TypeScript type compatibility analysis** (77 rules) -- detects breaking type changes that would only surface at compile time, not at the component usage level
2. **Component composition validation** (110 rules) -- enforces correct parent-child nesting that ESLint rules don't structurally validate
3. **CSS stylesheet migration** (233 rules) -- finds and fixes `--pf-v5-*` variable usage in CSS/SCSS/LESS files, not just JS
4. **Test impact warnings** (28 rules) -- proactively flags DOM output changes that will break existing tests
5. **Context dependency detection** (14 rules) -- identifies new context provider requirements
6. **Broader package coverage** -- `react-table` (31 rules), `react-templates` (16), `react-drag-drop` (17), `react-code-editor` (3)
7. **LLM-assisted migration for complex API changes** -- provides structured member mappings and overlap ratios for deprecated component migration (Select, Dropdown, etc.)
8. **Dependency update guidance** (13 rules) -- explicit version targets for peer dependencies

### What pf-codemods provides that frontend-analyzer cannot

1. **`@patternfly/react-component-groups` coverage** (12 rules) -- the only tool covering this package
2. **AST-aware structural transforms** -- can move props between parent/child components, restructure JSX trees, wrap elements (e.g., Masthead restructuring, EmptyState header-to-props, LoginMainFooterLinksItem button wrapping)
3. **Sophisticated component replacements** -- KebabToggle -> MenuToggle, Chip -> Label with full prop mapping, Text -> Content with component prop inference
4. **Behavioral/markup warnings** (31 rules) -- alerts developers to DOM changes that may affect styling, testing, or accessibility
5. **Migration workflow utilities** -- cleanup of codemods artifacts, duplicate import removal, unused import cleanup
6. **JS-level token migration** -- renames token imports in JavaScript/TypeScript source files

### How They Are Complementary

The two tools have fundamentally different detection strategies that make them **complementary rather than competing**:

| Dimension | pf-codemods | frontend-analyzer |
|---|---|---|
| **Detection method** | Pattern-match on AST nodes in source files | Semver diff analysis of package type definitions + CSS analysis |
| **Fix precision** | High (AST-aware, structurally correct) | Varies by tier (exact for deterministic, guidance for complex) |
| **What it sees** | JSX/TSX source code | Types, CSS, composition rules, test output, package manifests |
| **What it misses** | Types, CSS stylesheets, composition, test impact | react-component-groups, behavioral warnings, complex AST restructuring |

**Recommended workflow:**
1. Run **pf-codemods** first for AST-aware source transforms (prop renames, component restructuring, import changes)
2. Run **frontend-analyzer** for CSS variable migration, type compatibility checks, composition validation, and test impact assessment
3. Use frontend-analyzer's **LLM-assisted** strategies for complex deprecated component migration (Select, Dropdown) where pf-codemods only warns
4. Review **pf-codemods warning-only rules** for behavioral changes that neither tool auto-fixes

---

## Appendix A: Complete pf-codemods Rule Catalog

### Accordion (3 rules)
| Rule | Fix | Description |
|---|---|---|
| `accordionContent-remove-isHidden-prop` | Auto-fix | Removes isHidden prop |
| `accordionItem-warn-update-markup` | Warning | Markup updated with div wrapper |
| `accordionToggle-move-isExpanded-prop` | Auto-fix | Moves isExpanded from AccordionToggle to AccordionItem |

### Avatar (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `avatar-replace-border-for-isBordered` | Auto-fix | Renames border -> isBordered |

### Banner (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `banner-replace-variantProp` | Auto-fix | Removes variant, recommends color/status |
| `colorProps-replaced-colors` | Auto-fix | cyan -> teal, gold -> yellow (shared with Label) |

### Button (3 rules)
| Rule | Fix | Description |
|---|---|---|
| `button-moveIcons-icon-prop` | Auto-fix | Moves icon children to icon prop |
| `button-rename-isActive` | Auto-fix | isActive -> isClicked |
| `button-support-favorite-variant` | Warning | Recommends isFavorite/isFavorited |

### Card (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `card-remove-various-props` | Auto-fix | Removes isSelectableRaised, isDisabledRaised, hasSelectableInput, etc. |
| `card-updated-clickable-markup` | Auto-fix | Removes selectableActions.selectableActionId and name |

### Charts (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `chartsImport-moved` | Auto-fix | @patternfly/react-charts -> @patternfly/react-charts/victory |

### Checkbox/Radio (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `checkbox-radio-replace-isLabelBeforeButton` | Auto-fix | isLabelBeforeButton -> labelPosition="start" |

### Chip (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `chip-deprecated` | Auto-fix | Moves imports to deprecated package |
| `chip-replace-with-label` | Auto-fix | Full Chip -> Label replacement |

### DataListAction (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `dataListAction-remove-isPlainButtonAction-prop` | Auto-fix | Removes isPlainButtonAction |

### DragDrop (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `dragDrop-deprecated` | Auto-fix | Moves imports to deprecated package |

### Drawer (4 rules)
| Rule | Fix | Description |
|---|---|---|
| `drawerContent-replace-noBackground-colorVariant` | Auto-fix | Removes no-background colorVariant |
| `drawerHead-remove-hasNoPadding-prop` | Auto-fix | Removes hasNoPadding |
| `drawerHead-warn-updated-markup` | Warning | DrawerPanelBody no longer internal |
| `drawer-replace-colorVariant-light200` | Auto-fix | light-200 -> secondary |

### DualListSelector (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `dualListSelector-deprecated` | Auto-fix | Moves imports to deprecated |
| `dualListSelectorNext-promoted` | Auto-fix | /next -> main package |

### EmptyState (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `emptyStateHeader-move-into-emptyState` | Auto-fix | Moves EmptyStateHeader/Icon into EmptyState props |
| `emptyState-nonExported-components` | Auto-fix | Removes EmptyStateHeader/Icon exports |

### ExpandableSection (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `expandableSection-remove-isActive-prop` | Auto-fix | Removes isActive |

### FormFieldGroup (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `formFiledGroupHeaderTitleTextObject-renamed` | Auto-fix | Typo fix: FormFiled -> FormField |

### FormGroup (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `formGroup-rename-labelIcon` | Auto-fix | labelIcon -> labelHelp |

### HelperTextItem (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `helperTextItem-remove-props` | Auto-fix | Removes hasIcon, isDynamic |
| `helperTextItem-warn-screenReaderText-update` | Warning | screenReaderText behavior changed |

### JumpLinksItem (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `jumpLinksItem-href-required` | Warning | href now required |
| `jumpLinksItem-warn-markup-change` | Warning | Uses Button internally |

### KebabToggle (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `kebabToggle-replace-with-menuToggle` | Auto-fix | KebabToggle -> MenuToggle with EllipsisVIcon |

### Label (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `label-remove-isOverflowLabel` | Auto-fix | isOverflowLabel -> variant="overflow" |

### Login (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `loginMainFooterLinksItem-structure-updated` | Auto-fix | Wraps children in Button |
| `loginMainHeader-warn-updated-markup` | Warning | div instead of header |

### LogViewer (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `logViewer-moved-styles` | Warning | Stylesheet moved |

### Masthead (3 rules)
| Rule | Fix | Description |
|---|---|---|
| `masthead-name-changes` | Auto-fix | MastheadBrand -> MastheadLogo |
| `masthead-remove-background-color` | Auto-fix | Removes backgroundColor |
| `masthead-structure-changes` | Auto-fix | MastheadToggle -> MastheadMain; MastheadLogo wrapped in MastheadBrand |

### Menu (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `menuItemAction-warn-update-markup` | Warning | Uses Button internally |
| `menuToggle-remove-splitButtonOptions` | Auto-fix | splitButtonOptions -> splitButtonItems |
| `menuToggle-warn-iconOnly-toggle` | Warning | Icons to icon prop |

### Modal (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `modal-deprecated` | Auto-fix | Moves imports to deprecated |
| `modalNext-promoted` | Auto-fix | /next -> main package |

### Nav (4 rules)
| Rule | Fix | Description |
|---|---|---|
| `navItem-remove-hasNavLinkWrapper-prop` | Auto-fix | Removes hasNavLinkWrapper |
| `nav-remove-tertiary-variant` | Auto-fix | tertiary -> horizontal-subnav |
| `nav-remove-theme-prop` | Auto-fix | Removes theme |

### NotificationBadge/Drawer (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `notificationBadge-warn-markup-change` | Warning | Uses stateful button |
| `notificationDrawerHeader-warn-update-markup` | Warning | Renders native h1 |

### Page (10 rules)
| Rule | Fix | Description |
|---|---|---|
| `pageBreadcrumbAndSection-warn-updated-wrapperLogic` | Auto-fix | Adds hasBodyWrapper prop |
| `pageHeaderToolsItem-remove-isSelected-prop` | Auto-fix | Removes isSelected |
| `pageNavigation-remove-component` | Auto-fix | Removes PageNavigation component |
| `page-rename-header` | Auto-fix | header -> masthead |
| `page-rename-isTertiaryNavGrouped` | Auto-fix | -> isHorizontalSubnavGrouped |
| `page-rename-isTertiaryNavWidthLimited` | Auto-fix | -> isHorizontalSubnavWidthLimited |
| `page-rename-tertiaryNav` | Auto-fix | tertiaryNav -> horizontalSubnav |
| `pageSection-remove-nav-type` | Auto-fix | Removes type='nav' |
| `pageSection-update-variant-values` | Auto-fix | Restricts to default/secondary |
| `pageSection-warn-variantClasses-applied` | Warning | Only apply when type='default' |

### PageSidebar (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `pageSidebar-remove-theme-prop` | Auto-fix | Removes theme |

### PageToggleButton (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `pageToggleButton-replace-barsIcon-with-isHamburgerButton` | Auto-fix | BarsIcon -> isHamburgerButton |

### Pagination (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `pagination-warn-markup-changed` | Warning | Wrapper element added |

### Popper (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `popper-update-appendTo-default` | Warning | Default appendTo changed |

### SimpleFileUpload (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `simpleFileUpload-warn-changes` | Warning | Attribute changes |

### Slider (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `sliderStep-warn-update-markup` | Warning | CSS variable renamed |

### Switch (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `switch-remove-labelOff` | Auto-fix | Removes labelOff |

### Tabs (3 rules)
| Rule | Fix | Description |
|---|---|---|
| `tabs-renamed-isSecondary-prop` | Auto-fix | isSecondary -> isSubtab |
| `tabs-replace-variant-light300` | Auto-fix | light300 -> secondary |
| `tabs-update-markup` | Warning | Scroll buttons updated |

### Text (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `text-replace-with-content` | Auto-fix | Text/TextContent/TextList/TextListItem -> Content |

### Th/Td (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `Th-Td-warn-update-markup` | Warning | CSS variable Left/Right -> InsetInlineStart/InsetInlineEnd |

### Tile (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `tile-deprecated` | Auto-fix | Moves imports to deprecated |

### Tokens (2 rules)
| Rule | Fix | Description |
|---|---|---|
| `tokens-prefix-with-t` | Auto-fix | Adds t_ prefix to token imports |
| `tokens-update` | Auto-fix | Updates old tokens to new equivalents |

### Toolbar (8 rules)
| Rule | Fix | Description |
|---|---|---|
| `toolbarChipGroupContent-rename-component` | Auto-fix | -> ToolbarLabelGroupContent |
| `toolbarGroup-updated-variant` | Auto-fix | button-group -> action-group, icon-button-group -> action-group-plain |
| `toolbarItem-variant-prop-updates` | Auto-fix | chip-group -> label-group; removes deprecated variants |
| `toolbarLabelGroupContent-updated-markup` | Warning | Markup changed |
| `toolbar-remove-props` | Auto-fix | Removes usePageInsets, alignSelf, widths, alignment |
| `toolbar-rename-chip-props` | Auto-fix | chip -> label prop renames |
| `toolbar-rename-interfaces` | Auto-fix | ToolbarChipGroup -> ToolbarLabelGroup, etc. |
| `toolbar-replaced-spacer-spaceItems` | Auto-fix | spacer -> gap; removes spaceItems |
| `toolbar-update-align-values` | Auto-fix | alignLeft -> alignStart, alignRight -> alignEnd |

### TreeView (1 rule)
| Rule | Fix | Description |
|---|---|---|
| `treeView-warn-selectable-styling-modifier-removed` | Warning | pf-m-selectable removed |

### Wizard (3 rules)
| Rule | Fix | Description |
|---|---|---|
| `wizardFooter-warn-update-markup` | Warning | Uses ActionList |
| `wizardNavItem-warn-update-markup` | Warning | New wrapper, error icon before content |
| `wizardStep-updated-body-typing` | Auto-fix | Removes body={null} |

### Various / General (5 rules)
| Rule | Fix | Description |
|---|---|---|
| `data-codemods-cleanup` | Auto-fix | Removes data-codemods attributes |
| `enable-animations` | Auto-fix | Adds hasAnimations to applicable components |
| `no-duplicate-import-specifiers` | Auto-fix | Removes duplicate imports |
| `no-unused-imports-v6` | Auto-fix | Removes unused PF imports |
| `remove-deprecated-components` | Warning | ApplicationLauncher, ContextSelector, old Dropdown, etc. |

### react-component-groups (12 rules)
| Rule | Fix | Description |
|---|---|---|
| `component-groups-contentHeader-rename-to-pageHeader` | Auto-fix | ContentHeader -> PageHeader |
| `componentGroups-errorState-rename-props` | Auto-fix | errorTitle -> titleText, etc. |
| `component-groups-invalidObject-rename-to-missingPage` | Auto-fix | InvalidObject -> MissingPage |
| `component-groups-invalidObject-rename-props` | Auto-fix | Prop renames |
| `component-groups-invalidObjectProps-rename-to-missingPageProps` | Auto-fix | Interface rename |
| `component-groups-multi-content-card-remove-props` | Auto-fix | Removes leftBorderVariant, withHeaderBorder |
| `component-groups-notAuthorized-rename-to-unauthorizedAccess` | Auto-fix | NotAuthorized -> UnauthorizedAccess |
| `component-groups-notAuthorized-rename-props` | Auto-fix | description -> bodyText, title -> titleText |
| `component-groups-unavailableContent-bodyText-props-update` | Auto-fix | Merges pre/post text props |
| `component-groups-unavailable-content-rename-props` | Auto-fix | unavailableTitleText -> titleText |
| `componentGroups-logSnippet-rename-leftBorderVariant` | Auto-fix | leftBorderVariant -> variant |
| `user-feedback-warn-changes` | Warning | FeedbackModal SCSS reference removed |

---

## Appendix B: frontend-analyzer Rule Summary by Category

### By Change Type

| Change Type | Count | Description |
|---|---|---|
| css-variable | 233 | CSS custom property renames (`--pf-v5-*` -> `--pf-t--*` / `--pf-v6-*`) |
| signature-changed | 111 | New/changed function/prop signatures |
| conformance | 110 | Component composition structural requirements |
| renamed | 100 | Props, interfaces, or exports renamed |
| type-changed | 77 | TypeScript type narrowing/widening |
| removed | 76 | Props or exports deleted |
| prop-value-removed | 74 | Specific enum/string values removed from props |
| component-removal | 50 | Entire deprecated components removed |
| test-impact | 28 | DOM output changes affecting tests |
| composition | 18 | Component composition patterns changed |
| context-dependency | 14 | New context provider requirements |
| prop-value-change | 13 | Prop value semantics changed |
| dependency-update | 13 | Peer dependency version changes |
| required-prop-added | 12 | New required props |
| css-removal | 8 | CSS class/rule removals |
| prop-to-child | 6 | Props moved to child components |
| deprecated-migration | 2 | Import path changes for deprecated items |
| prop-attribute-override | 2 | Prop/attribute interaction changes |
| manifest | 1 | Package export map changes |
| css-class | 1 | CSS class name changes |
| child-to-prop | 1 | Children moved to props |
| **Total** | **950** | |

### By Package Coverage

| Package | Rules | Key Changes |
|---|---|---|
| `@patternfly/react-core` | 437 | Prop renames, removals, value changes, type changes across 100+ components |
| (unknown/cross-cutting) | 319 | CSS variables, conformance, test-impact, context-dependency |
| `@patternfly/react-charts` | 82 | Import path changes to /victory, interface renames, type changes |
| `@patternfly/react-core/deprecated` | 37 | Deprecated component removals (ApplicationLauncher, old Select, old Dropdown, OptionsMenu) |
| `@patternfly/react-table` | 31 | IColumn, IEditableSelectInputCell, composition, SortColumn, CollapseColumn |
| `@patternfly/react-templates` | 16 | SimpleSelect, CheckboxSelect, TypeaheadSelect, MultiTypeaheadSelect |
| `@patternfly/react-drag-drop` | 13 | DragDropContainer, DragDropSort API changes |
| `@patternfly/react-drag-drop/next` | 4 | Next-generation drag-drop components |
| `@patternfly/react-tokens` | 4 | Token constant changes |
| `@patternfly/react-code-editor` | 3 | CodeEditor, CodeEditorProps |
| `@patternfly/react-core/next` | 3 | Components promoted from /next |
| `@patternfly/react-icons` | 1 | Icon changes |

---

## Appendix C: Detailed frontend-analyzer Findings by Component

### High-Impact Components (10+ rules)

- **ToolbarGroup** (28 rules): Variant renames, prop removals, alignment value changes, type changes, conformance, context dependencies, test impact
- **ToolbarItem** (22 rules): Variant updates, prop removals, type changes, conformance, context dependencies
- **ToolbarToggleGroup** (17 rules): Alignment, variant, spacing prop changes, type changes, conformance
- **Modal** (14 rules): Full restructuring (titleIconVariant, footer, header to sub-components), type changes, composition, deprecated migration
- **IconComponent** (14 rules): Size prop changes, type changes, conformance rules
- **PageSection** (9 rules): Variant restrictions, type removal, wrapper logic, conformance
- **Page** (8 rules): Prop renames, required prop changes, markup, conformance
- **Dropdown** (8 rules): Deprecated component with member mappings for migration
- **ToolbarFilter** (7 rules): Chip->label prop renames, type changes, context
- **Label** (7 rules): isOverflowLabel, color changes, type changes, conformance
- **Tabs** (7 rules): isSecondary->isSubtab, light300->secondary, type changes, conformance

### Chart Components (82 rules)

All chart components have 2-3 rules each, primarily:
- Import path change to `@patternfly/react-charts/victory`
- Interface/props type renames
- Components: ChartArea, ChartAxis, ChartBar, ChartBoxPlot, ChartBullet (and sub-components), ChartContainer, ChartCursorContainer, ChartDonut, ChartDonutThreshold, ChartDonutUtilization, ChartGroup, ChartLabel, ChartLegend, ChartLine, ChartPie, ChartPoint, ChartScatter, ChartStack, ChartThreshold, ChartTooltip, ChartVoronoiContainer, and related helper functions

### Deprecated Components (50 component-removal rules)

- ApplicationLauncher and sub-components (6 rules)
- ContextSelector and sub-components (4 rules)
- Old Dropdown and sub-components (8 rules)
- Old Select and sub-components (8 rules)
- OptionsMenu and sub-components (6 rules)
- PageHeader and related (4 rules)
- BadgeToggle, KebabToggle, Separator (3 rules)
- DragDrop deprecated components (4 rules)
- Other deprecated items (7 rules)

### DualListSelector (20+ rules)

Extensive conformance rules for nested component requirements (Control, Pane, Tree, List, ListItem) plus type changes and deprecated migration.

### Nav (10+ rules)

Variant renames, theme removal, conformance for item separators, context dependencies, type changes.

### DataList (10+ rules)

Conformance rules for cell/toggle nesting, prop removals, type changes, test impact.

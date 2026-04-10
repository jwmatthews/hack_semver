# PatternFly 5 to 6 Migration Detection: pf-codemods vs. frontend-analyzer-provider

**Generated:** 2026-04-10

## Overview

| | **pf-codemods** | **frontend-analyzer-provider** |
|---|---|---|
| **Approach** | Hand-written ESLint rules by PF maintainers | Automated semver diff analysis of TypeScript declarations |
| **Total rules** | 106 | 950 |
| **Auto-fix** | 78 rules (74%) provide automatic code fixes | Detection only (no auto-fix) |
| **Packages covered** | `react-core`, `react-charts`, `react-component-groups`, `react-tokens` | `react-core`, `react-charts`, `react-table`, `react-templates`, `react-drag-drop`, `react-code-editor`, `react-tokens`, `react-icons`, CSS/stylesheets |

---

## 1. Concerns in pf-codemods but NOT in frontend-analyzer-provider

These are migration concerns that pf-codemods detects but have **no equivalent** in the frontend-analyzer rules.

### @patternfly/react-component-groups (11 rules -- entirely missing)

The frontend-analyzer-provider does **not analyze the `@patternfly/react-component-groups` package at all**. This means the following are undetected:

| pf-codemods rule | What it catches |
|---|---|
| `componentGroups-logSnippet-rename-leftBorderVariant` | `leftBorderVariant` to `variant` on LogSnippet |
| `component-groups-contentHeader-rename-to-pageHeader` | ContentHeader to PageHeader rename |
| `componentGroups-errorState-rename-props` | `errorTitle` to `titleText`, `errorDescription` to `bodyText` |
| `component-groups-invalidObject-rename-to-missingPage` | InvalidObject to MissingPage rename |
| `component-groups-invalidObject-rename-props` | InvalidObject prop renames |
| `component-groups-invalidObjectProps-rename-to-missingPageProps` | Interface rename |
| `component-groups-multi-content-card-remove-props` | `leftBorderVariant`, `withHeaderBorder` removal |
| `component-groups-notAuthorized-rename-to-unauthorizedAccess` | NotAuthorized to UnauthorizedAccess rename |
| `component-groups-notAuthorized-rename-props` | `description` to `bodyText`, `title` to `titleText` |
| `component-groups-unavailableContent-bodyText-props-update` | Props consolidated into `bodyText` |
| `component-groups-unavailable-content-rename-props` | `unavailableTitleText` to `titleText` |

### Behavioral/semantic migration guidance (pf-codemods warning-only rules)

These rules detect patterns where the **API technically still works** but the **behavior or rendered markup has changed**, meaning code may silently break. The frontend-analyzer cannot detect these because they are not type-signature changes:

| pf-codemods rule | What it catches |
|---|---|
| `button-moveIcons-icon-prop` | Icons should move from Button children to `icon` prop |
| `button-support-favorite-variant` | Custom favorites buttons should use `isFavorite`/`isFavorited` |
| `accordionItem-warn-update-markup` | AccordionItem now renders a `<div>` wrapper |
| `drawerHead-warn-updated-markup` | DrawerPanelBody no longer rendered internally |
| `helperTextItem-warn-screenReaderText-update` | `screenReaderText` rendering behavior changed |
| `jumpLinksItem-warn-markup-change` | Now uses Button internally |
| `loginMainHeader-warn-updated-markup` | Now uses `<div>` instead of `<header>` |
| `menuItemAction-warn-update-markup` | Now uses Button internally with wrapper |
| `menuToggle-warn-iconOnly-toggle` | Icons should use `icon` prop instead of children |
| `notificationBadge-warn-markup-change` | Now uses stateful button |
| `notificationDrawerHeader-warn-update-markup` | Renders native `<h1>` instead of Text |
| `pageBreadcrumbAndSection-warn-updated-wrapperLogic` | `hasBodyWrapper` prop logic change |
| `pageSection-warn-variantClasses-applied` | Variant classes only applied when `type="default"` |
| `page-warn-updated-markup` | Markup changed with horizontalSubnav/breadcrumb |
| `pagination-warn-markup-changed` | New wrapper element added |
| `popper-update-appendTo-default` | `appendTo` default changed to `document.body` |
| `simpleFileUpload-warn-changes` | aria-describedby and id removal |
| `sliderStep-warn-update-markup` | CSS variable name changed |
| `treeView-warn-selectable-styling-modifier-removed` | `pf-m-selectable` class removed |
| `wizardFooter-warn-update-markup` | ActionList wrapping changed |
| `wizardNavItem-warn-update-markup` | New wrapper and error icon behavior |
| `tabs-update-markup` | Scroll buttons markup changed |

### Code quality / workflow utilities

| pf-codemods rule | Purpose |
|---|---|
| `no-duplicate-import-specifiers` | Deduplicates PF imports |
| `no-unused-imports-v6` | Removes unused PF imports after migration |
| `data-codemods-cleanup` | Removes temporary `data-codemods` attributes added during migration |

### Other specific gaps

| pf-codemods rule | What it catches | Why frontend-analyzer misses it |
|---|---|---|
| `helperTextItem-remove-props` | Removes `hasIcon`/`isDynamic` from HelperTextItem | Not in frontend-analyzer's analyzed surface |
| `logViewer-moved-styles` | Stylesheet moved out of PF | Packaging change, not a type change |
| `user-feedback-warn-changes` | FeedbackModal CSS import change | Packaging change |
| `enable-animations` | Suggests adding `hasAnimations` prop | Advisory, not a breaking change |
| `masthead-name-changes` | MastheadBrand to MastheadLogo rename | Frontend-analyzer detects base class change but not the component rename |

---

## 2. Concerns in frontend-analyzer-provider but NOT in pf-codemods

The automated semver analysis catches several categories of change that pf-codemods does not address.

### TypeScript type compatibility changes (77 rules)

The frontend-analyzer detects prop **type changes** that will cause TypeScript compilation errors but do not change the prop name:

- `ReactElement` to `ReactElement<any>` across dozens of components (wizard footer, drawer, nav flyout, page skipToContent, etc.)
- `FunctionComponent` to `ForwardRefExoticComponent` (Card, Truncate)
- `string` to `ReactNode` for `label` on Dropdown and Select
- `boolean | null` to `boolean` for `defaultChecked` on MenuToggle
- `ReactNode` to `string | string[]` for ClipboardCopy `children`
- RefObject types updated to allow `null` throughout (30+ occurrences)

**pf-codemods does not detect any of these.** For JavaScript users this does not matter, but for TypeScript users these cause compile errors.

### Component composition/conformance rules (110 rules)

The frontend-analyzer enforces **correct parent-child component relationships** that changed in v6:

- Card must contain CardHeader or CardExpandableContent
- EmptyState must wrap children in EmptyStateBody/EmptyStateFooter/EmptyStateActions
- Modal must contain ModalBody/ModalFooter/ModalHeader
- Accordion, Table, Nav, DataList, DualListSelector all have enforced nesting hierarchies
- Toolbar composition rules
- FileUpload must use FileUploadHelperText wrapper

**pf-codemods does not validate component composition.**

### React context dependency changes (14 rules)

The frontend-analyzer detects when components now **require or no longer provide** a React context:

- Dropdown no longer provides DropdownContext
- Select no longer provides SelectContext
- AccordionContent/AccordionToggle now require AccordionItemContext
- Td/Th now require TableContext
- DualListSelectorTree now requires DualListSelectorContext
- AlertGroup provides AlertGroupContext; Alert requires it

**pf-codemods does not analyze context dependencies.**

### Test impact rules (28 rules)

These flag changes to **rendered HTML structure** that will break existing test assertions:

- Page no longer renders `<section>`
- NavList no longer renders `<button>`
- ExpandableSection no longer renders `<button>`
- Select no longer renders `<button>` or `<input>`
- DataListCheck no longer renders `<input>`
- JumpLinksItem no longer renders `<a>`
- Card no longer renders `<input>`
- Various role attributes removed (e.g., `menuitem`, `option`, `listbox`, `none`, `presentation`)
- aria-label text changes on PageToggleButton

**pf-codemods does not flag test breakage.**

### Consumer CSS variable changes (233 rules)

While pf-codemods handles **JavaScript token constants** (via `tokens-update` and `tokens-prefix-with-t`), the frontend-analyzer additionally detects usage of PF CSS variables **directly in CSS/SCSS files**:

- All `--pf-v5-*` renamed to `--pf-v6-*` or `--pf-t--*` (220+ individual mappings)
- Global color, spacing, typography, border, shadow variables all remapped
- Consumer CSS using `pf-v5-` class prefixes flagged
- 24 logical property suffix renames (e.g., directional to logical)

**pf-codemods only handles tokens referenced in JavaScript, not in raw CSS/SCSS.**

### Package-level coverage gaps in pf-codemods

| Package | frontend-analyzer rules | pf-codemods rules |
|---|---|---|
| `react-templates` | 15 rules (SimpleDropdown, CheckboxSelect, TypeaheadSelect, etc.) | 0 |
| `react-table` | 13 rules (Table context, composition, prop additions) | 1 (CSS variable warning only) |
| `react-code-editor` | 4 rules (readonly, base class change) | 0 |
| `react-drag-drop` | 7 rules (variant removals, required props) | 2 (deprecated/promoted only) |

### Other categories unique to frontend-analyzer

| Category | Count | Examples |
|---|---|---|
| Dependency version requirements | 13 | All @patternfly packages minimum versions |
| Required props added | 12 | `items`/`onDrop` required on DragDropSort, `onSetPage`/`page` on PaginationNavigation, `config` on AnimationsProvider |
| Signature changes | 111 | `onSelect` callback signatures changed across Toolbar, SimpleDropdown, Select, etc. |
| CSS class removals | 8 | `pf-c-chip`, `pf-c-dropdown`, `pf-c-options-menu`, etc. removed |
| Node engine requirement | 1 | Minimum Node changed from >=20.15.1 to >=22.17.1 |

---

## 3. Areas of Strong Overlap

Both approaches detect these core migration concerns:

| Concern Area | pf-codemods | frontend-analyzer |
|---|---|---|
| Prop renames (chip to label, tertiary to horizontal-subnav, etc.) | Auto-fix | Detection only |
| Prop removals (isActive, hasNoPadding, theme, etc.) | Auto-fix | Detection only |
| Color value changes (cyan to teal, gold to yellow, light200 to secondary) | Auto-fix | Detection only |
| Chart imports moved to /victory | Auto-fix | Detection (78 individual rules) |
| Deprecated component detection (ApplicationLauncher, ContextSelector, etc.) | Auto-fix | Detection (50 component-removal rules) |
| Modal restructuring | Auto-fix | Detection |
| DualListSelector promotion from /next | Auto-fix | Detection |
| Token/CSS variable renames (JS level) | Auto-fix | Detection |
| Toolbar prop renames and value changes | Auto-fix | Detection |
| EmptyState restructuring | Auto-fix | Detection |
| Form labelIcon to labelHelp | Auto-fix | Detection |
| Interface renames (FormFiledGroup typo, ToolbarChip to ToolbarLabel, etc.) | Auto-fix | Detection |

---

## 4. Key Takeaways

### What the frontend-analyzer-provider brings that pf-codemods cannot

1. **Breadth through automation** -- 950 rules generated from type declaration diffs vs. 106 hand-written rules. This catches the "long tail" of changes that a human author might skip (type narrowings, base class changes, newly-required props).

2. **CSS-level detection** -- Catches `--pf-v5-*` variable usage in stylesheets, not just JS token constants. Critical for teams with custom CSS overrides.

3. **Test breakage awareness** -- 28 rules explicitly flag when rendered HTML changes, something completely absent from pf-codemods.

4. **Composition validation** -- 110 rules enforce correct component nesting hierarchies that changed in v6.

5. **TypeScript strictness** -- Detects type-level incompatibilities that will not surface until `tsc` compilation.

### What pf-codemods provides that the frontend-analyzer cannot

1. **Auto-fix (the biggest differentiator)** -- 78 rules automatically transform code. The frontend-analyzer only detects; it does not fix.

2. **Semantic migration knowledge** -- Rules like "move icon children to icon prop" or "replace Chip with Label including prop remapping" encode migration *intent*, not just breakage detection. The codemods know what the replacement should be.

3. **`@patternfly/react-component-groups` coverage** -- 11 rules for a package the frontend-analyzer does not analyze at all.

4. **Behavioral/markup warnings** -- 22 warning-only rules about silent behavioral changes that do not show up in type diffs.

5. **Migration workflow** -- The `data-codemods-cleanup` and import deduplication rules are part of a complete migration workflow, not just detection.

### Complementary, not competing

The two approaches are strongly complementary:
- **pf-codemods** is the "do the migration" tool -- it fixes ~74% of issues automatically and provides expert guidance on the rest
- **frontend-analyzer-provider** is the "find everything that changed" tool -- it catches the long tail of type changes, composition requirements, test impacts, and CSS-level concerns that codemods do not address

A team migrating PF5 to 6 would ideally: (1) run pf-codemods first to auto-fix the known patterns, then (2) use frontend-analyzer-provider to catch remaining issues, especially TypeScript type errors, component composition problems, CSS variable usage in stylesheets, and test assertion breakage.

---

## Appendix A: Complete pf-codemods Rule Catalog (106 rules)

### ACCORDION
1. **accordionContent-remove-isHidden-prop** - Removes deprecated `isHidden` prop from AccordionContent (auto-fix)
2. **accordionItem-warn-update-markup** - Warns that AccordionItem now renders a `div` wrapper (warning only)
3. **accordionToggle-move-isExpanded-prop** - Moves `isExpanded` prop from AccordionToggle to AccordionItem (auto-fix)

### AVATAR
4. **avatar-replace-border-for-isBordered** - Replaces deprecated `border` prop with `isBordered` (auto-fix)

### BANNER
5. **banner-replace-variantProp** - Replaces/removes `variant` prop with `color` or `status` properties (auto-fix)

### BUTTON
6. **button-moveIcons-icon-prop** - Moves icons from children to `icon` prop on Button (auto-fix)
7. **button-rename-isActive** - Renames `isActive` prop to `isClicked` (auto-fix)
8. **button-support-favorite-variant** - Detects custom favorites button and suggests `isFavorite`/`isFavorited` props (warning only)

### CARD
9. **card-remove-various-props** - Removes multiple props: `isSelectableRaised`, `isDisabledRaised`, `hasSelectableInput`, `selectableInputAriaLabel`, `onSelectableInputChange`, `isFlat`, `isRounded` (auto-fix)
10. **card-updated-clickable-markup** - Updates markup for clickable-only cards and removes `selectableActions` props from CardHeader (auto-fix)

### CHARTS
11. **chartsImport-moved** - Updates imports for 47 chart components from `@patternfly/react-charts` to `@patternfly/react-charts/victory` (auto-fix)

### CHECKBOX/RADIO
12. **checkbox-radio-replace-isLabelBeforeButton** - Replaces `isLabelBeforeButton` prop with `labelPosition="start"` on Checkbox and Radio (auto-fix)

### CHIP
13. **chip-deprecated** - Moves Chip and ChipGroup imports to deprecated package and replaces with Label/LabelGroup (auto-fix)
14. **chip-replace-with-label** - Full replacement of Chip with Label component including prop remapping (auto-fix)

### COLOR PROPS
15. **colorProps-replaced-colors** - Replaces `cyan` color with `teal` and `gold` with `yellow` on Banner and Label (auto-fix)

### COMPONENT GROUPS
16. **componentGroups-logSnippet-rename-leftBorderVariant** - Renames `leftBorderVariant` prop to `variant` on LogSnippet (auto-fix)
17. **component-groups-contentHeader-rename-to-pageHeader** - Renames ContentHeader to PageHeader (auto-fix)
18. **componentGroups-errorState-rename-props** - Renames ErrorState props: `errorTitle` to `titleText`, `errorDescription` to `bodyText`, `defaultErrorDescription` to `defaultBodyText` (auto-fix)
19. **component-groups-invalidObject-rename-props** - Renames InvalidObject/MissingPage props for both titleText and bodyText (auto-fix)
20. **component-groups-invalidObjectProps-rename-to-missingPageProps** - Renames InvalidObjectProps interface to MissingPageProps (auto-fix)
21. **component-groups-invalidObject-rename-to-missingPage** - Renames InvalidObject component to MissingPage (auto-fix)
22. **component-groups-multi-content-card-remove-props** - Removes `leftBorderVariant` and `withHeaderBorder` props from MultiContentCard (auto-fix)
23. **component-groups-notAuthorized-rename-props** - Renames NotAuthorized/UnauthorizedAccess props: `description` to `bodyText`, `title` to `titleText` (auto-fix)
24. **component-groups-notAuthorized-rename-to-unauthorizedAccess** - Renames NotAuthorized to UnauthorizedAccess (auto-fix)
25. **component-groups-unavailableContent-bodyText-props-update** - Replaces `unavailableBodyPreStatusLinkText` and `unavailableBodyPostStatusLinkText` with single `bodyText` prop (auto-fix)
26. **component-groups-unavailable-content-rename-props** - Renames `unavailableTitleText` to `titleText` on UnavailableContent (auto-fix)

### DATA
27. **data-codemods-cleanup** - Removes temporary `data-codemods` attributes and comments (auto-fix)

### DATA LIST
28. **dataListAction-remove-isPlainButtonAction-prop** - Removes `isPlainButtonAction` prop from DataListAction (auto-fix)

### DRAG AND DROP
29. **dragDrop-deprecated** - Moves drag/drop imports to deprecated package, suggests new DragDropSort in `@patternfly/react-drag-drop` (auto-fix)

### DRAWER
30. **drawerContent-replace-noBackground-colorVariant** - Replaces `no-background` value with `secondary` in DrawerContent `colorVariant` (auto-fix)
31. **drawerHead-remove-hasNoPadding-prop** - Removes `hasNoPadding` prop from DrawerHead (auto-fix)
32. **drawerHead-warn-updated-markup** - Warns DrawerPanelBody no longer rendered internally in DrawerHead (warning only)
33. **drawer-replace-colorVariant-light200** - Replaces `light200` with `secondary` in DrawerColorVariant enum (auto-fix)

### DUAL LIST SELECTOR
34. **dualListSelector-deprecated** - Moves old DualListSelector to deprecated package (auto-fix)
35. **dualListSelectorNext-promoted** - Promotes DualListSelectorNext from `/next` to main package (auto-fix)

### EMPTY STATE
36. **emptyStateHeader-move-into-emptyState** - Moves EmptyStateHeader markup into EmptyState component with prop conversion (auto-fix)
37. **emptyState-nonExported-components** - Removes non-exported EmptyStateHeader and EmptyStateIcon components (auto-fix)

### ENABLE ANIMATIONS
38. **enable-animations** - Suggests adding `hasAnimations` prop to animation-supporting components (optional auto-fix)

### EXPANDABLE SECTION
39. **expandableSection-remove-isActive-prop** - Removes `isActive` prop from ExpandableSection (auto-fix)

### FORM
40. **formFiledGroupHeaderTitleTextObject-renamed** - Renames typo'd interface from FormFiledGroupHeaderTitleTextObject to FormFieldGroupHeaderTitleTextObject (auto-fix)
41. **formGroup-rename-labelIcon** - Renames `labelIcon` prop to `labelHelp` on FormGroup (auto-fix)

### HELPER TEXT
42. **helperTextItem-remove-props** - Removes `hasIcon` and `isDynamic` props from HelperTextItem (auto-fix)
43. **helperTextItem-warn-screenReaderText-update** - Warns `screenReaderText` rendering behavior changed based on variant (warning only)

### JUMP LINKS
44. **jumpLinksItem-href-required** - Marks `href` prop as required on JumpLinksItem (warning only)
45. **jumpLinksItem-warn-markup-change** - Warns markup changed: now uses Button internally (warning only)

### KEBAB TOGGLE
46. **kebabToggle-replace-with-menuToggle** - Replaces deprecated KebabToggle with MenuToggle and EllipsisVIcon (auto-fix)

### LABEL
47. **label-remove-isOverflowLabel** - Replaces `isOverflowLabel` with `variant="overflow"` (auto-fix)

### LOGIN
48. **loginMainFooterLinksItem-structure-updated** - Restructures LoginMainFooterLinksItem to wrap content in Button component (auto-fix)
49. **loginMainHeader-warn-updated-markup** - Warns LoginMainHeader now uses `div` instead of `header` element (warning only)

### LOG VIEWER
50. **logViewer-moved-styles** - Warns stylesheet moved out of PatternFly into LogViewer itself (warning only)

### MASTHEAD
51. **masthead-name-changes** - Renames MastheadBrand to MastheadLogo (auto-fix)
52. **masthead-remove-background-color** - Removes `backgroundColor` prop from Masthead (auto-fix)
53. **masthead-structure-changes** - Updates Masthead component structure: MastheadToggle wrapping, MastheadBrand wrapping (auto-fix)

### MENU
54. **menuItemAction-warn-update-markup** - Warns MenuItemAction markup changed: now uses Button internally with wrapper (warning only)
55. **menuToggle-remove-splitButtonOptions** - Replaces `splitButtonOptions` with `splitButtonItems` on MenuToggle (auto-fix)
56. **menuToggle-warn-iconOnly-toggle** - Warns icons should use `icon` prop instead of children (warning only)

### MODAL
57. **modal-deprecated** - Moves old Modal to deprecated package (auto-fix)
58. **modalNext-promoted** - Promotes ModalNext from `/next` to main package (auto-fix)

### NAVIGATION
59. **navItem-remove-hasNavLinkWrapper-prop** - Removes `hasNavLinkWrapper` prop from NavItem (auto-fix)
60. **nav-remove-tertiary-variant** - Replaces `tertiary` variant with `horizontal-subnav` (auto-fix)
61. **nav-remove-theme-prop** - Removes `theme` prop from Nav (auto-fix)

### IMPORT UTILITIES
62. **no-duplicate-import-specifiers** - Removes duplicate import specifiers (auto-fix)
63. **no-unused-imports-v6** - Removes unused PatternFly imports (auto-fix)

### NOTIFICATION
64. **notificationBadge-warn-markup-change** - Warns NotificationBadge now uses stateful button internally (warning only)
65. **notificationDrawerHeader-warn-update-markup** - Warns NotificationDrawerHeader now renders native `h1` instead of Text component (warning only)

### PAGE
66. **pageBreadcrumbAndSection-warn-updated-wrapperLogic** - Warns about hasBodyWrapper prop logic change (warning only)
67. **pageHeaderToolsItem-remove-isSelected-prop** - Removes `isSelected` prop from PageHeaderToolsItem (auto-fix)
68. **pageNavigation-remove-component** - Removes PageNavigation component (auto-fix)
69. **page-rename-header** - Renames Page `header` prop to `masthead` (auto-fix)
70. **page-rename-isTertiaryNavGrouped** - Renames `isTertiaryNavGrouped` to `isHorizontalSubnavGrouped` (auto-fix)
71. **page-rename-isTertiaryNavWidthLimited** - Renames `isTertiaryNavWidthLimited` to `isHorizontalSubnavWidthLimited` (auto-fix)
72. **page-rename-tertiaryNav** - Renames `tertiaryNav` prop to `horizontalSubnav` (auto-fix)
73. **pageSection-remove-nav-type** - Removes `type="nav"` from PageSection (auto-fix)
74. **pageSection-update-variant-values** - Updates PageSection variant to only accept "default" or "secondary" (auto-fix)
75. **pageSection-warn-variantClasses-applied** - Warns variant classes now only applied when type="default" (warning only)
76. **pageSidebar-remove-theme-prop** - Removes `theme` prop from PageSidebar (auto-fix)
77. **pageToggleButton-replace-barsIcon-with-isHamburgerButton** - Replaces BarsIcon child with `isHamburgerButton` prop (auto-fix)
78. **page-warn-updated-markup** - Warns Page markup changed with horizontalSubnav/breadcrumb props (warning only)

### PAGINATION
79. **pagination-warn-markup-changed** - Warns Pagination markup changed with new wrapper element (warning only)

### POPPER/DROPDOWN/SELECT
80. **popper-update-appendTo-default** - Warns appendTo default changed to `document.body` on Dropdown, Select, Popper (warning only)

### DEPRECATED COMPONENTS
81. **remove-deprecated-components** - Warns about multiple deprecated components: ApplicationLauncher, ContextSelector, Dropdown, KebabToggle, BadgeToggle, OptionsMenu, PageHeader, Select (warning only)

### SIMPLE FILE UPLOAD
82. **simpleFileUpload-warn-changes** - Warns about aria-describedby and id removal, suggests browseButtonAriaDescribedby prop (warning only)

### SLIDER
83. **sliderStep-warn-update-markup** - Warns CSS variable changed from `--pf-v6-c-slider__step--Left` to `--pf-v6-c-slider__step--InsetInlineStart` (warning only)

### SWITCH
84. **switch-remove-labelOff** - Removes `labelOff` prop from Switch (auto-fix)

### TABS
85. **tabs-renamed-isSecondary-prop** - Renames `isSecondary` to `isSubtab` on Tabs (auto-fix)
86. **tabs-replace-variant-light300** - Replaces `light300` variant with `secondary` (auto-fix)
87. **tabs-update-markup** - Warns Tabs scroll buttons markup changed: now uses div wrapper and Button component (warning only)

### TEXT
88. **text-replace-with-content** - Replaces Text, TextContent, TextList, TextListItem with Content component (auto-fix)

### TABLE
89. **Th-Td-warn-update-markup** - Warns CSS variables changed for sticky columns (warning only)

### TILE
90. **tile-deprecated** - Moves Tile to deprecated package, suggests using Card instead (auto-fix)

### TOKENS
91. **tokens-prefix-with-t** - Prefixes tokens that represent Patternfly token variables with `t_` (auto-fix)
92. **tokens-update** - Updates old token references to new ones or temporary placeholder tokens with comments (auto-fix)

### TOOLBAR
93. **toolbarChipGroupContent-rename-component** - Renames ToolbarChipGroupContent to ToolbarLabelGroupContent (auto-fix)
94. **toolbarGroup-updated-variant** - Renames toolbar group variants: `button-group` to `action-group`, `icon-button-group` to `action-group-plain` (auto-fix)
95. **toolbarItem-variant-prop-updates** - Replaces `chip-group` with `label-group`, removes other variant values (auto-fix)
96. **toolbarLabelGroupContent-updated-markup** - Warns ToolbarLabelGroupContent markup changed with certain props (warning only)
97. **toolbar-remove-props** - Removes multiple props: `usePageInsets`, `alignSelf`, `widths`, `alignment` (auto-fix)
98. **toolbar-rename-chip-props** - Renames multiple chip-related props to label equivalents on various Toolbar components (auto-fix)
99. **toolbar-rename-interfaces** - Renames interfaces: ToolbarChipGroup to ToolbarLabelGroup, ToolbarChip to ToolbarLabel, etc. (auto-fix)
100. **toolbar-replaced-spacer-spaceItems** - Replaces `spacer` and `spaceItems` props with `gap` and related properties (auto-fix)
101. **toolbar-update-align-values** - Updates alignment values: `alignLeft` to `alignStart`, `alignRight` to `alignEnd` (auto-fix)

### TREE VIEW
102. **treeView-warn-selectable-styling-modifier-removed** - Warns `pf-m-selectable` class removed from list items (warning only)

### USER FEEDBACK
103. **user-feedback-warn-changes** - Warns FeedbackModal no longer references scss, may need to import CSS (warning only)

### WIZARD
104. **wizardFooter-warn-update-markup** - Warns WizardFooter now uses ActionList wrapping Button components (warning only)
105. **wizardNavItem-warn-update-markup** - Warns WizardNavItem has new wrapper with class and error icon behavior (warning only)
106. **wizardStep-updated-body-typing** - Removes null value support for WizardStep `body` prop (auto-fix)

---

## Appendix B: frontend-analyzer-provider Rule Summary by Category

### By change-type (950 rules total)

| Change Type | Count | Description |
|---|---|---|
| css-variable | 233 | CSS custom property renames (`--pf-v5-*` to `--pf-v6-*` / `--pf-t--*`) |
| signature-changed | 111 | Function/callback/hook signature changes |
| conformance | 110 | Component composition/nesting requirements |
| renamed | 100 | Props, interfaces, components renamed |
| type-changed | 77 | TypeScript type compatibility changes |
| removed | 76 | Props, components, exports removed |
| prop-value-removed | 74 | Specific enum/string literal values removed from props |
| component-removal | 50 | Full deprecated component removals |
| test-impact | 28 | Rendered HTML structure changes affecting tests |
| composition | 18 | Component family membership changes |
| context-dependency | 14 | React context provider/consumer changes |
| prop-value-change | 13 | Prop value type/meaning changes |
| dependency-update | 13 | Package version requirement updates |
| required-prop-added | 12 | Newly required props |
| css-removal | 8 | CSS class removals |
| prop-to-child | 6 | Props moved to child component pattern |
| prop-attribute-override | 2 | Internal prop management changes |
| deprecated-migration | 2 | Deprecated path migration |
| manifest | 1 | Node engine constraint change |
| css-class | 1 | CSS class prefix change |
| child-to-prop | 1 | Child element moved to prop pattern |

### By package coverage

| Package | Rule Count | Key Changes |
|---|---|---|
| react-core | 254 | Prop renames/removals, deprecated components, composition rules |
| Consumer CSS | 233 | CSS variable renames |
| react-charts | 81 | Victory sub-path migration, type changes |
| react-tokens | ~165 (via grouped rules) | 6,674 removed, 3,968 renamed, 2,021 type changes |
| react-table | 13 | Context dependencies, composition, prop additions |
| react-templates | 15 | onSelect signatures, base class changes |
| react-drag-drop | 7 | Variant removals, required props, family removals |
| react-code-editor | 4 | Readonly, base class change |
| react-icons | ~1,747 (via grouped rules) | Type changes on icon constants |

---

## Appendix C: Detailed frontend-analyzer-provider Findings by Component

### ACCORDION (6 semver + 3 context rules)
- **Removed props:** `isHidden` (AccordionContentProps), `isExpanded` (AccordionToggleProps)
- **Added props:** `contentBodyProps` (AccordionContentProps)
- **Base class changes:** AccordionExpandableContentBodyProps now extends `React.HTMLProps<HTMLDivElement>`; AccordionItemProps now extends `React.HTMLProps<HTMLDivElement>`
- **Context changes:** AccordionItem now provides AccordionItemContext; AccordionContent and AccordionToggle now require AccordionItemContext provider
- **Conformance:** AccordionItem must contain AccordionContent or AccordionToggle children

### ALERT
- `hasAnimations` added to AlertGroupProps
- AlertGroup made readonly
- AlertGroupInline provides AlertGroupContext
- Alert and AlertActionCloseButton now require AlertGroupContext

### AVATAR
- `border` removed, `isBordered` added

### BADGE
- `isDisabled` added

### BANNER
- `variant` removed
- Return type changed to `FunctionComponent<NonStatusBanner | StatusBanner>`

### BUTTON
- `isActive` prop removed
- `stateful` variant value added

### CARD (5 semver + conformance + test)
- Type change: `FunctionComponent<CardProps>` to `ForwardRefExoticComponent`
- `onClickAction` signature simplified
- `hasWrap` added to CardHeaderProps
- Deprecated Card: 7 of 23 props removed
- Must contain CardExpandableContent or CardHeader children
- No longer renders `<input>`

### CHECKBOX/RADIO
- `isLabelBeforeButton` removed, `labelPosition` added

### CLIPBOARD COPY
- `children` type changed from `ReactNode` to `string | string[]`
- `hasNoPadding` added to ClipboardCopyButtonProps

### DATA LIST
- `isPlainButtonAction` removed from DataListActionProps
- `id` added to DataListCheckProps
- DataListCheck no longer renders `<input>`

### DRAWER (12 rules)
- `hasNoPadding` removed from DrawerHeadProps
- `light200` / `light-200` / `no-background` values removed from colorVariant
- `secondary` value replaces removed values

### DROPDOWN (4 semver + 7 static design)
- No longer provides DropdownContext
- `toggleRef` allows null; `label` from `string` to `ReactNode`
- DropdownGroup no longer renders `<ul>` or role `none`
- DropdownItem role `menuitem` removed
- Full deprecated family removed (DropdownMenu, DropdownToggle, etc.)

### DUAL LIST SELECTOR (6 semver + 2 context + 2 composition + conformance)
- Made readonly
- DualListSelectorPane no longer consumes DualListSelectorContext
- DualListSelectorTree now requires DualListSelectorContext
- DualListSelectorTreeItem, DualListSelectorListWrapper removed
- Deprecated: 34 of 39 props removed

### EMPTY STATE (5 rules)
- EmptyStateHeader and EmptyStateIcon removed
- Must wrap children in EmptyStateBody/EmptyStateFooter/EmptyStateActions
- `IconProps` interface removed

### EXPANDABLE SECTION (5 rules)
- `isActive` removed
- `direction`, `isDetached` added
- No longer renders `<button>`

### FORM (6 rules)
- `labelIcon` to `labelHelp` (FormGroupProps)
- `hasAnimations` added (FormFieldGroupExpandableProps)
- FormFiledGroupHeaderTitleTextObject typo fix

### ICON
- Size values `sm`/`md`/`lg`/`xl` removed from `iconSize`, `progressIconSize`, and `size` props

### JUMP LINKS
- `scrollableRef` RefObject allows null
- `onClick` simplified
- JumpLinksItem no longer renders `<a>`

### LABEL (5 rules)
- `isOverflowLabel` renamed to `isClickable`
- `status` added
- `gold` and `cyan` values removed from `color`

### LOGIN
- `isPasswordRequired` added to LoginFormProps
- LoginMainFooterLinksItem deprecated (4 of 6 props removed)
- LoginMainHeader no longer renders `<header>`

### MASTHEAD (3 rules)
- `backgroundColor` removed, `component` removed from MastheadBrandProps
- MastheadBrandProps base changed from anchor to div element
- Must contain MastheadBrand, MastheadContent, or MastheadMain children

### MENU (6 rules)
- `onSelect` itemId parameter type changed
- `popperProps` type changed from MenuPopperProps to PopperOptions
- MenuItemActionProps base changed from HTMLButtonElement to HTMLDivElement
- MenuPopper removed (all 7 props)
- MenuItemAction no longer renders `<button>`

### MENU TOGGLE (3 rules)
- `splitButtonOptions` replaced by `splitButtonItems`
- `defaultChecked` changed from `boolean | null` to `boolean`

### MODAL (23 rules)
- Complete restructuring: props moved from Modal to sub-components (ModalHeader, ModalFooter, ModalBody)
- ModalBox, ModalBoxBody, ModalBoxCloseButton, ModalBoxFooter, ModalBoxHeader, ModalContent all removed
- `backdropClassName` added

### NAV (10 rules)
- `theme` removed, `hasNavLinkWrapper` removed
- `tertiary` variant removed; `icon` added
- NavList no longer renders `<button>`

### PAGE (18 rules)
- `header` to `masthead`, `tertiaryNav` to `horizontalSubnav`
- `isTertiaryNavGrouped` to `isHorizontalSubnavGrouped`
- PageNavigation removed; `theme` removed from PageSidebar
- `nav`/`dark`/`darker`/`light` values removed
- Page no longer renders `<section>`

### PAGINATION
- `toggleTemplate` return type updated
- `onSetPage` and `page` now required on PaginationNavigation

### REACT-CHARTS (78 rules)
- Nearly all components/interfaces moved to `@patternfly/react-charts/victory`
- `ChartCursorFlyout` removed
- `backgroundComponent` type changed
- `fixAxisLabelHeight` added to ChartAxisProps

### REACT-CODE-EDITOR (4 rules)
- CodeEditor made readonly
- CodeEditorProps base class changed

### REACT-DRAG-DROP (7 rules)
- `TableComposable` and `defaultWithHandle` values removed from variant
- `items` and `onDrop` now required
- DragButton, Draggable, DraggableDataListItem, DraggableDualListSelectorListItem removed

### REACT-TABLE (13 rules)
- `variant`, `isPlaceholder`, `favoriteButtonProps`, `hasAnimations`, `hasAction`, `additionalContent`, `isContentExpanded` added
- Td and Th now require TableContext
- Extensive composition/conformance rules

### REACT-TEMPLATES (15 rules)
- `onSelect` value parameter type changed across SimpleDropdown, CheckboxSelect, SimpleSelect
- TypeaheadSelect: `isSelected`/`filterFunction` removed, `selectOptions` renamed to `initialOptions`
- Base classes now exclude `onToggle`

### SELECT (4 semver + 14 static design)
- No longer provides SelectContext
- `toggleRef` allows null; `label` from `string` to `ReactNode`
- No longer renders `<button>`, `<input>`, `<li>`
- Roles `option`, `presentation`, `listbox` removed
- Full deprecated family removed

### SWITCH
- `labelOff` removed

### TABS (11 rules)
- `light300` removed, replaced by `secondary`
- `isSecondary` to `isSubtab`
- `popperProps`, `isAddButtonDisabled`, `setAccentStyles` added
- No longer renders `<button>`

### TOOLBAR (40 semver + 30 static design)
- Chip-to-label terminology throughout (14+ prop renames)
- `usePageInsets` to `hasNoPadding`, `spacer`/`spaceItems` to `gap`
- `alignLeft`/`alignRight` to `alignStart`/`alignEnd`
- `alignSelf`, `widths` removed
- `colorVariant`, `rowWrap`, `rowGap` added
- Old spacer string values all removed

### WIZARD (9 rules)
- `success` value added to `status`
- `footer` from ReactElement to ReactElement<any>

### DEPRECATED COMPONENT REMOVALS (50 rules)
- ApplicationLauncher family (8 components)
- ContextSelector family (3 components)
- OptionsMenu family (6 components)
- PageHeader family (5 components)
- BadgeToggle, KebabToggle, Separator, SplitButtonOptions
- DraggableObject, Popper, FormFiledGroupHeaderTitleTextObject

### DEPENDENCY UPDATES (13 rules)
- All @patternfly packages version minimums
- Node engine: >=20.15.1 to >=22.17.1

### CSS VARIABLE CHANGES (233 rules)
- All `--pf-v5-*` to `--pf-v6-*` or `--pf-t--*`
- Colors, backgrounds, borders, typography, spacing, icons, shadows, breakpoints all remapped
- 24 logical property suffix renames

### CSS CLASS REMOVALS (8 rules)
- `pf-c-app-launcher`, `pf-c-chip`, `pf-c-context-selector`, `pf-c-dropdown`, `pf-c-log-viewer`, `pf-c-notification-badge`, `pf-c-options-menu`, `pf-c-select`

# Side-by-Side Rule Comparison Table

## Legend

**Coverage markers:**
- **Both** -- Covered by both tools
- **PC** -- pf-codemods only
- **FA** -- frontend-analyzer only

**pf-codemods fix types:**
- **Fix** -- ESLint auto-fix (AST transform)
- **Warn** -- Warning only, no auto-fix

**frontend-analyzer strategy abbreviations:**
- **CssVar** -- CssVariablePrefix (deterministic CSS rename)
- **Import** -- ImportPathChange (deterministic path update)
- **Rename** -- Rename (deterministic identifier rename)
- **Remove** -- RemoveProp (deterministic prop removal)
- **PVC** -- PropValueChange (deterministic value swap)
- **PTC** -- PropTypeChange (structured type guidance)
- **Comp** -- CompositionChange (structured composition guidance)
- **P2C** -- PropToChild (structured prop-to-child migration)
- **P2Cn** -- PropToChildren (structured prop-to-children)
- **C2P** -- ChildToProp (structured child-to-prop)
- **LLM** -- LlmAssisted (AI-guided with member mappings)
- **DepMig** -- DeprecatedMigration (import path for deprecated)
- **UpdDep** -- UpdateDependency (version bump)
- **CG** -- ConstantGroup (batch constant removal)
- **Manual** -- Manual (no automated fix)
- **Conf** -- Conformance detection rule (no fix, structural validation)
- **Test** -- Test impact detection rule
- **Ctx** -- Context dependency detection rule
- **Sig** -- Signature changed detection rule
- **Req** -- Required prop added detection rule

---

## 1. Component-Level Comparison

### Accordion

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| AccordionContent: remove `isHidden` prop | Fix | Remove | Both |
| AccordionItem: div wrapper markup change | Warn | Test | Both |
| AccordionToggle: move `isExpanded` to AccordionItem | Fix | Rename | Both |
| AccordionItem must contain AccordionContent | -- | Conf | FA |
| AccordionContent must be in AccordionItem | -- | Conf | FA |
| AccordionExpandableContentBodyProps type change | -- | PTC | FA |
| AccordionItemProps type change | -- | PTC | FA |

### Avatar

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| `border` -> `isBordered` | Fix | Rename | Both |
| Avatar signature change (new props) | -- | Sig | FA |

### Banner

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Remove `variant` prop; use color/status | Fix | Remove | Both |
| `color='cyan'` -> `'teal'` | Fix | PVC | Both |
| `color='gold'` -> `'yellow'` | Fix | PVC | Both |
| Banner signature change | -- | Sig | FA |

### Button

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Move icon children to `icon` prop | Fix | -- | PC |
| `isActive` -> `isClicked` | Fix | Rename | Both |
| Recommend isFavorite/isFavorited for favorites | Warn | -- | PC |
| Button type changes | -- | PTC | FA |
| Button test-impact markup changes | -- | Test | FA |

### Card

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Remove isSelectableRaised, isDisabledRaised, hasSelectableInput, etc. | Fix | Remove | Both |
| Remove selectableActions.selectableActionId, name | Fix | Remove | Both |
| CardHeaderSelectableActionsObject type changes | -- | PTC | FA |
| Card composition conformance | -- | Conf | FA |
| Card test-impact markup | -- | Test | FA |

### Charts

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Import path `@patternfly/react-charts` -> `/victory` | Fix (1 rule, all components) | Import (78 rules, per interface) | Both |
| ChartThemeColor changes | -- | PVC | FA |
| Chart helper function signature changes (getTheme, getCustomTheme, etc.) | -- | Sig | FA |
| Individual chart interface type changes | -- | PTC (per component) | FA |

### Checkbox / Radio

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| `isLabelBeforeButton` -> `labelPosition="start"` | Fix | PVC | Both |
| Checkbox/Radio type changes | -- | PTC | FA |
| Checkbox test-impact markup | -- | Test | FA |

### Chip / ChipGroup -> Label / LabelGroup

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Move Chip imports to deprecated | Fix | DepMig | Both |
| Replace Chip with Label (variant='outline') | Fix | LLM | Both |
| Replace ChipGroup with LabelGroup | Fix | LLM | Both |
| ChipProps type removed | -- | PTC | FA |
| ChipGroupProps type removed | -- | PTC | FA |

### ClipboardCopy

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| ClipboardCopy type changes | -- | PTC | FA |
| ClipboardCopyButton changes | -- | Sig | FA |
| ClipboardCopy test-impact markup | -- | Test | FA |
| ClipboardCopy conformance | -- | Conf | FA |

### DataListAction

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Remove `isPlainButtonAction` | Fix | Remove | Both |
| DataListCheck changes | -- | PTC | FA |
| DataList composition conformance (cell/toggle nesting) | -- | Conf (8+ rules) | FA |
| DataList test-impact markup | -- | Test | FA |

### DragDrop

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Move DragDrop imports to deprecated | Fix | DepMig | Both |
| DragDropContainer API changes (4 rules) | -- | Sig + PTC | FA |
| DragDropSort API changes (5 rules) | -- | Sig + PTC | FA |
| DragDrop deprecated component removal | -- | LLM | FA |

### Drawer

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| DrawerContent: remove `no-background` colorVariant | Fix | PVC | Both |
| DrawerHead: remove `hasNoPadding` | Fix | Remove | Both |
| DrawerHead: markup change (DrawerPanelBody) | Warn | Test | Both |
| Drawer*: `colorVariant='light-200'` -> `'secondary'` | Fix | PVC | Both |
| DrawerColorVariant enum changes | Fix | Rename | Both |
| DrawerContent composition conformance | -- | Conf | FA |
| DrawerContext dependency | -- | Ctx | FA |
| DrawerPanelContent type changes | -- | PTC | FA |
| DrawerSection type changes | -- | PTC | FA |

### DualListSelector

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Move old DualListSelector to deprecated | Fix | DepMig | Both |
| Promote DualListSelector from /next | Fix | Import | Both |
| DualListSelectorListItem.innerRef type change | -- | PTC | FA |
| DualListSelector composition conformance (15+ rules) | -- | Conf | FA |
| DualListSelectorTreeItem removed | -- | Manual | FA |
| DualListSelector test-impact markup | -- | Test | FA |

### EmptyState

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Move EmptyStateHeader/Icon into EmptyState props | Fix | C2P | Both |
| Remove EmptyStateHeader/Icon exports | Fix | Remove | Both |
| EmptyState test-impact markup | -- | Test | FA |
| EmptyState conformance | -- | Conf | FA |

### ExpandableSection

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Remove `isActive` | Fix | Remove | Both |
| ExpandableSectionProps type change | -- | PTC | FA |
| ExpandableSectionToggle changes | -- | PTC | FA |
| ExpandableSection test-impact markup | -- | Test | FA |
| ExpandableSection conformance | -- | Conf | FA |

### FormFieldGroup

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Typo fix: FormFiledGroupHeaderTitleTextObject | Fix | Rename | Both |
| FormFieldGroupExpandableProps type change | -- | PTC | FA |
| FormFieldGroupProps type change | -- | PTC | FA |

### FormGroup

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| `labelIcon` -> `labelHelp` | Fix | Rename | Both |
| Form conformance | -- | Conf | FA |

### HelperTextItem

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Remove `hasIcon`, `isDynamic` | Fix | Remove | Both |
| screenReaderText behavior change | Warn | -- | PC |

### JumpLinksItem

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| `href` now required | Warn | Req | Both |
| Markup change (uses Button internally) | Warn | Test | Both |
| JumpLinks conformance | -- | Conf | FA |

### Label

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| `isOverflowLabel` -> `variant="overflow"` | Fix | PVC | Both |
| `color='cyan'` -> `'teal'`, `'gold'` -> `'yellow'` | Fix | PVC | Both |
| Label type changes | -- | PTC | FA |
| Label conformance | -- | Conf | FA |

### Login

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| LoginMainFooterLinksItem: wrap in Button | Fix | -- | PC |
| LoginMainHeader: div instead of header | Warn | Test | Both |
| LoginForm test-impact markup | -- | Test | FA |

### LogViewer

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Stylesheet moved to LogViewer package | Warn | Sig | Both |

### Masthead

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| MastheadBrand -> MastheadLogo | Fix | Rename | Both |
| Remove `backgroundColor` | Fix | Remove | Both |
| Structure: MastheadToggle -> MastheadMain | Fix | Comp | Both |
| MastheadBrandProps type change | -- | PTC | FA |
| Masthead conformance | -- | Conf | FA |

### MenuToggle

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| `splitButtonOptions` -> `splitButtonItems` | Fix | Rename | Both |
| Icons should go to `icon` prop | Warn | -- | PC |
| MenuToggleCheckbox changes | -- | PTC | FA |
| MenuToggle type changes | -- | PTC | FA |

### MenuItemAction

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Markup change (uses Button internally) | Warn | Test | Both |
| MenuItemActionProps type change | -- | PTC | FA |

### Modal

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Move old Modal to deprecated | Fix | DepMig | Both |
| Promote Modal from /next | Fix | Import | Both |
| `titleIconVariant` -> ModalHeader child | -- | P2C | FA |
| `footer` prop -> ModalFooter children | -- | P2Cn | FA |
| ModalProps type changes | -- | PTC | FA |
| Modal composition conformance | -- | Conf | FA |
| ModalContent changes | -- | Sig | FA |
| Modal deprecated component member mappings | -- | LLM (14 rules) | FA |

### Nav

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| `variant='tertiary'` -> `'horizontal-subnav'` | Fix | PVC | Both |
| Remove `theme` prop | Fix | Remove | Both |
| Remove `hasNavLinkWrapper` from NavItem | Fix | Remove | Both |
| NavProps type change | -- | PTC | FA |
| NavContext dependency | -- | Ctx | FA |
| Nav composition conformance (item separators) | -- | Conf (5+ rules) | FA |
| NavGroup changes | -- | Sig | FA |
| NavList changes | -- | PTC | FA |

### NotificationBadge

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Markup change (stateful button) | Warn | Test | Both |
| NotificationBadge type changes | -- | PTC | FA |

### NotificationDrawer

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Header renders native h1 | Warn | Test | Both |
| NotificationDrawerListItemHeader changes | -- | Sig | FA |
| NotificationDrawer composition conformance | -- | Conf | FA |

### Page

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| `header` -> `masthead` | Fix | Rename | Both |
| `isTertiaryNavGrouped` -> `isHorizontalSubnavGrouped` | Fix | Rename | Both |
| `isTertiaryNavWidthLimited` -> `isHorizontalSubnavWidthLimited` | Fix | Rename | Both |
| `tertiaryNav` -> `horizontalSubnav` | Fix | Rename | Both |
| Remove `isSelected` from PageHeaderToolsItem | Fix | Remove | Both |
| Remove PageNavigation component | Fix | Remove | Both |
| PageBody wrapper always applied (markup) | Warn | Test | Both |
| Add `hasBodyWrapper` to PageBreadcrumb/PageSection | Fix | -- | PC |
| PageGroup changes | -- | Sig | FA |
| Page conformance | -- | Conf | FA |
| PageBreadcrumb changes | -- | Sig | FA |
| PageSidebar.theme removal | Fix | Remove | Both |
| PageSidebarBody changes | -- | Sig | FA |
| PageToggleButton changes | -- | PTC | FA |
| Deprecated PageHeader removal | -- | LLM | FA |

### PageSection

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Remove `type='nav'` | Fix | PVC | Both |
| Restrict variant to default/secondary | Fix | PVC | Both |
| Variant classes only when type='default' | Warn | -- | PC |
| PageSectionTypes enum changes | -- | Remove | FA |
| PageSectionVariants enum changes | -- | Remove | FA |
| PageSection conformance | -- | Conf | FA |

### PageToggleButton

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| BarsIcon -> `isHamburgerButton` prop | Fix | -- | PC |
| PageToggleButton type changes | -- | PTC | FA |

### Pagination

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Wrapper element markup change | Warn | Test | Both |
| onSetPage signature change | -- | Sig | FA |

### Popper

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Default `appendTo` changed to document.body | Warn | -- | PC |
| PopperProps type change | -- | PTC | FA |
| Popper signature changes | -- | Sig | FA |

### Select (deprecated)

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Deprecated component warning | Warn | LLM | Both |
| SelectProps member mappings (7 mapped, 51 removed) | -- | LLM (overlap 0.318) | FA |
| SelectOptionProps member mappings (7 mapped, 19 removed) | -- | LLM (overlap 0.636) | FA |
| SelectGroupProps member mappings (3 mapped, 1 removed) | -- | LLM (overlap 1.0) | FA |
| SelectToggle removal | -- | LLM | FA |
| Select context/state removal | -- | Remove | FA |

### SimpleFileUpload

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| aria-describedby and id changes | Warn | -- | PC |

### Slider

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| CSS variable --Left -> --InsetInlineStart | Warn | CssVar | Both |

### Switch

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Remove `labelOff` | Fix | Remove | Both |

### Tabs

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| `isSecondary` -> `isSubtab` | Fix | Rename | Both |
| `variant='light300'` -> `'secondary'` | Fix | PVC | Both |
| Scroll buttons markup change | Warn | Test | Both |
| TabsProps type changes | -- | PTC | FA |
| TabsContext dependency (5 rules) | -- | Ctx | FA |
| Tabs composition conformance (TabAction in Tab) | -- | Conf | FA |

### Text -> Content

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Text -> Content, TextContent -> Content | Fix | Rename | Both |
| TextList -> Content (with component="ul") | Fix | Rename | Both |
| TextListItem -> Content (with component="li") | Fix | Rename | Both |
| TextVariants -> ContentVariants | Fix | Rename | Both |
| TextListVariants member mappings | -- | LLM (overlap 1.0) | FA |
| TextListItemVariants member mappings | -- | LLM (overlap 1.0) | FA |
| `isVisited` -> `isVisitedLink` | Fix | Rename | Both |
| `isPlain` -> `isPlainList` | Fix | Rename | Both |

### Th / Td (Table)

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| CSS variable Left/Right -> InsetInlineStart/InsetInlineEnd | Warn | CssVar | Both |
| Td/Th type changes | -- | PTC | FA |
| Table composition conformance (Td/Th in Tr/Tbody/Thead) | -- | Conf (8+ rules) | FA |

### Tile

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Move imports to deprecated | Fix | DepMig | Both |

### Toolbar

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| ToolbarChipGroupContent -> ToolbarLabelGroupContent | Fix | Rename | Both |
| ToolbarChipGroup -> ToolbarLabelGroup (interface) | Fix | Rename | Both |
| ToolbarChip -> ToolbarLabel (interface) | Fix | Rename | Both |
| chip-related props -> label-related props | Fix | Rename | Both |
| `spacer` -> `gap` | Fix | Rename | Both |
| Remove `spaceItems` | Fix | Remove | Both |
| Remove `usePageInsets` (Toolbar) | Fix | Remove | Both |
| Remove `alignSelf` (ToolbarContent) | Fix | Remove | Both |
| Remove `widths` (ToolbarItem) | Fix | Remove | Both |
| Remove `alignment` (ToolbarToggleGroup) | Fix | Remove | Both |
| `alignLeft` -> `alignStart` | Fix | PVC | Both |
| `alignRight` -> `alignEnd` | Fix | PVC | Both |
| `button-group` -> `action-group` | Fix | PVC | Both |
| `icon-button-group` -> `action-group-plain` | Fix | PVC | Both |
| `chip-group` -> `label-group` (ToolbarItem variant) | Fix | PVC | Both |
| Remove bulk-select, overflow-menu, search-filter variants | Fix | Remove | Both |
| ToolbarLabelGroupContent markup change | Warn | Test | Both |
| ToolbarGroupProps type changes | -- | PTC | FA |
| ToolbarGroupVariant enum changes | -- | Remove | FA |
| ToolbarItemVariant enum changes | -- | Remove | FA |
| ToolbarContext dependency (2 rules) | -- | Ctx | FA |
| ToolbarContent type changes | -- | PTC | FA |
| ToolbarExpandableContent type changes | -- | PTC | FA |
| ToolbarFilter type changes (7 rules) | -- | PTC | FA |
| ToolbarGroup conformance (28 rules) | -- | Conf | FA |
| ToolbarItem conformance (22 rules) | -- | Conf | FA |
| ToolbarToggleGroup conformance (17 rules) | -- | Conf | FA |

### TreeView

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| `pf-m-selectable` CSS class removed | Warn | CssVar | Both |
| TreeView test-impact markup | -- | Test | FA |
| TreeView conformance | -- | Conf | FA |

### Wizard

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| WizardFooter uses ActionList | Warn | Test | Both |
| WizardNavItem new wrapper | Warn | Test | Both |
| WizardStep: remove `body={null}` | Fix | Remove | Both |
| WizardBasicStep type changes | -- | PTC | FA |
| WizardContext/ContextProvider changes | -- | Ctx | FA |
| WizardToggle changes | -- | PTC | FA |
| useWizardFooter changes | -- | Sig | FA |

---

## 2. Cross-Cutting Concerns

### Deprecated Component Removals

| Deprecated Family | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| ApplicationLauncher (+ sub-components) | Warn (remove-deprecated-components) | LLM (6 component-removal rules) | Both |
| ContextSelector (+ sub-components) | Warn (remove-deprecated-components) | LLM (4 component-removal rules) | Both |
| Old Dropdown (+ sub-components) | Warn (remove-deprecated-components) | LLM (8 rules, member mappings: 9 mapped, 12 removed) | Both |
| Old Select (+ sub-components) | Warn (remove-deprecated-components) | LLM (8 rules, member mappings: 7 mapped, 51 removed) | Both |
| OptionsMenu (+ sub-components) | Warn (remove-deprecated-components) | LLM (6 component-removal rules) | Both |
| PageHeader (+ related) | Warn (remove-deprecated-components) | LLM (4 component-removal rules) | Both |
| KebabToggle | Fix (replaces with MenuToggle) | LLM (1 rule) | Both |
| BadgeToggle | Warn (remove-deprecated-components) | LLM (1 rule) | Both |

### CSS Variables / Tokens

| Scope | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| JS token imports (`@patternfly/react-tokens`) | Fix (tokens-update, tokens-prefix-with-t) | -- | PC |
| CSS stylesheet vars (`--pf-v5-global--*`) | -- | CssVar (233 rules, deterministic fix) | FA |
| JS string literal token names | Fix (tokens-update) | -- | PC |

### Package-Level Coverage

| Package | pf-codemods Rules | FA Rules | Coverage |
|---|---|---|---|
| `@patternfly/react-core` | ~80 | 437 | Both (FA has broader type/conformance) |
| `@patternfly/react-core/deprecated` | 6 | 37 | Both (FA has more detail) |
| `@patternfly/react-core/next` | 2 | 3 | Both |
| `@patternfly/react-charts` | 1 | 82 | Both (PC: 1 broad rule; FA: 82 per-interface) |
| `@patternfly/react-tokens` | 2 | 4 | Both |
| **`@patternfly/react-component-groups`** | **12** | **0** | **PC only** |
| **`@patternfly/react-table`** | 0 (1 warn) | **31** | **FA only** |
| **`@patternfly/react-templates`** | **0** | **16** | **FA only** |
| **`@patternfly/react-code-editor`** | **0** | **3** | **FA only** |
| **`@patternfly/react-drag-drop`** | **0** | **17** | **FA only** |
| **`@patternfly/react-icons`** | **0** | **1** | **FA only** |

### Workflow / Utility Concerns

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---|---|---|---|
| Cleanup data-codemods attributes | Fix | -- | PC |
| Remove duplicate import specifiers | Fix | -- | PC |
| Remove unused PF imports | Fix | -- | PC |
| Add `hasAnimations` prop | Fix | -- | PC |
| Dependency version updates | -- | UpdDep (13 rules) | FA |

---

## 3. Coverage Summary

### Aggregate Coverage by Category

| Concern Category | Both | PC Only | FA Only | Total |
|---|---|---|---|---|
| Prop renames | ~30 | 2 | ~70 | ~102 |
| Prop removals | ~20 | 3 | ~56 | ~79 |
| Prop value changes | ~15 | 1 | ~72 | ~88 |
| Import path changes | ~8 | 0 | ~73 | ~81 |
| Component restructuring | ~5 | 5 | ~45 | ~55 |
| Deprecated component migration | ~8 | 1 | ~42 | ~51 |
| CSS variables (stylesheet) | 0 | 0 | 233 | 233 |
| CSS variables (JS tokens) | 0 | 2 | 0 | 2 |
| TypeScript type changes | 0 | 0 | 77 | 77 |
| Composition/conformance | 0 | 0 | 110 | 110 |
| Test impact | 0 | 0 | 28 | 28 |
| Context dependencies | 0 | 0 | 14 | 14 |
| Signature changes | 0 | 0 | 111 | 111 |
| Required props added | 0 | 0 | 12 | 12 |
| Behavioral/markup warnings | 0 | 31 | 0 | 31 |
| Workflow utilities | 0 | 4 | 0 | 4 |
| Dependency updates | 0 | 0 | 13 | 13 |
| react-component-groups | 0 | 12 | 0 | 12 |

### Fix Capability Head-to-Head

| Dimension | pf-codemods | frontend-analyzer |
|---|---|---|
| **Total rules** | 106 | 950 |
| **Rules with auto-fix** | 75 (71%) | 646 (68%) |
| **Deterministic fixes** | 75 (all AST-based) | 485 (text replacement) |
| **LLM-assisted fixes** | 0 | 162 |
| **Structured guidance** | 0 | 217 |
| **Manual only** | 31 (warnings) | 36 + 290 low-confidence |
| **Fix precision** | High (AST-aware, structurally correct) | Varies: Exact (171), High (475), Low (290) |
| **Fix scope** | JSX/TSX source code only | Source code + CSS stylesheets |
| **Unique fix capability** | Complex JSX restructuring (move props between components, wrap children, component replacement) | CSS variable bulk rename, type migration guidance, composition validation, LLM-guided deprecated component migration |
| **Package breadth** | 3 packages + react-component-groups | 10+ packages |
| **Detection-only categories** | Behavioral/markup warnings | Types, conformance, test-impact, context, signatures |

### Overlap Estimate

- **~86 specific concerns** are covered by both tools (prop renames, removals, value changes, import changes, deprecations)
- **~50 concerns** are covered by pf-codemods only (react-component-groups, behavioral warnings, workflow utils, complex structural transforms)
- **~814 concerns** are covered by frontend-analyzer only (CSS vars, types, conformance, test-impact, context, signatures, additional packages)
- The overlap represents the **core prop-level migration work** -- the most impactful changes that affect the majority of codebases
- frontend-analyzer's unique concerns are largely in categories that pf-codemods **structurally cannot detect** (CSS stylesheets, TypeScript types, component composition rules)

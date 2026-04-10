# PatternFly 5 to 6: Side-by-Side Rule Comparison Table

**Generated:** 2026-04-10
**Companion to:** [comparison_report.md](./comparison_report.md)

## Legend

| Marker | Meaning |
|--------|---------|
| **Both** | Covered by both pf-codemods and frontend-analyzer-provider |
| **PC** | pf-codemods only |
| **FA** | frontend-analyzer-provider only |

**Fix type abbreviations:**
- **ESLint fix** = AST-aware ESLint `--fix` auto-transform (pf-codemods)
- **Warn** = pf-codemods warning-only rule (no auto-fix)
- **Det.** = Deterministic text replacement (frontend-analyzer)
- **LLM** = LLM-assisted fix with structured context (frontend-analyzer)
- **Struct.** = Structured guidance metadata (frontend-analyzer)
- **Manual** = Requires human judgment (frontend-analyzer)

---

## 1. Component-Level Comparison

### ACCORDION

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `isHidden` prop removed from AccordionContent | ESLint fix | Det. (RemoveProp) | Both |
| `isExpanded` moved from AccordionToggle to AccordionItem | ESLint fix | Det. (RemoveProp) | Both |
| AccordionItem now renders `<div>` wrapper | Warn | -- | PC |
| `contentBodyProps` added to AccordionContentProps | -- | Struct. (PropTypeChange) | FA |
| Base class changes (AccordionItemProps, AccordionExpandableContentBodyProps) | -- | Struct. (PropTypeChange) | FA |
| AccordionItem now provides AccordionItemContext | -- | Struct. (CompositionChange) | FA |
| AccordionContent/Toggle require AccordionItemContext | -- | Struct. (CompositionChange) | FA |
| AccordionItem must contain AccordionContent or AccordionToggle | -- | Struct. (CompositionChange) | FA |

### ALERT

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `hasAnimations` added to AlertGroupProps | -- | Struct. (PropTypeChange) | FA |
| AlertGroup made readonly | -- | Struct. (PropTypeChange) | FA |
| Alert/AlertActionCloseButton require AlertGroupContext | -- | Struct. (CompositionChange) | FA |

### AVATAR

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `border` prop replaced with `isBordered` | ESLint fix | Det. (RemoveProp) + Struct. (PropTypeChange) | Both |

### BADGE

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `isDisabled` added | -- | Struct. (PropTypeChange) | FA |

### BANNER

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `variant` prop removed, replaced with `color`/`status` | ESLint fix | Det. (RemoveProp) | Both |
| Return type changed to `FunctionComponent<NonStatusBanner \| StatusBanner>` | -- | Struct. (PropTypeChange) | FA |

### BUTTON

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `isActive` renamed to `isClicked` | ESLint fix | Det. (RemoveProp) | Both |
| Icons should move from children to `icon` prop | ESLint fix | -- | PC |
| Custom favorites should use `isFavorite`/`isFavorited` | Warn | -- | PC |
| `stateful` variant value added | -- | Struct. (PropTypeChange) | FA |

### CARD

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Remove props: `isSelectableRaised`, `isDisabledRaised`, `hasSelectableInput`, etc. | ESLint fix | LLM (deprecated Card, 7 of 23 props removed) | Both |
| Updated clickable card markup / `selectableActions` removal | ESLint fix | Struct. (CompositionChange) | Both |
| Type change: FunctionComponent to ForwardRefExoticComponent | -- | Struct. (PropTypeChange) | FA |
| `onClickAction` signature simplified | -- | Struct. (PropTypeChange) | FA |
| `hasWrap` added to CardHeaderProps | -- | Struct. (PropTypeChange) | FA |
| Must contain CardHeader or CardExpandableContent | -- | Struct. (CompositionChange) | FA |
| No longer renders `<input>` (test impact) | -- | Struct. (test-impact) | FA |

### CHARTS

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| 47 chart component imports moved to `/victory` | ESLint fix (1 rule) | Det. (ImportPathChange, 78 rules) | Both |
| Chart interface imports moved to `/victory` | ESLint fix (1 rule) | Det. (ImportPathChange) | Both |
| `ChartCursorFlyout` removed | -- | Manual (find_alternative) | FA |
| `backgroundComponent` type: ReactElement to ReactElement<any> | -- | Struct. (PropTypeChange) | FA |
| `fixAxisLabelHeight` added to ChartAxisProps | -- | Struct. (PropTypeChange) | FA |
| ChartBoxPlot, ChartContainer, ChartTheme grouped type changes | -- | Struct. (PropTypeChange) | FA |

### CHECKBOX / RADIO

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `isLabelBeforeButton` replaced with `labelPosition="start"` | ESLint fix | Det. (RemoveProp) + Struct. (PropTypeChange) | Both |

### CHIP

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Chip/ChipGroup deprecated, moved to `/deprecated` | ESLint fix | Det. (DeprecatedMigration) | Both |
| Replace Chip with Label (including prop remapping) | ESLint fix | LLM (member_mappings + removed_members) | Both |

### CLIPBOARD COPY

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `children` type changed from ReactNode to `string \| string[]` | -- | Struct. (PropTypeChange) | FA |
| `hasNoPadding` added to ClipboardCopyButtonProps | -- | Struct. (PropTypeChange) | FA |

### COLOR PROPS

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `cyan` to `teal`, `gold` to `yellow` on Banner/Label | ESLint fix | Det. (PropValueChange) | Both |

### COMPONENT GROUPS (react-component-groups package)

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| LogSnippet: `leftBorderVariant` to `variant` | ESLint fix | -- | PC |
| ContentHeader renamed to PageHeader | ESLint fix | -- | PC |
| ErrorState: `errorTitle` to `titleText`, `errorDescription` to `bodyText` | ESLint fix | -- | PC |
| InvalidObject renamed to MissingPage | ESLint fix | -- | PC |
| InvalidObject prop renames (titleText, bodyText) | ESLint fix | -- | PC |
| InvalidObjectProps interface renamed to MissingPageProps | ESLint fix | -- | PC |
| MultiContentCard: `leftBorderVariant`, `withHeaderBorder` removed | ESLint fix | -- | PC |
| NotAuthorized renamed to UnauthorizedAccess | ESLint fix | -- | PC |
| NotAuthorized: `description` to `bodyText`, `title` to `titleText` | ESLint fix | -- | PC |
| UnavailableContent: body text props consolidated | ESLint fix | -- | PC |
| UnavailableContent: `unavailableTitleText` to `titleText` | ESLint fix | -- | PC |

### DATA LIST

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `isPlainButtonAction` removed from DataListAction | ESLint fix | Det. (RemoveProp) | Both |
| `id` added to DataListCheckProps | -- | Struct. (PropTypeChange) | FA |
| DataListCheck no longer renders `<input>` (test impact) | -- | Struct. (test-impact) | FA |

### DIVIDER

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `role` prop added | -- | Struct. (PropTypeChange) | FA |

### DRAG AND DROP

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Old DragDrop deprecated, moved to `/deprecated` | ESLint fix | LLM | Both |
| `TableComposable`, `defaultWithHandle` values removed from variant | -- | Det. (PropValueChange) | FA |
| `items` and `onDrop` now required on DragDropSort/Container | -- | Struct. (PropTypeChange) | FA |
| DragButton, Draggable, DraggableDataListItem removed | -- | Manual | FA |

### DRAWER

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `no-background` replaced with `secondary` in DrawerContent colorVariant | ESLint fix | Det. (PropValueChange) | Both |
| `hasNoPadding` removed from DrawerHead | ESLint fix | Det. (RemoveProp) | Both |
| `light200` replaced with `secondary` in DrawerColorVariant | ESLint fix | Det. (PropValueChange) | Both |
| DrawerPanelBody no longer rendered internally in DrawerHead | Warn | -- | PC |
| `light-200` removed from DrawerPanelContent/DrawerSection colorVariant | -- | Det. (PropValueChange) | FA |

### DROPDOWN (deprecated)

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Deprecated Dropdown/KebabToggle/BadgeToggle flagged | Warn + ESLint fix (kebab) | LLM (member_mappings, 20+ removed props, overlap_ratio) | Both |
| `appendTo` default changed to `document.body` | Warn | -- | PC |
| No longer provides DropdownContext | -- | Struct. (CompositionChange) | FA |
| `toggleRef` allows null; `label` string to ReactNode | -- | Struct. (PropTypeChange) | FA |
| DropdownGroup no longer renders `<ul>` or role `none` (test impact) | -- | Struct. (test-impact) | FA |
| DropdownItem role `menuitem` removed (test impact) | -- | Struct. (test-impact) | FA |
| Full deprecated family removal (DropdownMenu, DropdownToggle, etc.) | -- | LLM (removed_members) | FA |

### DUAL LIST SELECTOR

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Old DualListSelector deprecated | ESLint fix | LLM (34 of 39 props removed) | Both |
| DualListSelectorNext promoted from `/next` | ESLint fix | LLM | Both |
| Made readonly | -- | Struct. (PropTypeChange) | FA |
| DualListSelectorPane no longer consumes context | -- | Struct. (CompositionChange) | FA |
| DualListSelectorTree now requires context | -- | Struct. (CompositionChange) | FA |
| DualListSelectorTreeItem, DualListSelectorListWrapper removed | -- | Manual | FA |
| Multiple innerRef RefObjects now allow null | -- | Struct. (PropTypeChange) | FA |

### EMPTY STATE

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| EmptyStateHeader moved into EmptyState as props | ESLint fix | Det. (ChildToProp) | Both |
| EmptyStateHeader and EmptyStateIcon components removed | ESLint fix | LLM | Both |
| Must wrap children in EmptyStateBody/Footer/Actions | -- | Struct. (CompositionChange) | FA |
| `IconProps` interface removed | -- | Manual | FA |

### EXPANDABLE SECTION

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `isActive` prop removed | ESLint fix | Det. (RemoveProp) | Both |
| `direction` added, `isDetached` added | -- | Struct. (PropTypeChange) | FA |
| Base classes now exclude `onToggle` | -- | Struct. (PropTypeChange) | FA |
| No longer renders `<button>` (test impact) | -- | Struct. (test-impact) | FA |

### FILE UPLOAD

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| aria-describedby/id changes, `browseButtonAriaDescribedby` added | Warn | Struct. (PropTypeChange) | Both |
| FileUploadHelperText wrapping required | -- | Struct. (CompositionChange) | FA |

### FORM

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| FormFiledGroupHeaderTitleTextObject typo renamed | ESLint fix | Det. (Rename) | Both |
| `labelIcon` renamed to `labelHelp` on FormGroup | ESLint fix | Det. (Rename) | Both |
| `hasAnimations` added to FormFieldGroupExpandableProps | -- | Struct. (PropTypeChange) | FA |
| Base classes now exclude `onToggle` | -- | Struct. (PropTypeChange) | FA |

### HELPER TEXT

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `hasIcon` and `isDynamic` removed from HelperTextItem | ESLint fix | -- | PC |
| `screenReaderText` rendering behavior changed | Warn | -- | PC |

### HINT

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `hasNoActionsOffset` added | -- | Struct. (PropTypeChange) | FA |

### ICON

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Size values `sm`/`md`/`lg`/`xl` removed from `iconSize`/`size` | -- | Det. (PropValueChange) | FA |

### JUMP LINKS

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `href` now required on JumpLinksItem | Warn | -- | PC |
| Markup changed: now uses Button internally | Warn | -- | PC |
| `scrollableRef` RefObject allows null | -- | Struct. (PropTypeChange) | FA |
| `onClick` simplified | -- | Struct. (PropTypeChange) | FA |
| JumpLinksItem no longer renders `<a>` (test impact) | -- | Struct. (test-impact) | FA |

### KEBAB TOGGLE

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| KebabToggle replaced with MenuToggle + EllipsisVIcon | ESLint fix | LLM (deprecated, 12 props removed) | Both |

### LABEL

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `isOverflowLabel` replaced with `variant="overflow"` | ESLint fix | Det. (Rename: `isOverflowLabel` to `isClickable`) | Both (*) |
| `status` added | -- | Struct. (PropTypeChange) | FA |
| `gold` and `cyan` values removed from `color` | ESLint fix (via colorProps) | Det. (PropValueChange) | Both |

(*) Note: pf-codemods maps `isOverflowLabel` to `variant="overflow"`, while frontend-analyzer maps it to `isClickable`. This is a semantic difference -- pf-codemods encodes the maintainers' intended migration path.

### LIST

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `className` added to ListItemProps | -- | Struct. (PropTypeChange) | FA |

### LOGIN

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| LoginMainFooterLinksItem restructured (Button wrapping) | ESLint fix | LLM (deprecated, 4 of 6 props removed) | Both |
| LoginMainHeader now uses `<div>` instead of `<header>` | Warn | Struct. (test-impact) | Both |
| `isPasswordRequired` added to LoginFormProps | -- | Struct. (PropTypeChange) | FA |

### LOG VIEWER

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Stylesheet moved out of PF into LogViewer itself | Warn | -- | PC |

### MASTHEAD

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| MastheadBrand renamed to MastheadLogo | ESLint fix | -- | PC |
| `backgroundColor` removed from Masthead | ESLint fix | Det. (RemoveProp) | Both |
| Masthead structure changes (MastheadToggle/Brand wrapping) | ESLint fix | Struct. (CompositionChange) | Both |
| `component` removed from MastheadBrandProps | -- | Det. (RemoveProp) | FA |
| MastheadBrandProps base changed from anchor to div | -- | Struct. (PropTypeChange) | FA |

### MENU

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| MenuItemAction markup changed (Button internally) | Warn | Struct. (PropTypeChange: base class change) | Both |
| `splitButtonOptions` replaced with `splitButtonItems` | ESLint fix | Det. (Rename) | Both |
| Icons should use `icon` prop instead of children | Warn | -- | PC |
| `onSelect` itemId parameter type changed | -- | Struct. (PropTypeChange) | FA |
| `popperProps` type changed to PopperOptions | -- | Struct. (PropTypeChange) | FA |
| MenuPopper removed (all 7 props) | -- | LLM | FA |
| MenuItemAction no longer renders `<button>` (test impact) | -- | Struct. (test-impact) | FA |

### MENU TOGGLE

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `splitButtonOptions` replaced with `splitButtonItems` | ESLint fix | Det. (Rename) | Both |
| `defaultChecked` type: `boolean \| null` to `boolean` | -- | Struct. (PropTypeChange) | FA |

### MODAL

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Old Modal deprecated, moved to `/deprecated` | ESLint fix | LLM | Both |
| ModalNext promoted from `/next` | ESLint fix | LLM | Both |
| Props moved to sub-components (description, footer, header, title, etc.) | -- | Det. (PropToChild, PropToChildren) | FA |
| ModalBox/ModalBoxBody/ModalBoxCloseButton/ModalBoxFooter/Header removed | -- | LLM | FA |
| Must contain ModalBody/ModalFooter/ModalHeader | -- | Struct. (CompositionChange) | FA |
| `backdropClassName` added | -- | Struct. (PropTypeChange) | FA |

### NAVIGATION

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `hasNavLinkWrapper` removed from NavItem | ESLint fix | Det. (RemoveProp) | Both |
| `tertiary` variant replaced with `horizontal-subnav` | ESLint fix | Det. (PropValueChange) | Both |
| `theme` removed from Nav | ESLint fix | Det. (RemoveProp) | Both |
| `icon` added to NavItemProps | -- | Struct. (PropTypeChange) | FA |
| `navRef` RefObject allows null | -- | Struct. (PropTypeChange) | FA |
| NavProps now excludes `onToggle` | -- | Struct. (PropTypeChange) | FA |
| NavList no longer renders `<button>` (test impact) | -- | Struct. (test-impact) | FA |

### NOTIFICATION

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| NotificationBadge now uses stateful button | Warn | -- | PC |
| NotificationDrawerHeader renders `<h1>` instead of Text | Warn | -- | PC |
| `actionHasNoOffset` added to NotificationDrawerListItemHeaderProps | -- | Struct. (PropTypeChange) | FA |

### PAGE

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `header` renamed to `masthead` | ESLint fix | Det. (Rename) | Both |
| `isTertiaryNavGrouped` to `isHorizontalSubnavGrouped` | ESLint fix | Det. (Rename) | Both |
| `isTertiaryNavWidthLimited` to `isHorizontalSubnavWidthLimited` | ESLint fix | Det. (Rename) | Both |
| `tertiaryNav` renamed to `horizontalSubnav` | ESLint fix | Det. (Rename) | Both |
| PageNavigation component removed | ESLint fix | LLM (component-removal) | Both |
| `theme` removed from PageSidebar | ESLint fix | Det. (RemoveProp) | Both |
| `type="nav"` removed from PageSection | ESLint fix | Det. (PropValueChange) | Both |
| PageSection variant updated (only "default"/"secondary") | ESLint fix | Det. (PropValueChange) | Both |
| `isSelected` removed from PageHeaderToolsItem | ESLint fix | Det. (RemoveProp) | Both |
| BarsIcon replaced with `isHamburgerButton` prop | ESLint fix | -- | PC |
| `hasBodyWrapper` prop logic change warning | Warn | -- | PC |
| Variant classes only applied when `type="default"` | Warn | -- | PC |
| Page markup changed with horizontalSubnav/breadcrumb | Warn | -- | PC |
| `hasBodyWrapper` added to PageBreadcrumbProps/PageSectionProps | -- | Struct. (PropTypeChange) | FA |
| `isFilled` added to PageGroupProps | -- | Struct. (PropTypeChange) | FA |
| `skipToContent` type: ReactElement to ReactElement<any> | -- | Struct. (PropTypeChange) | FA |
| Page no longer renders `<section>` (test impact) | -- | Struct. (test-impact) | FA |
| PageToggleButton aria-label changed (test impact) | -- | Struct. (test-impact) | FA |

### PAGINATION

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Pagination markup changed (new wrapper element) | Warn | -- | PC |
| `toggleTemplate` return type updated | -- | Struct. (PropTypeChange) | FA |
| `onSetPage` and `page` now required on PaginationNavigation | -- | Struct. (PropTypeChange) | FA |

### PANEL

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `variant` now supports `secondary` value | -- | Struct. (PropTypeChange) | FA |

### POPPER

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `appendTo` default changed to `document.body` | Warn | -- | PC |
| PopperProps now extends PopperOptions | -- | Struct. (PropTypeChange) | FA |

### SELECT (deprecated)

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Deprecated Select flagged | Warn | LLM (member_mappings, 50+ removed props, 31.8% overlap) | Both |
| No longer provides SelectContext | -- | Struct. (CompositionChange) | FA |
| `toggleRef` allows null; `label` string to ReactNode | -- | Struct. (PropTypeChange) | FA |
| No longer renders `<button>`, `<input>`, `<li>` (test impact) | -- | Struct. (test-impact) | FA |
| Roles `option`, `presentation`, `listbox` removed (test impact) | -- | Struct. (test-impact) | FA |
| Full deprecated family removed (SelectState, SelectPopper, etc.) | -- | LLM (removed_members) | FA |

### SIDEBAR

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `backgroundVariant` added to SidebarContentProps/SidebarPanelProps | -- | Struct. (PropTypeChange) | FA |

### SIMPLE LIST

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `onSelect` and `currentRef` RefObject types allow null | -- | Struct. (PropTypeChange) | FA |

### SLIDER

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| CSS variable `--Left` changed to `--InsetInlineStart` | Warn | Det. (CssVariablePrefix, via global CSS rules) | Both |

### SWITCH

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `labelOff` removed | ESLint fix | Det. (RemoveProp) | Both |

### TABS

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `isSecondary` renamed to `isSubtab` | ESLint fix | Det. (Rename) | Both |
| `light300` variant replaced with `secondary` | ESLint fix | Det. (PropValueChange) | Both |
| Scroll buttons markup changed (div wrapper, Button) | Warn | -- | PC |
| `popperProps` added (HorizontalOverflowObject) | -- | Struct. (PropTypeChange) | FA |
| `isAddButtonDisabled` added | -- | Struct. (PropTypeChange) | FA |
| TabsProps now excludes `onToggle` | -- | Struct. (PropTypeChange) | FA |
| No longer renders `<button>` (test impact) | -- | Struct. (test-impact) | FA |

### TEXT / CONTENT

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Text/TextContent/TextList/TextListItem replaced with Content | ESLint fix | LLM (member_mappings, overlap_ratio) | Both |
| TextVariants renamed to ContentVariants | ESLint fix | Det. (Rename) | Both |

### TEXT AREA

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `resizeOrientation` now includes `none` | -- | Struct. (PropTypeChange) | FA |

### TEXT INPUT

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| TextInputBase base class changed | -- | Struct. (PropTypeChange) | FA |

### TEXT INPUT GROUP

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `validated` added to TextInputGroupProps | -- | Struct. (PropTypeChange) | FA |
| `inputProps` added to TextInputGroupMainProps | -- | Struct. (PropTypeChange) | FA |

### TABLE

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| CSS variables changed for sticky columns (Th/Td) | Warn | Det. (CssVariablePrefix) | Both |
| `variant`, `hasAnimations`, `hasAction`, `additionalContent`, etc. added | -- | Struct. (PropTypeChange) | FA |
| Td and Th now require TableContext | -- | Struct. (CompositionChange) | FA |
| Extensive composition/conformance rules (Table/Tr/Td/Th nesting) | -- | Struct. (CompositionChange) | FA |
| `extraParams` type significantly restructured | -- | Struct. (PropTypeChange) | FA |

### TILE

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Tile deprecated, suggests Card | ESLint fix | Struct. (PropTypeChange: `title` now required) | Both |

### TOKENS (JS-level)

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Token constants prefixed with `t_` | ESLint fix | Det. (Rename, ConstantGroup) | Both |
| Old token references updated to new | ESLint fix | Det. (Rename, ConstantGroup) | Both |
| 6,674 constants removed from react-tokens | -- | Det. (ConstantGroup) | FA |
| 2,021 constants with type changes | -- | Struct. (ConstantGroup) | FA |
| 1,747 react-icons constants with type changes | -- | Struct. (ConstantGroup) | FA |

### TOGGLE GROUP

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `iconPosition` added to ToggleGroupItemProps | -- | Struct. (PropTypeChange) | FA |

### TOOLBAR

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| ToolbarChipGroupContent renamed to ToolbarLabelGroupContent | ESLint fix | Det. (Rename) | Both |
| Group variants: `button-group` to `action-group`, `icon-button-group` to `action-group-plain` | ESLint fix | Det. (PropValueChange) | Both |
| `chip-group` replaced with `label-group` on ToolbarItem | ESLint fix | Det. (PropValueChange) | Both |
| Props removed: `usePageInsets`, `alignSelf`, `widths`, `alignment` | ESLint fix | Det. (RemoveProp) | Both |
| Chip-related props renamed to label (14+ renames) | ESLint fix | Det. (Rename) | Both |
| Interfaces: ToolbarChipGroup to ToolbarLabelGroup, etc. | ESLint fix | Det. (Rename) | Both |
| `spacer`/`spaceItems` replaced with `gap`/`columnGap` | ESLint fix | Det. (Rename) | Both |
| `alignLeft`/`alignRight` to `alignStart`/`alignEnd` | ESLint fix | Det. (PropValueChange) | Both |
| ToolbarLabelGroupContent markup changed | Warn | -- | PC |
| `colorVariant`, `rowWrap`, `rowGap` added | -- | Struct. (PropTypeChange) | FA |
| Old spacer string values removed (`spacerNone`, `spacerSm`, etc.) | -- | Det. (PropValueChange) | FA |
| `expandableContentRef` RefObject allows null | -- | Struct. (PropTypeChange) | FA |
| ToolbarGroupProps base now excludes `onToggle` | -- | Struct. (PropTypeChange) | FA |

### TREE VIEW

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| `pf-m-selectable` class removed from list items | Warn | -- | PC |
| `hasAnimations` added | -- | Struct. (PropTypeChange) | FA |

### TRUNCATE

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Changed from FunctionComponent to ForwardRefExoticComponent | -- | Struct. (PropTypeChange) | FA |

### USER FEEDBACK

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| FeedbackModal CSS import changes | Warn | -- | PC |

### WIZARD

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| WizardStep `body` prop no longer accepts null | ESLint fix | Struct. (PropTypeChange) | Both |
| WizardFooter now uses ActionList wrapping | Warn | -- | PC |
| WizardNavItem has new wrapper and error icon | Warn | -- | PC |
| `success` value added to `status` | -- | Struct. (PropTypeChange) | FA |
| `footer` type: ReactElement to ReactElement<any> | -- | Struct. (PropTypeChange) | FA |

---

## 2. Cross-Cutting Concerns Comparison

### Deprecated Component Removals

| Deprecated Component | pf-codemods | frontend-analyzer | Coverage |
|----------------------|-------------|-------------------|----------|
| ApplicationLauncher (+ Content, Icon, Item, Text) | Warn | LLM (20 props removed, member_mappings) | Both |
| ContextSelector (+ Footer, Item) | Warn | LLM (24 props removed) | Both |
| Old Dropdown (+ Menu, Toggle, ToggleAction, ToggleCheckbox) | Warn + ESLint fix (kebab) | LLM (full family, member_mappings) | Both |
| Old Select (+ State, Popper, OptionObject, ViewMoreObject) | Warn | LLM (50+ removed, 31.8% overlap) | Both |
| OptionsMenu (+ Item, ItemGroup, Toggle, ToggleWithText) | Warn | LLM (14 props removed) | Both |
| PageHeader (+ Tools, ToolsGroup, ToolsItem) | Warn | LLM (11 props removed) | Both |
| BadgeToggle | Warn | LLM (13 props removed) | Both |
| KebabToggle | ESLint fix | LLM (12 props removed) | Both |
| Separator | Warn | LLM (4 props removed) | Both |
| Popper (deprecated) | -- | LLM (32 of 37 props removed) | FA |
| DraggableObject | -- | Manual | FA |

### CSS Variables (Consumer Stylesheets)

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| JS token constant renames | ESLint fix (2 rules) | Det. (ConstantGroup, 2 rules covering thousands) | Both |
| `--pf-v5-c-*` to `--pf-v6-c-*` in CSS/SCSS | -- | Det. (CssVariablePrefix) | FA |
| `--pf-v5-global--*` to `--pf-t--global--*` in CSS/SCSS | -- | Det. (CssVariablePrefix, 220+ mappings) | FA |
| `--pf-v5-chart-*` to `--pf-v6-chart-*` in CSS/SCSS | -- | Det. (CssVariablePrefix) | FA |
| `pf-v5-` class prefix in consumer CSS | -- | Det. (CssVariablePrefix) | FA |
| Logical property suffix renames | -- | Det. (CssVariablePrefix, 24 rules) | FA |
| CSS class removals (`pf-c-chip`, `pf-c-dropdown`, etc.) | -- | Det. (css-removal, 8 rules) | FA |

### Package-Level Concerns

| Package | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| react-core | 80+ rules, ESLint fix | 254 rules, all fix tiers | Both |
| react-charts | 1 rule, ESLint fix | 81 rules, ImportPathChange + PropTypeChange | Both |
| react-component-groups | 11 rules, ESLint fix | 0 rules | PC |
| react-tokens | 2 rules, ESLint fix | ~165 rules (grouped), Rename + ConstantGroup | Both |
| react-table | 1 rule, Warn | 13 rules, CompositionChange + PropTypeChange | Both (FA much deeper) |
| react-templates | 0 rules | 15 rules, PropTypeChange + LLM | FA |
| react-code-editor | 0 rules | 4 rules, PropTypeChange | FA |
| react-drag-drop | 2 rules (deprecated/promoted) | 7 rules, PropValueChange + PropTypeChange + Manual | Both (FA much deeper) |
| react-icons | 0 rules | ~1,747 rules (grouped), ConstantGroup | FA |
| Consumer CSS/SCSS | 0 rules | 233 rules, CssVariablePrefix | FA |

### Workflow / Utility Concerns

| Concern | pf-codemods | frontend-analyzer | Coverage |
|---------|-------------|-------------------|----------|
| Remove `data-codemods` temp attributes | ESLint fix | -- | PC |
| Deduplicate PF imports | ESLint fix | -- | PC |
| Remove unused PF imports | ESLint fix | -- | PC |
| `hasAnimations` prop suggestion | ESLint fix (optional) | Struct. (PropTypeChange) | Both |
| Dependency version updates (package.json) | -- | Det. (UpdateDependency, 13 rules) | FA |
| Node engine constraint (>=22.17.1) | -- | Det. (manifest, 1 rule) | FA |

---

## 3. Coverage Summary

### By coverage category

| Category | Both | pf-codemods only | frontend-analyzer only |
|----------|------|-------------------|------------------------|
| Prop renames | 25+ | 11 (component-groups) | 10+ (new props, base class) |
| Prop removals | 15+ | 2 (helperTextItem) | 30+ (deprecated families) |
| Prop value changes | 10+ | 0 | 40+ (spacer values, variant values) |
| Import path changes | 1 (charts) | 0 | 78 (individual chart imports) |
| Component removals/deprecations | 10+ | 0 | 50 (individual component rules) |
| Component renames | 5+ (comp-groups) | 5 (comp-groups only) | 0 |
| Interface renames | 5+ | 0 | 24+ |
| CSS variable renames (JS) | 2 | 0 | ~10,000 (grouped) |
| CSS variable renames (CSS/SCSS) | 0 | 0 | 233 |
| Type compatibility changes | 0 | 0 | 77 |
| Composition/conformance | 0 | 0 | 110 |
| Test impact | 0 | 0 | 28 |
| Context dependency | 0 | 0 | 14 |
| Signature changes | 0 | 0 | 111 |
| Behavioral/markup warnings | 0 | 22 | 0 |
| Dependency updates | 0 | 0 | 13 |
| Code quality/workflow | 0 | 3 | 0 |

### Fix capability comparison

| Metric | pf-codemods | frontend-analyzer |
|--------|-------------|-------------------|
| Total rules | 106 | 950 |
| Rules with any fix | 78 (74%) | 900 (95%) |
| Deterministic auto-fix | 78 (ESLint AST) | 485 (text replacement) |
| LLM-assisted fix | 0 | 162 |
| Structured guidance | 0 | 217 |
| Manual only | 28 (warnings) | 36 |
| Fix precision | High (AST-aware, structural) | Varies (exact for renames/CSS, LLM for complex) |
| Fix scope | JSX/JS/TS source files | JSX/JS/TS + CSS/SCSS + package.json |

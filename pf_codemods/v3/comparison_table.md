# Side-by-Side Rule Comparison Table

## Legend

- **Coverage:** Both = both tools cover it, PC = pf-codemods only, FA = frontend-analyzer only
- **Impact Tier:** T1 = compilation break, T2 = runtime/behavioral, T3 = test break, T4 = informational
- **Fix Quality:** AST = AST-aware transform, Det = deterministic text replace, LLM = LLM context/metadata, Guid = structured guidance, Warn = warning only, Manual = no automation, Remove = prop removal guidance (no regex)

---

## 1. Component-Level Comparison

### Accordion

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| AccordionContent `isHidden` removed | T1 | AST auto-fix (remove prop) | Remove: `RemoveProp` | Both | Agree. PC auto-fixes; FA flags only. |
| AccordionItem renders div wrapper | T3 | Warn | Test-impact | Both | Agree on the change. PC warns at code level; FA describes DOM output. |
| AccordionToggle `isExpanded` moved to AccordionItem | T1 | AST auto-fix (move prop to ancestor) | Guid: `CompositionChange` | Both | PC provides complex structural auto-fix. FA describes the change but cannot fix. |
| AccordionContent `isExpanded` signature changed | T4 | -- | Guid: `PropTypeChange` (new optional prop) | FA | Tier 4 noise. New optional prop. No action needed. |

### Avatar

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `border` -> `isBordered` | T1 | AST auto-fix (prop rename) | Det: `Rename` | Both | Agree on rename. |
| `size` prop type changed | T1 | -- | Guid: `PropTypeChange` | FA | tsc catches. |

### Banner

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `variant` prop removed/replaced | T1 | AST auto-fix (rename to `color`, remove if default) | Remove: `RemoveProp` | Both | **DISAGREE.** PC renames to `color`; FA says just remove. PC is correct -- prop was replaced, not deleted. |
| `color` prop type/values | T4 | -- | Guid: `PropTypeChange` | FA | Tier 4. Documents new prop signature. |
| `status` prop added | T4 | -- | Guid: `PropTypeChange` | FA | Tier 4. New optional prop. |

### Button

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `isActive` -> `isClicked` | T1 | AST auto-fix (prop rename) | Remove: `RemoveProp` | Both | FA marks as removal. PC correctly renames. |
| Icon children -> `icon` prop | T2 | AST auto-fix (complex JSX restructuring) | -- | **PC** | **FA gap.** No coverage of this structural change. |
| Favorite button pattern | T2 | Warn | -- | PC | No FA coverage. |
| New props (hamburgerVariant, hasNoPadding, etc.) | T4 | -- | Guid: `PropTypeChange` | FA | Tier 4 noise. New optional props. |

### Card

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| Remove isSelectableRaised, isDisabledRaised, hasSelectableInput, selectableInputAriaLabel, onSelectableInputChange | T1 | AST auto-fix (remove 5 props) | -- | **PC** | **FA gap.** FA has no rules for these removals. |
| Clickable card markup update | T2 | AST auto-fix (complex multi-component) | -- | **PC** | **FA gap.** |
| Card composition (must contain CardHeader) | T2 | -- | LLM: `LlmAssisted` | FA | FA detects but delegates to LLM. |
| Card no longer renders `<input>` | T3 | -- | Test-impact | FA | FA-only test impact detail. |

### Charts (all components)

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| Import path: `@patternfly/react-charts` -> `/victory` | T1 | AST auto-fix (import rewrite for 40+ specifiers) | Det: `ImportPathChange` (78 rules) | Both | Agree. PC handles as 1 rule; FA has 78 per-interface rules. |
| Per-component prop type changes (backgroundComponent, etc.) | T1 | -- | Guid: `PropTypeChange` | FA | tsc catches. FA adds context. |
| New optional props on chart components | T4 | -- | Guid: `PropTypeChange` | FA | Tier 4 noise across ~15 rules. |

### Checkbox / Radio

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `isLabelBeforeButton` -> `labelPosition="start"` | T1 | AST auto-fix | Det: `Rename` | Both | Agree. |

### Chip / ChipGroup -> Label / LabelGroup

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| Chip deprecated (import path) | T1 | AST auto-fix (move to deprecated) | Det: `DeprecatedMigration` | Both | **DISAGREE on direction.** FA has from=deprecated, to=core (appears inverted). PC correctly moves to deprecated. |
| Chip -> Label full migration | T1 | AST auto-fix (component replacement, prop mapping: onClick->onClose, badge->children, variant="outline") | LLM: `LlmAssisted` (no prop mappings) | Both | PC is far more complete. FA delegates to LLM with no structured data. |
| ChipGroup -> LabelGroup | T1 | AST auto-fix | LLM: `LlmAssisted` | Both | Same gap as above. |

### DataList

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| DataListAction `isPlainButtonAction` removed | T1 | AST auto-fix (remove prop) | Remove: `RemoveProp` | Both | Agree. |

### Drawer

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `colorVariant` light-200 -> secondary | T1 | AST auto-fix (value mapping + enum) | Guid: `PropTypeChange` | Both | Agree on mapping. FA documents full type change including enum rename (DrawerColorVariant -> DrawerContentColorVariant). |
| DrawerContent `no-background` removed | T1 | AST auto-fix | Guid: `PropValueChange` | Both | Agree. |
| DrawerHead `hasNoPadding` removed | T1 | AST auto-fix | Remove: `RemoveProp` | Both | Agree. |
| DrawerHead markup change | T3 | Warn | -- | PC | No FA test-impact rule for this. |

### DualListSelector

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| Deprecated (move to deprecated import) | T1 | AST auto-fix | Det: `Rename` (import path) | Both | Agree. |
| Next promoted (move from /next) | T1 | AST auto-fix | -- | PC | FA doesn't cover promotion. |
| DualListSelectorListItem type changes | T1 | -- | Guid: `PropTypeChange` | FA | tsc catches. |

### EmptyState

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| EmptyStateHeader collapse into EmptyState | T1 | AST auto-fix (complex JSX restructuring) | LLM: `LlmAssisted` | Both | PC provides complete structural auto-fix. FA only flags. |
| EmptyStateIcon -> icon prop | T1 | AST auto-fix (child to prop) | Guid: `ChildToProp` | Both | Agree on direction. PC auto-fixes; FA describes. |
| EmptyStateHeader/Icon no longer exported | T1 | AST auto-fix (remove imports) | Det: `Rename` | Both | Agree. |
| New props (headerClassName, status, etc.) | T4 | -- | Guid: `PropTypeChange` | FA | Tier 4 noise. |

### ExpandableSection

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `isActive` removed | T1 | AST auto-fix (remove prop) | Remove: `RemoveProp` | Both | Agree. |
| Base class type change | T1 | -- | Guid: `PropTypeChange` | FA | tsc catches (Omit added to base). |

### FormGroup

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `labelIcon` -> `labelHelp` | T1 | AST auto-fix (prop rename) | Det: `Rename` | Both | Agree. |
| FormFieldGroupHeaderTitleTextObject typo fix | T1 | AST auto-fix (interface rename) | Det: `Rename` | Both | Agree. |

### HelperTextItem

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `hasIcon`, `isDynamic` removed | T1 | AST auto-fix (remove props) | Remove: `RemoveProp` | Both | Agree. |
| screenReaderText behavior change | T2 | Warn | -- | PC | No FA coverage of behavioral change. |

### JumpLinks

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `href` now required | T1 | Warn | Guid: `PropTypeChange` | Both | Neither auto-fixes. |
| Markup change (Button internally) | T3 | Warn | Test-impact | Both | Agree. |

### Label

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `isOverflowLabel` -> `variant="overflow"` | T1 | AST auto-fix (prop to variant value) | Remove: `RemoveProp` | Both | **PARTIAL DISAGREE.** FA only removes prop; PC correctly converts to variant. |
| Color values: cyan->teal, gold->yellow | T1 | AST auto-fix (value mapping) | Guid: `PropValueChange` | Both | Agree on mapping. |

### Login

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| LoginMainFooterLinksItem restructured | T1 | AST auto-fix (complex: wrap in Button) | -- | PC | FA gap. |
| LoginMainHeader markup change | T3 | Warn | -- | PC | No FA coverage. |

### Masthead

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| MastheadBrand -> MastheadLogo | T1 | AST auto-fix (component rename) | Det: `Rename` | Both | Agree. |
| `backgroundColor` removed | T1 | AST auto-fix (remove prop) | Remove: `RemoveProp` | Both | Agree. |
| Structural changes (Toggle inside Main, Logo inside Brand) | T2 | AST auto-fix (complex multi-component) | LLM: `LlmAssisted` | Both | PC provides complete structural auto-fix. FA delegates to LLM. |
| MastheadBrand.component prop removed | T1 | -- | Remove: `RemoveProp` | FA | FA catches a detail PC handles differently (via rename). |

### MenuToggle

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `splitButtonOptions` -> `splitButtonItems` | T1 | AST auto-fix (complex restructuring) | Guid: `PropTypeChange` | Both | PC auto-fixes; FA only documents type change. |
| Icon-only toggle pattern | T2 | Warn | -- | PC | No FA coverage. |

### Modal

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| Modal deprecated (move import) | T1 | AST auto-fix | Det: `Rename` (import path) | Both | Agree. |
| Modal next promoted | T1 | AST auto-fix | -- | PC | FA doesn't cover promotion. |
| Modal composition requirements | T2 | -- | Guid: `CompositionChange` (must have ModalBody/Footer/Header) | FA | FA-only conformance. |
| Modal props -> ModalHeader (title, description, titleIconVariant, help) | T1 | -- | Guid: `PropToChild` | FA | FA describes the structural migration. PC handles via deprecated/promoted import moves. |

### Nav

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `tertiary` -> `horizontal-subnav` | T1 | AST auto-fix (value mapping) | Guid: `PropValueChange` | Both | Agree. |
| `theme` removed | T1 | AST auto-fix (remove prop) | Remove: `RemoveProp` | Both | Agree. |
| NavItem `hasNavLinkWrapper` removed | T1 | AST auto-fix (remove prop) | Remove: `RemoveProp` | Both | Agree. |

### NotificationBadge / NotificationDrawer

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| NotificationBadge markup change | T3 | Warn | Test-impact | Both | Agree. FA more specific on DOM changes. |
| NotificationDrawerHeader markup | T3 | Warn | Test-impact | Both | Agree. |
| NotificationDrawer composition | T2 | -- | Guid: `CompositionChange` | FA | FA-only conformance. |

### Page

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `header` -> `masthead` | T1 | AST auto-fix (prop rename) | Det: `ImportPathChange` | Both | Agree. |
| `tertiaryNav` -> `horizontalSubnav` | T1 | AST auto-fix | -- | **PC** | **FA gap.** Not found in FA rules. |
| `isTertiaryNavGrouped` -> `isHorizontalSubnavGrouped` | T1 | AST auto-fix | -- | **PC** | **FA gap.** |
| `isTertiaryNavWidthLimited` -> `isHorizontalSubnavWidthLimited` | T1 | AST auto-fix | -- | **PC** | **FA gap.** |
| PageSidebar `theme` removed | T1 | AST auto-fix | Remove: `RemoveProp` | Both | Agree. |
| PageSection nav type removed | T1 | AST auto-fix | Remove: `RemoveProp` | Both | Agree. |
| PageSection variant values update | T1 | AST auto-fix (value validation) | Guid: `PropValueChange` | Both | Agree. |
| PageNavigation removed | T1 | AST auto-fix (remove component) | -- | **PC** | **FA gap.** |
| PageBreadcrumb/Section wrapper logic | T2 | AST auto-fix (add hasBodyWrapper) | -- | PC | No FA coverage. |
| PageHeaderToolsItem `isSelected` removed | T1 | AST auto-fix | Remove: `RemoveProp` | Both | Agree. |
| Page markup changes | T3 | Warn | -- | PC | |
| Pagination markup change | T3 | Warn | Test-impact | Both | |

### Switch

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `labelOff` removed | T1 | AST auto-fix (remove prop) | Remove: `RemoveProp` | Both | Agree. |

### Tabs

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| `isSecondary` -> `isSubtab` | T1 | AST auto-fix (prop rename) | Det: `Rename` | Both | Agree. |
| `light300` -> `secondary` variant | T1 | AST auto-fix (value mapping) | Guid: `PropValueChange` | Both | Agree. |
| Scroll button markup | T3 | Warn | Test-impact | Both | Agree. |

### Text -> Content

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| Text/TextContent/TextList/TextListItem -> Content | T1 | AST auto-fix (complex: 8-component replacement) | LLM: `LlmAssisted` (vague) | Both | **Major FA gap.** PC provides complete automated migration. FA only vaguely flags deprecation. |
| TextVariants -> ContentVariants | T1 | AST auto-fix (part of above) | Det: `Rename` | Both | Agree on this specific rename. |
| TextProps -> ContentProps | T1 | AST auto-fix | -- | PC | Not found in FA. |
| `isVisited` -> `isVisitedLink` | T1 | AST auto-fix | -- | PC | Not found in FA. |

### Tile

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| Tile deprecated | T1 | AST auto-fix (move to deprecated) | Det: `Rename` (import path) | Both | Agree. |

### Toolbar

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| Chip -> Label prop renames (11 props) | T1 | AST auto-fix (1 rule, 11 renames) | Det: `Rename` (8 rules) | Both | **Agree.** Same from/to values. |
| ToolbarChipGroupContent -> ToolbarLabelGroupContent | T1 | AST auto-fix | Det: `Rename` | Both | Agree. |
| Interface renames (ToolbarChipGroup->ToolbarLabelGroup, etc.) | T1 | AST auto-fix | Det: `Rename` | Both | Agree. |
| Variant value changes (button-group->action-group, etc.) | T1 | AST auto-fix (value mapping) | Guid: `PropValueChange` | Both | Agree. |
| ToolbarItem variant updates | T1 | AST auto-fix | Guid: `PropValueChange` | Both | Agree. |
| spacer -> gap | T1 | AST auto-fix (prop rename + value transform) | Det: `Rename` | Both | Agree. |
| Alignment value changes | T1 | AST auto-fix (value mapping in objects) | Guid: `PropValueChange` | Both | Agree. |
| Remove usePageInsets, alignSelf, widths, alignment | T1 | AST auto-fix (remove props) | Remove: `RemoveProp` | Both | Agree. |
| ToolbarLabelGroupContent markup | T3 | Warn | -- | PC | |

### TreeView

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| pf-m-selectable removed | T2 | Warn | -- | PC | No FA coverage of CSS class removal. |

### Wizard

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| WizardStep `body` no longer accepts null | T1 | AST auto-fix | Guid: `PropTypeChange` | Both | Agree. |
| WizardFooter markup change | T3 | Warn | Test-impact | Both | |
| WizardNavItem markup change | T3 | Warn | Test-impact | Both | |

---

## 2. Cross-Cutting Concerns

### Deprecated Component Removals

| Component Group | Tier | pf-codemods | FA | Coverage | Notes |
|----------------|------|-------------|-----|----------|-------|
| ApplicationLauncher, ContextSelector, old Dropdown, KebabToggle, BadgeToggle, OptionsMenu, PageHeader, old Select (40+ specifiers) | T1 | Warn (removeDeprecatedComponents) | LLM: `LlmAssisted` (50 component-removal rules) | Both | PC warns; FA provides some member_mappings and overlap_ratio for LLM-powered migration. Neither auto-fixes the full migration (except KebabToggle which PC auto-fixes separately). |
| KebabToggle -> MenuToggle | T1 | AST auto-fix (complex: component replacement + icon) | LLM: `LlmAssisted` | Both | PC has the complete auto-fix. FA delegates to LLM. |
| Chip -> Label | T1 | AST auto-fix (complex) | LLM: `LlmAssisted` | Both | See Chip section. PC is complete; FA is vague. |
| Text -> Content | T1 | AST auto-fix (complex) | LLM: `LlmAssisted` | Both | See Text section. Major FA gap. |
| Modal (deprecated + next promoted) | T1 | AST auto-fix (import moves) | Det/LLM | Both | PC handles import path; FA has some structural guidance. |
| DualListSelector (deprecated + next promoted) | T1 | AST auto-fix (import moves) | Det | Both | Agree. |
| DragDrop deprecated | T1 | AST auto-fix (move to deprecated) | Det: `Rename` | Both | Agree on deprecated import. |
| Tile deprecated | T1 | AST auto-fix | Det: `Rename` | Both | Agree. |

### CSS Variables

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| JS token imports (react-tokens) | T1 | AST auto-fix (tokensUpdate, tokensPrefixWithT) | Guid: `PropTypeChange` | Both | PC auto-fixes JS token imports. FA only describes type changes. |
| CSS custom property renames in stylesheets (233 variables) | T2 | -- | Det: `CssVariablePrefix` (233 rules) | **FA** | **FA's strongest unique value.** Concrete from/to mappings for all 233 renamed CSS custom properties. |
| CSS custom properties removed (8 properties) | T2 | -- | Manual | **FA** | FA detects; no fix. Developer must remove usage manually. |
| CSS class rename (1) | T2 | -- | Manual | **FA** | Niche. |

### Package-Level Coverage

| Package | pf-codemods | FA | Coverage Gap |
|---------|------------|-----|-------------|
| @patternfly/react-core | 82 rules (59 auto-fix) | 437 rules | FA has more granular rules but PC has better fixes |
| @patternfly/react-component-groups | 11 rules (11 auto-fix) | 0 rules | **FA missing entirely** |
| @patternfly/react-charts | 1 rule (import path move) | 82 rules | FA covers per-component type changes; PC covers the main breaking change |
| @patternfly/react-table | 1 rule (warning) | 31 rules | **FA significantly more coverage** |
| @patternfly/react-templates | 0 rules | 16 rules | **FA only** |
| @patternfly/react-drag-drop | 1 rule (deprecated import) | 17 rules | **FA covers new API changes PC misses** |
| @patternfly/react-code-editor | 0 rules | 3 rules | **FA only** |
| @patternfly/react-tokens | 2 rules (auto-fix) | 4 rules | Both cover, PC has better fixes |
| @patternfly/react-core/deprecated | 3 rules | 37 rules | FA has more deprecated component detail |
| @patternfly/react-icons | 0 rules | 1 rule | FA only (minor) |

### Workflow / Utility Concerns

| Concern | Tier | pf-codemods | FA | Coverage | Notes |
|---------|------|-------------|-----|----------|-------|
| data-codemods attribute cleanup | -- | AST auto-fix | -- | **PC** | Migration utility. |
| Duplicate import specifier removal | -- | AST auto-fix | -- | **PC** | Migration utility. |
| Unused PF import removal | -- | AST auto-fix | -- | **PC** | Migration utility. |
| Dependency version updates (13 packages) | T1 | -- | Det: `UpdateDependency` | **FA** | Mechanical package.json updates. |
| Node.js engine constraint | T1 | -- | Manual | **FA** | >=20.15.1 -> >=22.17.1. |
| Enable animations (hasAnimations prop) | T2 | AST auto-fix | -- | **PC** | FA doesn't cover animation opt-in. |

---

## 3. Coverage Summary with Impact Weighting

### By Impact Tier

| Tier | Both | PC Only | FA Only | Total Unique Concerns | % FA-only genuinely incremental |
|------|------|---------|---------|----------------------|-------------------------------|
| **T1 (compilation)** | ~85 | ~20 | ~333 | ~438 | ~60% (tsc catches ~59 type-changed; ~100 are per-property granularity of concerns PC covers as single rules) |
| **T2 (runtime)** | ~15 | ~18 | ~353 | ~386 | ~70% (233 CSS vars are genuine; 110 conformance are moderate; rest are small) |
| **T3 (test)** | ~10 | ~8 | ~10 | ~28 | ~30% (tests catch these; FA adds diagnostic detail) |
| **T4 (info)** | 0 | 0 | ~98 | ~98 | **0%** (no action needed) |
| **Total** | ~110 | ~46 | ~794 | ~950 | |

**This table is the key insight:** FA's 794 "FA-only" rules look massive, but:
- 98 are Tier 4 noise (0% incremental value)
- ~59 are type changes `tsc` catches
- ~110 are conformance rules (moderate value, no fixes)
- ~233 are CSS variables (genuine value, deterministic fixes)
- The remainder includes additional package coverage (~67 genuine) and per-property breakdowns of concerns PC handles at component level

### Fix Quality Head-to-Head

| Dimension | pf-codemods | FA (honest) |
|-----------|-------------|-------------|
| Rules that auto-fix source code | **78** (all AST-aware) | **108** regex-based (of 646 claimed) |
| Additional deterministic fixes possible | -- | ~173 (JSON data exists but not connected to YAML) |
| Complex structural transforms | **13** (JSX restructuring, component replacement) | **0** (cannot do structural transforms) |
| Fix mechanism | ESLint fixer API (AST) | Regex search/replace (text) |
| Handles aliased imports | Yes | No |
| Handles spread props | Yes (detects and warns) | No |
| Handles dynamic/computed values | Yes | No |
| Scoped to PF imports | Yes | No (regex matches any occurrence) |
| CSS file fixes | No | **Yes** (233 CssVariablePrefix) |
| Package.json fixes | No | **Yes** (13 UpdateDependency) |
| LLM migration context | No | 20 entries with useful metadata |
| Cleanup utilities | 3 rules | None |

### Incremental Value Summary

| Category | Count | Assessment |
|----------|-------|-----------|
| **FA's genuine incremental value** | **~310 rules** | CSS variable migration (233), additional package rules (~54), context-dependency (14), CSS removal/class (9) |
| **FA's moderate value** (saves time, discoverable otherwise) | **~176 rules** | Conformance/composition (128), test-impact details (28), LLM metadata with actual data (~20) |
| **FA's zero incremental value** | **~367 rules** | Tier 4 noise (98), tsc-redundant type changes (59), overlap with pf-codemods (~95), bare LLM entries (52), identity no-ops (63) |
| **Remaining gray area** | **~97 rules** | Per-property granularity of concerns partially covered by pf-codemods |
| | | |
| **pf-codemods unique strengths** | **~46 rules** | react-component-groups (11), complex structural transforms (13), behavioral warnings (18), cleanup utilities (3), Page tertiaryNav renames (3) |

### Semantic Disagreement Summary

| Concern | pf-codemods Says | FA Says | Correct |
|---------|-----------------|---------|---------|
| Banner `variant` | Rename to `color` (or remove if default) | RemoveProp (just delete) | **pf-codemods** -- prop was replaced |
| Chip migration direction | Move Chip to deprecated; replace with Label from core | DeprecatedMigration from=deprecated, to=core (inverted?) | **pf-codemods** -- direction appears correct |
| Label `isOverflowLabel` | Convert to `variant="overflow"` | RemoveProp (just delete) | **pf-codemods** -- prop was converted, not just removed |
| Button icon migration | Move icon children to `icon` prop | (no coverage) | **pf-codemods** -- FA misses this |
| Text -> Content | Full 8-component replacement with prop mapping | Only enum rename + vague deprecation flag | **pf-codemods** -- FA severely incomplete |
| Card prop removals | Remove 5 specific props | (no coverage) | **pf-codemods** -- FA misses these |
| Page tertiaryNav renames | 3 prop renames | (no coverage) | **pf-codemods** -- FA misses these |
| Drawer colorVariant | light-200 -> secondary | Documents full type change including enum rename | **Both correct** -- FA has broader context |
| Toolbar chip->label | 11 prop renames | 8 individual rename rules (same values) | **Both correct** -- full agreement |
| Charts import path | Move to /victory (1 rule, 40+ specifiers) | Move to /victory (78 rules, per-interface) | **Both correct** -- same fix |

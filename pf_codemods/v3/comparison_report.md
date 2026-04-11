# PatternFly 5 to 6 Migration: Honest Comparison of pf-codemods vs. frontend-analyzer-provider

## Executive Summary

**Bottom line:** frontend-analyzer-provider (FA) adds genuine value on top of pf-codemods in exactly two areas: **CSS variable migration in stylesheets** (233 rules with deterministic fixes) and **broader package coverage** for react-table, react-templates, react-drag-drop, and react-code-editor (~67 rules). Everything else FA provides is either already handled by pf-codemods, already caught by `tsc`, already caught by the test suite, or is informational noise that requires no developer action.

FA's headline numbers are misleading. Its 950 rules include 98 that require no code changes at all (new optional props, type widenings). Its "646 auto-fixable" count includes only 108 rules that produce concrete code changes via regex -- the rest are structured descriptions, LLM context metadata, or identity no-ops. By contrast, pf-codemods' 78 auto-fix rules all produce AST-aware source code transforms that handle aliased imports, spread props, and complex JSX restructuring.

| Metric | pf-codemods | FA (headline) | FA (honest) |
|--------|-------------|---------------|-------------|
| Total rules | 106 | 950 | 852 actual breaking changes |
| Auto-fix rules | 78 (AST-aware) | 646 (claimed) | 108 deterministic regex; ~173 more possible with engineering |
| Packages covered | 7 | 12 | 12 (but missing react-component-groups) |
| Genuine incremental value over pf-codemods | -- | -- | ~300 rules (233 CSS vars + ~67 additional package rules) |

---

## 1. What pf-codemods Already Handles Well

pf-codemods provides **106 ESLint rules** for the PF5-to-6 migration, of which **78 provide auto-fixes** and **28 are warning-only**. The tool is maintained by the PatternFly core team, is battle-tested across real migrations, and produces AST-aware transforms that correctly handle:

- **Aliased imports:** `import { Button as Btn }` -- pf-codemods tracks the alias and fixes JSX usage of `<Btn>`.
- **Spread props:** Recognizes when a removed/renamed prop may be in a spread object.
- **Complex JSX restructuring:** 13 rules perform structural transforms (moving children to props, wrapping elements, replacing components).
- **Multi-component coordination:** Rules like `accordionToggleMoveIsExpandedProp` move a prop from a child component to its ancestor.
- **Cleanup utilities:** `data-codemods-cleanup`, `no-duplicate-import-specifiers`, and `no-unused-imports` ensure a clean codebase after migration.

### Package Coverage

| Package | Rules | Auto-fix | Warning |
|---------|-------|----------|---------|
| @patternfly/react-core | 82 | 59 | 23 |
| @patternfly/react-component-groups | 11 | 11 | 0 |
| @patternfly/react-tokens | 2 | 2 | 0 |
| @patternfly/react-charts | 1 | 1 | 0 |
| @patternfly/react-table | 1 | 0 | 1 |
| @patternfly/react-log-viewer | 1 | 0 | 1 |
| @patternfly/react-user-feedback | 1 | 0 | 1 |
| Cross-package utilities | 3 | 3 | 0 |
| Deprecated/next imports | 5 | 5 | 0 |

### Fix Complexity

| Complexity | Count | Examples |
|------------|-------|----------|
| Simple (prop rename/remove, import path) | 71 | `buttonRenameIsActive`, `navRemoveThemeProp`, `chartsImportMoved` |
| Medium (value mapping, conditional logic) | 22 | `bannerReplaceVariantProp`, `drawerReplaceColorVariantLight200`, `toolbarUpdateAlignValues` |
| Complex (JSX restructuring, component replacement) | 13 | `emptyStateHeaderMoveIntoEmptyState`, `mastheadStructureChanges`, `chipReplaceWithLabel`, `textReplaceWithContent`, `kebabToggleReplaceWithMenuToggle` |

**This is the baseline.** Everything below measures FA's value *on top of* what pf-codemods already provides.

---

## 2. The Rule Count Problem: 950 Is Not What It Seems

FA reports 950 detection rules. This number is misleading for three reasons.

### Reason 1: 98 rules are informational noise (Tier 4)

These rules fire on changes that require **no developer action**:

| Sub-category | Count | Example |
|-------------|-------|---------|
| New optional prop added to interface | 77 | `property fixAxisLabelHeight was added to ChartAxisProps` |
| Union type widened (accepts more values) | 18 | `ChartLegendOrientation` type widened |
| Component made readonly | 3 | No runtime effect |
| **Total Tier 4** | **98** | |

A developer who sees "property `fixAxisLabelHeight` was added to `ChartAxisProps`" has nothing to do. Their existing code works. These 98 rules inflate FA's count without providing migration value.

### Reason 2: Granularity difference inflates the count

pf-codemods handles `cardRemoveVariousProps` as **one rule** that removes 5 props. FA represents each prop removal as a separate rule. Similarly, `toolbarRenameChipProps` is one pf-codemods rule covering 11 prop renames; FA has 8 separate rules for the same renames.

### Reason 3: 72% of signature-changed rules are noise

FA has 111 `signature-changed` rules. Of these:

- **80 are Tier 4 noise** (77 "new optional prop added" + 3 "made readonly")
- **31 are actual breaking changes** (25 base-class changes, 4 deprecation replacements, 2 prop substitutions)

The `change-scope=additive` label correctly identifies the noise (83 rules carry it), but the headline count of 111 suggests a much larger breaking surface than exists.

### Adjusted Rule Count by Developer-Impact Tier

| Tier | Description | Count | % of Total |
|------|------------|-------|-----------|
| **Tier 1** | Compilation breaker (code won't build) | **438** | 46.1% |
| **Tier 2** | Runtime/behavioral break (code compiles, behaves differently) | **386** | 40.6% |
| **Tier 3** | Test breakage (code works, tests fail) | **28** | 2.9% |
| **Tier 4** | Informational only (no action needed) | **98** | 10.3% |
| | **Total** | **950** | |

**Actual breaking changes: 852** (Tier 1 + 2 + 3). This is the number that matters.

---

## 3. The "Auto-Fixable" Problem: 646 Is Not What It Seems

FA's fix-guidance.yaml claims 646 "auto-fixable" rules. Here is what that number actually means:

### Honest Breakdown of "646 Auto-Fixable"

| Classification | Count | What It Actually Is |
|----------------|-------|---------------------|
| **Actually deterministic** (search_pattern + replacement, code changes) | **108** | YAML `rename` entries with different from/to values. 30 unique search/replace patterns. |
| **Identity no-ops** (search = replace, nothing changes) | **63** | YAML `rename` entries where the "fix" replaces a string with itself. Generated as carriers for the search_pattern field. |
| **LLM-assisted metadata** (not a fix) | **54** | Provides member_mappings, overlap_ratio, removed_members for an LLM. No code transform. |
| **Structured guidance** (description only, no replacement) | **421** | YAML `update_type` and `update_signature` entries. Have regex to FIND code but no replacement to APPLY. |
| **Total** | **646** | |

**Only 108 of 646 produce actual code changes.** That's 16.7%.

### The Fix Strategy Disconnect

FA has two disconnected fix layers:

1. **fix-guidance.yaml** uses 4 coarse strategies. Only `rename` (171 entries) produces search_pattern + replacement, and 63 of those are identity no-ops.

2. **fix-strategies.json** uses 15 granular strategies. Several (CssVariablePrefix, ImportPathChange, Rename) contain sufficient from/to data for deterministic transforms, but this data is **not surfaced** as replacement strings in the YAML.

If the YAML generator connected to the JSON strategy data, ~173 additional rules could become deterministic -- bringing the total to ~281. This is an engineering gap, not a fundamental limitation.

### Fix Quality: AST-Aware vs. Text Replacement

| Dimension | pf-codemods | FA (deterministic) |
|-----------|-------------|-------------------|
| Fix mechanism | AST transform via ESLint fixer API | Regex search/replace on source text |
| Aliased imports | Handles correctly | Would miss `import { Button as Btn }` |
| Spread props | Detects and warns | Cannot detect props in `{...spread}` |
| Computed values | Handles `variant={condition ? 'a' : 'b'}` | Regex cannot handle conditional expressions |
| JSX structure | Can move children to props, wrap elements | Cannot restructure JSX |
| Scope awareness | Knows which component a prop belongs to | Regex `\bisActive\b` matches ANY `isActive` |
| Reliability | High (tested, scoped to PF imports) | Moderate for CSS/imports; low for JSX props |

### Strategy-by-Strategy Quality Assessment

| Strategy (JSON) | Count | Produces Fix? | Honest Assessment |
|----------------|-------|---------------|-------------------|
| CssVariablePrefix | 235 | **Yes** | Literal CSS variable name replacement. Simple, reliable. Works in .css/.scss/.less files. |
| ImportPathChange | 78 | **Yes** | Import path string replacement. 73 of 78 are `@patternfly/react-charts` -> `@patternfly/react-charts/victory`. Reliable. |
| Rename | 24 | **Yes** | Identifier rename (component names, interface names). 22 have concrete from/to. Reliable for unique identifiers; risky for common names. |
| UpdateDependency | 13 | **Yes** | Package.json version bump. Mechanical. |
| DeprecatedMigration | 2 | **Yes** | Import path swap. Mechanical. |
| PropTypeChange | 182 | **No** | Describes type annotation differences. Informational only. No code transform. |
| LlmAssisted | 162 | **No** | Metadata for LLM consumption. 52 are completely bare (zero context). 8 have member_mappings. Not a fix. |
| PropValueChange | 87 | **Mostly no** | 74 have `from` but lack `to`. Only 4 have populated value mappings. Cannot produce fixes without knowing replacements. |
| RemoveProp | 44 | **No** | Identifies component + prop to remove. Requires AST awareness to safely remove from JSX. |
| CompositionChange | 28 | **No** | Describes JSX nesting requirements. Requires structural rewrite. |
| Manual | 36 | **No** | Explicitly manual. |
| PropToChild / PropToChildren | 6 | **No** | Structural JSX change. |
| ConstantGroup | 2 | **No** | Bare entries with no data. |
| ChildToProp | 1 | **No** | Structural JSX change. |

**Bottom line:** FA has ~352 rules with genuinely deterministic fixes (235 CssVariablePrefix + 78 ImportPathChange + 24 Rename + 13 UpdateDependency + 2 DeprecatedMigration). Of these, ~281 currently have the data connected end-to-end; the remaining ~71 have the data in JSON but not in YAML.

Compare: pf-codemods' 78 auto-fix rules ALL produce concrete AST transforms that modify source code reliably.

---

## 4. Where FA Genuinely Adds Value (Incremental Analysis)

For each FA capability, the skeptic asks: *"Would the developer find this problem anyway without FA?"*

### 4.1 CSS Variable Migration in Stylesheets

**The gap:** pf-codemods handles JS token imports (`tokensUpdate`, `tokensPrefixWithT`) but does NOT handle CSS custom property renames in `.css`, `.scss`, or `.less` files. If a developer has `--pf-v5-global--BorderColor--100` in their stylesheets, pf-codemods won't find it.

**FA's coverage:** 233 `css-variable` rules with deterministic CssVariablePrefix fixes. Each provides a concrete `--pf-v5-*` to `--pf-t--*` mapping.

**Could a sed script do this?** Yes, given the mapping. But FA *provides* the comprehensive mapping (233 variable pairs), which is the hard part. Building the mapping manually from the migration guide would take hours.

**Would the developer find this without FA?** Not easily. CSS variable renames cause visual breakage (wrong colors, spacing, borders) that manifests as "my app looks wrong" without clear error messages. Tracking down which variables changed requires comparing v5 and v6 token lists.

**Verdict: GENUINE VALUE.** This is FA's single strongest incremental contribution. It saves hours of manual CSS variable hunting and provides reliable deterministic fixes. The 233 rules with concrete from/to mappings represent real, applicable migration work.

### 4.2 Package Coverage Beyond react-core

FA covers packages that pf-codemods has minimal or no coverage for:

| Package | FA Rules | FA Tier 1+2 | pf-codemods Rules | Incremental? |
|---------|---------|-------------|-------------------|--------------|
| @patternfly/react-table | 31 | ~25 | 1 (warning only) | **Yes** -- Th/Td prop changes, IColumn interface changes, SortColumn, treeRow. Users of react-table would hit these. |
| @patternfly/react-templates | 16 | ~14 | 0 | **Yes** -- TypeaheadSelect, MultiTypeaheadSelect, CheckboxSelect, SimpleSelect, SimpleDropdown API changes. |
| @patternfly/react-drag-drop | 17 | ~12 | 1 (deprecated imports) | **Partial** -- pf-codemods handles the old DragDrop deprecation. FA covers the new API changes (DragDropContainer variant, DragDropSort children type). |
| @patternfly/react-code-editor | 3 | ~2 | 0 | **Yes** -- CodeEditor signature and prop changes. Small audience. |
| @patternfly/react-charts | 82 | ~70 | 1 (import path) | **Partial** -- pf-codemods' single `chartsImportMoved` rule handles the major breaking change (import path move to `/victory`). FA's 82 rules include many per-property type changes that `tsc` would catch after the import path fix. |

**Would developers find these without FA?** Yes, eventually -- `tsc` catches renamed/removed exports and type changes. But FA identifies them proactively and groups them by concern, saving investigation time. For react-table and react-templates users, FA provides genuine early warning.

**Verdict: GENUINE VALUE** for react-table and react-templates users. **Marginal** for react-charts (pf-codemods handles the big breaking change; `tsc` catches the rest). **Small** for react-code-editor (few users, few rules).

### 4.3 TypeScript Type Changes

**FA's coverage:** 77 `type-changed` rules. Of these:
- 59 are non-additive (actually break TypeScript compilation)
- 18 are additive/widening (Tier 4 noise -- existing code still works)

**What `tsc` tells you:** For the 59 non-additive changes, `tsc` gives you `Type 'X' is not assignable to type 'Y'` at every usage site. You know exactly where the problem is and what types changed.

**What FA adds:** A description of what the type was before and after, and which file/interface changed. This is marginally helpful context when interpreting `tsc` errors, but `tsc` already tells you the before/after types in its error message.

**Specific patterns:**
- 13 rules are `RefObject<X>` to `RefObject<X | null>` (React 19 compatibility). `tsc` catches these immediately.
- 9 rules are `ReactElement` to `ReactElement<any>` (also React 19). `tsc` catches these.
- 37 rules are substantive type changes (callback signatures, prop union types). `tsc` catches these too.

**Verdict: MARGINAL VALUE.** `tsc` is the authoritative tool for type errors. FA's descriptions are convenience context, not incremental discovery. A developer who fixes `tsc` errors has addressed these issues. The 18 additive rules are pure noise.

### 4.4 Conformance / Composition Rules

**FA's coverage:** 110 `conformance` rules + 18 `composition` rules = 128 rules about component structure.

**What they say:** Things like "`<Modal>` must contain ModalBody or ModalFooter or ModalHeader children" or "`NotificationDrawerListItemBody` must be wrapped in `NotificationDrawerListItem`".

**Are these new v6 requirements?** Mostly codified existing best practices. In v5, you *could* use Modal without ModalBody and it would render. In v6, the component may warn or behave unexpectedly, but likely won't crash.

**Would code that violates them break?** Some would cause runtime errors (missing required context providers). Others would produce incorrect rendering. Many would just be suboptimal.

**None have codemods.** All 110 conformance rules and all 18 composition rules have `has-codemod=false` or no codemod. FA detects these issues but provides no fix guidance.

**Verdict: MODERATE VALUE** as a linting/validation layer that catches structural issues before runtime testing. However, without fixes, these are essentially documentation pointers. A developer reading the PF6 migration guide would learn the same composition requirements. Value is highest when used as a CI check to catch non-obvious nesting violations.

### 4.5 Context Dependency Changes

**FA's coverage:** 14 `context-dependency` rules describing components that now require context providers.

**Would code break?** Yes -- missing context providers cause runtime errors, typically cryptic "cannot read property of undefined" deep inside the component tree.

**How would the error manifest?** As a React runtime error with a stack trace pointing into PatternFly internals, not your code. Without knowing about the context change, debugging this is time-consuming.

**Verdict: GENUINE VALUE.** These 14 rules identify problems that are hard to diagnose from runtime errors alone. Small count but high per-rule value. No fixes provided.

### 4.6 Test Impact Rules

**FA's coverage:** 28 `test-impact` rules describing DOM output changes.

**What FA tells you:** Highly specific information: exactly which HTML element was added/removed, which ARIA role/label changed. Examples:
- "Card no longer renders `<input>`"
- "ProgressContainer role 'progressbar' removed"
- "PageToggleButton aria-label 'Side navigation toggle' changed"

**What running tests tells you:** Your test fails with "expected element X not found" or "expected attribute Y to equal Z". You know *what* broke but not *why* it changed.

**Incremental value:** FA saves the investigation step of figuring out *why* a test assertion fails. Instead of debugging, you read FA's rule and know the component's DOM output changed.

**Does pf-codemods cover this?** Partially -- 28 of pf-codemods' warning-only rules alert to markup changes (e.g., `accordionItemWarnUpdateMarkup`, `tabsUpdateMarkup`, `wizardNavItemWarnUpdateMarkup`). These overlap with FA's test-impact rules but are less specific about the exact DOM elements affected.

**Verdict: MODERATE VALUE.** FA's test-impact rules are more detailed than pf-codemods' warnings about the same changes, but running the test suite catches the breakage regardless. Value is in saving debugging time, not in discovering problems.

### 4.7 LLM-Assisted Migration Context for Deprecated Components

**FA's coverage:** 162 `LlmAssisted` strategy entries. Of these:
- 52 are completely bare (`{"strategy": "LlmAssisted"}` with no context)
- 8 have `member_mappings` (old/new prop name lists)
- 8 have `overlap_ratio` (e.g., deprecated SelectProps has 0.318 overlap with new SelectProps)
- 5 have `removed_members` lists
- The rest have partial component/replacement hints

**What pf-codemods does:** pf-codemods' `removeDeprecatedComponents` rule warns about 40+ deprecated components. `chipReplaceWithLabel` provides a complete automated migration from Chip to Label. `textReplaceWithContent` does the same for Text to Content. `kebabToggleReplaceWithMenuToggle` replaces KebabToggle with MenuToggle.

**What FA adds:** For deprecated components that pf-codemods warns about but doesn't auto-fix, FA's member_mappings and overlap_ratio provide structured data that an LLM could use to generate migration code. This is valuable for LLM-powered migration workflows but is NOT auto-fix.

**Honest assessment:** The 52 bare LlmAssisted entries provide zero incremental value. The 8 with member_mappings are genuinely useful structured data. The overlap_ratio is a novel metric that quantifies migration difficulty. But pf-codemods already handles the highest-impact deprecated component migrations (Chip, Text, KebabToggle, Modal, DualListSelector) with complete auto-fixes.

**Verdict: GENUINE VALUE for LLM-powered workflows**, but only the ~20 entries with actual structured data (member_mappings, overlap_ratio, removed_members). The 52 bare entries and many partial entries are negligible. This is metadata, not auto-fix -- valuable as part of a larger system, not as a standalone tool.

---

## 5. Where FA Falls Short

### 5.1 Missing Package: react-component-groups

pf-codemods has **11 rules** for `@patternfly/react-component-groups` with **11 auto-fixes**:

| Rule | Fix |
|------|-----|
| ContentHeader -> PageHeader | Component rename |
| ErrorState prop renames (3 props) | Prop renames |
| InvalidObject -> MissingPage | Component rename |
| InvalidObjectProps -> MissingPageProps | Interface rename |
| InvalidObject prop renames (2 props) | Prop renames |
| NotAuthorized -> UnauthorizedAccess | Component rename |
| NotAuthorized prop renames (2 props) | Prop renames |
| MultiContentCard prop removals | Prop removals |
| UnavailableContent prop renames | Prop renames |
| UnavailableContent body text restructuring | Prop restructuring |
| LogSnippet variant rename | Prop rename + enum swap |

FA has **zero** rules for react-component-groups. This is a significant gap -- all 11 pf-codemods rules are auto-fixes, meaning react-component-groups users get zero automated help from FA.

**Recommendation:** FA should add react-component-groups support.

### 5.2 Missing: Complex Structural Transforms

pf-codemods provides 13 complex JSX transforms that FA cannot replicate:

| Rule | What It Does | FA Coverage |
|------|-------------|-------------|
| `emptyStateHeaderMoveIntoEmptyState` | Collapses EmptyStateHeader into EmptyState props, restructures EmptyStateIcon | FA has composition/conformance rules but NO auto-fix |
| `mastheadStructureChanges` | Moves MastheadToggle inside MastheadMain, wraps MastheadLogo in MastheadBrand | FA has LlmAssisted rule, no fix |
| `chipReplaceWithLabel` | Full Chip->Label migration with prop mapping, badge restructuring | FA has LlmAssisted, no prop mappings |
| `textReplaceWithContent` | Replaces 8 Text* components with Content, adds component props, renames variants | FA catches only enum rename; misses component replacement |
| `kebabToggleReplaceWithMenuToggle` | Replaces KebabToggle with MenuToggle + EllipsisVIcon | FA has component-removal rule, no replacement guidance |
| `buttonMoveIconsIconProp` | Moves icon children to `icon` prop on Button | FA has NO coverage of this change |
| `loginMainFooterLinksItemStructureUpdated` | Restructures to pass children as Button component | No FA equivalent |
| `cardUpdatedClickableMarkup` | Multi-component Card/CardHeader coordination | FA misses the specific prop removals |
| `menuToggleRemoveSplitButtonOptions` | Replaces splitButtonOptions with splitButtonItems | FA has type-changed rule, no structural fix |
| `pageToggleButtonReplaceBarsIconWithIsHamburgerButton` | Removes BarsIcon child, adds isHamburgerButton prop | No FA equivalent |
| `pageNavigationRemoveComponent` | Removes PageNavigation component entirely | No FA equivalent |
| `accordionToggleMoveIsExpandedProp` | Moves prop from child to ancestor | No FA equivalent |
| `tokensUpdate` | Complex token mapping with CSS variable replacement | FA covers CSS variables separately |

These are the **hardest parts of migration** -- exactly the cases where automation saves the most developer time. FA's text-replacement approach fundamentally cannot handle these transforms.

### 5.3 Missing: Behavioral/Markup Warnings

pf-codemods' 28 warning-only rules alert developers to subtle changes that affect markup, behavior, or testing:

- Accordion, Card, Drawer, JumpLinks markup changes
- Page wrapper logic changes
- Pagination, Slider, Tabs, Toolbar markup updates
- Wizard footer and nav item changes
- Notification badge and drawer header changes
- SimpleFileUpload attribute changes

FA's 28 test-impact rules overlap with some of these but are organized differently (by DOM element rather than by component API change). FA does not cover the behavioral/API-level warnings that pf-codemods provides (e.g., `popperUpdateAppendToDefault` warning about changed appendTo default, `helperTextItemWarnScreenReaderTextUpdate` about changed screenReaderText behavior).

### 5.4 Missing: Migration Workflow Utilities

pf-codemods provides 3 utility rules that FA has no equivalent for:

- **`dataCodemodsCleanup`**: Removes `data-codemods` attributes and comments left by codemod runs
- **`noDuplicateImportSpecifiers`**: Removes duplicate import specifiers introduced by other codemods
- **`noUnusedImportsV6`**: Removes unused PatternFly imports left after codemods run

These are small but valuable for producing a clean codebase after migration. They address the reality that automated migration is a multi-pass process.

### 5.5 Fix Quality: Text Replacement vs AST

FA's deterministic fixes use regex text replacement. Here are specific edge cases where this fails:

**Aliased imports:**
```tsx
import { Button as Btn } from '@patternfly/react-core';
// FA's regex \bisActive\b would match ANY isActive, not just Btn's
<Btn isActive={true} />
```

**Spread props:**
```tsx
const props = { isActive: true, variant: 'primary' };
// FA cannot detect that isActive is being spread onto Button
<Button {...props} />
```

**Dynamic values:**
```tsx
// FA's regex for prop value changes cannot handle expressions
<Tabs variant={condition ? 'light300' : 'default'} />
```

**Computed property names:**
```tsx
// FA's regex for CSS variable renames would miss this
const varName = '--pf-v5-global--BorderColor--100';
document.documentElement.style.setProperty(varName, value);
```

**Scoping errors:**
```tsx
// FA's \bisActive\b regex would match non-PF isActive props
<MyCustomComponent isActive={true} />  // Not a PF component
<ExpandableSection isActive={true} />  // IS a PF component
```

pf-codemods handles all of these correctly because it operates on the AST with import tracking.

### 5.6 Noise / Low-Value Rules

FA has 98 Tier 4 rules that fire on non-breaking changes. Key examples:

- 77 "new optional property added" rules (e.g., `property hasNoActionsOffset was added to HintProps`)
- 18 "union type widened" rules (e.g., `ChartLegendOrientation type broadened`)
- 3 "made readonly" rules

**Impact on developer trust:** If ~10% of findings require no action, developers learn to ignore FA output. The `change-scope=additive` label exists and correctly identifies these, but the headline count of 950 creates false urgency.

**Recommendation:** FA should either exclude Tier 4 rules from the default output or clearly label them as informational so they don't dilute actionable findings.

---

## 6. Semantic Differences (Where Tools Disagree)

Cross-referencing overlapping concerns between the two tools reveals several disagreements:

### 6.1 Chip DeprecatedMigration Direction

**pf-codemods:** Correctly moves Chip FROM `@patternfly/react-core` (where it was deprecated) and replaces it with Label imported from `@patternfly/react-core`.

**FA:** `DeprecatedMigration` strategy has `from: @patternfly/react-core/deprecated, to: @patternfly/react-core`, implying Chip moves *back* to core. This appears inverted -- Chip was moved TO deprecated, and should be replaced by Label. The FA strategy name/direction is misleading.

**Which is correct:** pf-codemods. Chip should be replaced with Label, not moved back to core.

### 6.2 Banner variant Prop

**pf-codemods:** If `variant="default"`, removes the prop. For other values, renames `variant` to `color`. Warns that `status` may also be needed.

**FA:** `RemoveProp` strategy -- simply flags `variant` as removed with no replacement guidance.

**Which is correct:** pf-codemods is more accurate. The `variant` prop was *replaced* by `color` and `status`, not simply removed. FA's `RemoveProp` would leave developers without guidance on the replacement.

### 6.3 Text -> Content Component Rename

**pf-codemods:** Comprehensive migration of 8 Text-family components to Content, with prop mapping (`isVisited` -> `isVisitedLink`), component prop additions (`component="p"`, `component="ul"`, etc.), and variant renames.

**FA:** Only covers `TextVariants` -> `ContentVariants` enum rename and a vague `LlmAssisted` flag for TextContent deprecation. Misses the full component rename, prop mappings, and structural changes.

**Which is correct:** pf-codemods. FA's coverage is severely incomplete for this migration.

### 6.4 Button Icon Migration (Children to icon Prop)

**pf-codemods:** Complete structural transform moving icon children into the `icon` prop.

**FA:** No coverage of this change at all. FA's Button rules cover `isActive` removal and new prop additions, but miss the children-to-icon-prop migration entirely.

**Which is correct:** pf-codemods identifies a real breaking change that FA misses.

### 6.5 Card Prop Removals

**pf-codemods:** Removes 5 props (`isSelectableRaised`, `isDisabledRaised`, `hasSelectableInput`, `selectableInputAriaLabel`, `onSelectableInputChange`).

**FA:** No rules for these specific prop removals. FA's Card rules cover different concerns (composition requirements, new props).

**Which is correct:** pf-codemods. These are real prop removals that FA misses.

### 6.6 Page isTertiaryNavGrouped Rename

**pf-codemods:** Renames `isTertiaryNavGrouped` to `isHorizontalSubnavGrouped`, `isTertiaryNavWidthLimited` to `isHorizontalSubnavWidthLimited`, `tertiaryNav` to `horizontalSubnav`.

**FA:** Covers `header` -> `masthead` rename (agrees with pf-codemods), `PageSidebar.theme` removal (agrees), and PageSection type/variant changes (agrees). But does not appear to cover the `isTertiaryNav*` renames.

**Which is correct:** pf-codemods catches prop renames that FA misses.

### Areas of Agreement

The tools agree on:
- **Drawer colorVariant:** Both correctly identify `light-200` -> `secondary`. FA additionally notes the enum rename (`DrawerColorVariant` -> `DrawerContentColorVariant`).
- **Page header -> masthead:** Both rename the prop identically.
- **Toolbar chip -> label:** Both identify the same set of prop renames with matching from/to values.
- **Charts import path:** Both move from `@patternfly/react-charts` to `@patternfly/react-charts/victory`.
- **Masthead restructuring:** Both recognize the structural change (FA delegates to LLM; pf-codemods auto-fixes).

### Summary

| Concern | Agreement? | Better Tool |
|---------|-----------|-------------|
| Chip -> Label migration | **Disagree** -- FA's migration direction appears inverted | pf-codemods |
| Banner variant replacement | **Disagree** -- FA says remove; PC says rename to color | pf-codemods |
| Text -> Content | **FA gap** -- missing most of the migration | pf-codemods |
| Button icon prop | **FA gap** -- no coverage | pf-codemods |
| Card prop removals | **FA gap** -- no coverage | pf-codemods |
| Page tertiaryNav renames | **FA gap** -- not covered | pf-codemods |
| Drawer colorVariant | **Agree** | Both (FA has broader context) |
| Page header -> masthead | **Agree** | Both |
| Toolbar chip -> label | **Agree** | Both |
| Charts import path | **Agree** | Both |
| EmptyState restructuring | **Agree on direction** | pf-codemods (has auto-fix) |

---

## 7. Recommendations for Making FA Maximally Useful

### 7.1 High-Priority Gaps to Close

1. **Add react-component-groups support.** 11 pf-codemods rules with auto-fixes cover this package. FA has zero. This is a straightforward gap to close.

2. **Connect JSON strategy data to YAML output.** ~173 rules have deterministic from/to data in fix-strategies.json that is not surfaced as replacement strings in fix-guidance.yaml. Connecting these would nearly triple the deterministic fix count (108 -> ~281).

3. **Add developer-impact tier labels.** Add a `tier` or `impact` label (T1/T2/T3/T4) to every rule so consumers can filter noise. The `change-scope=additive` label partially does this for signature-changed rules but doesn't extend to all rule types.

4. **Fix the Chip DeprecatedMigration direction.** The current from/to appears inverted. This will confuse any consumer that processes the fix guidance.

5. **Populate PropValueChange `to` fields.** 74 of 87 PropValueChange entries lack a `to` value. Without the replacement value, these cannot produce fixes.

### 7.2 What FA Should Stop Doing (or De-Prioritize)

1. **Remove or down-label Tier 4 rules from default output.** 98 rules (10.3%) require no developer action. They inflate the rule count and dilute trust. Offer them as a separate "informational" report.

2. **Eliminate identity no-ops.** 63 YAML rename entries where from=to produce no code changes. These should be removed or restructured.

3. **Don't count LlmAssisted as "auto-fixable."** 54 rules in the "auto-fixable" count delegate to an LLM. This is metadata, not auto-fix. Report them separately.

4. **Reconsider per-property granularity for type changes that `tsc` catches.** 59 non-additive type-changed rules mostly duplicate what `tsc` tells you. Consider grouping them by component or flagging them as "tsc will also catch this."

### 7.3 What FA Should Emphasize

1. **CSS variable migration is the crown jewel.** 233 rules with deterministic fixes for a problem no other tool solves. Lead with this capability.

2. **Package breadth matters for teams using react-table/react-templates.** Position this as "pf-codemods covers react-core deeply; FA covers the ecosystem."

3. **Conformance checking is unique.** 110 rules about component composition requirements are a genuine linting capability. Position as "structural validation" rather than "breaking change detection."

4. **LLM context is a platform play.** The member_mappings, overlap_ratio, and removed_members data is genuinely useful for LLM-powered migration tools. Market this as "migration intelligence for AI-assisted development," not "auto-fix."

### 7.4 Integration Recommendations

**Recommended migration workflow:**

1. **Run pf-codemods first.** It handles the highest-impact changes with reliable AST-aware auto-fixes. This covers react-core component props, renames, structural changes, and deprecated component migrations.

2. **Run FA second for CSS variable migration.** After pf-codemods handles JS/JSX, use FA's CssVariablePrefix fixes for stylesheet migration. This is FA's unique strength.

3. **Run FA detection for additional packages.** If the project uses react-table, react-templates, react-drag-drop, or react-code-editor, FA's detection rules identify breaking changes that pf-codemods doesn't cover.

4. **Run `tsc` third.** TypeScript catches type errors, missing exports, and renamed interfaces. FA's type-changed rules are largely redundant with `tsc`.

5. **Run FA conformance rules as a lint pass.** After migration, use FA's conformance rules to verify component composition is correct.

6. **Run test suite last.** Catches DOM/behavioral changes. FA's test-impact rules can help debug failures.

**Can FA's detection feed into pf-codemods' fix engine?** In principle, yes -- FA's detection patterns (component + prop + change type) could be converted into ESLint rule specifications. However, the two tools use fundamentally different detection mechanisms (YAML-driven pattern matching vs. AST traversal), making integration non-trivial. A more practical approach: use FA's rule database to identify gaps in pf-codemods coverage, then write new pf-codemods rules for the highest-impact gaps.

---

## Appendix A: Complete pf-codemods Rule Catalog

### Auto-Fix Rules (78)

#### Simple Complexity (48 auto-fix)

| Rule | Component(s) | Package | Description |
|------|-------------|---------|-------------|
| accordionContentRemoveIsHiddenProp | AccordionContent | react-core | Remove `isHidden` prop |
| avatarReplaceBorderForIsBordered | Avatar | react-core | `border` -> `isBordered` |
| buttonRenameIsActive | Button | react-core | `isActive` -> `isClicked` |
| cardRemoveVariousProps | Card | react-core | Remove 5 selectable-related props |
| chartsImportMoved | All Chart components | react-charts | Import path -> `/victory` |
| checkboxRadioReplaceIsLabelBeforeButton | Checkbox, Radio | react-core | `isLabelBeforeButton` -> `labelPosition="start"` |
| chipDeprecated | Chip, ChipGroup | react-core | Move to deprecated import |
| componentGroupsContentHeaderRenameToPageHeader | ContentHeader | react-component-groups | Rename to PageHeader |
| componentGroupsErrorStateRenameProps | ErrorState | react-component-groups | Rename 3 props |
| componentGroupsInvalidObjectPropsRenameToMissingPageProps | InvalidObjectProps | react-component-groups | Interface rename |
| componentGroupsInvalidObjectRenameProps | InvalidObject | react-component-groups | Rename 2 props |
| componentGroupsInvalidObjectRenameToMissingPage | InvalidObject | react-component-groups | Component rename |
| componentGroupsMultiContentCardRemoveProps | MultiContentCard | react-component-groups | Remove 2 props |
| componentGroupsNotAuthorizedRenameProps | NotAuthorized | react-component-groups | Rename 2 props |
| componentGroupsNotAuthorizedRenameToUnauthorizedAccess | NotAuthorized | react-component-groups | Component rename |
| componentGroupsUnavailableContentRenameProps | UnavailableContent | react-component-groups | Rename 1 prop |
| dataCodemodsCleanup | All PF components | multiple | Remove data-codemods attributes |
| dataListActionRemoveIsPlainButtonActionProp | DataListAction | react-core | Remove `isPlainButtonAction` |
| dragDropDeprecated | DragDrop components | react-core | Move to deprecated import |
| drawerHeadRemoveHasNoPaddingProp | DrawerHead | react-core | Remove `hasNoPadding` |
| dualListSelectorDeprecated | DualListSelector components | react-core | Move to deprecated import |
| dualListSelectorNextPromoted | DualListSelector components | react-core | Promote from /next |
| expandableSectionRemoveIsActiveProp | ExpandableSection | react-core | Remove `isActive` |
| formFiledGroupHeaderTitleTextObjectRenamed | FormFiledGroup... | react-core | Fix typo in interface name |
| formGroupRenameLabelIcon | FormGroup | react-core | `labelIcon` -> `labelHelp` |
| helperTextItemRemoveProps | HelperTextItem | react-core | Remove `hasIcon`, `isDynamic` |
| mastheadNameChanges | MastheadBrand | react-core | Rename to MastheadLogo |
| mastheadRemoveBackgroundColor | Masthead | react-core | Remove `backgroundColor` |
| modalDeprecated | Modal components | react-core | Move to deprecated import |
| modalNextPromoted | Modal components | react-core | Promote from /next |
| navItemRemoveHasNavLinkWrapperProp | NavItem | react-core | Remove `hasNavLinkWrapper` |
| navRemoveThemeProp | Nav | react-core | Remove `theme` |
| noDuplicateImportSpecifiers | All PF imports | react-core | Remove duplicate imports |
| noUnusedImportsV6 | All PF imports | multiple | Remove unused imports |
| pageHeaderToolsItemRemoveIsSelectedProp | PageHeaderToolsItem | react-core/deprecated | Remove `isSelected` |
| pageRenameHeader | Page | react-core | `header` -> `masthead` |
| pageRenameIsTertiaryNavGrouped | Page | react-core | `isTertiaryNavGrouped` -> `isHorizontalSubnavGrouped` |
| pageRenameIsTertiaryNavWidthLimited | Page | react-core | `isTertiaryNavWidthLimited` -> `isHorizontalSubnavWidthLimited` |
| pageRenameTertiaryNav | Page | react-core | `tertiaryNav` -> `horizontalSubnav` |
| pageSidebarRemoveThemeProp | PageSidebar | react-core | Remove `theme` |
| switchRemoveLabelOff | Switch | react-core | Remove `labelOff` |
| tabsRenamedIsSecondaryProp | Tabs | react-core | `isSecondary` -> `isSubtab` |
| tileDeprecated | Tile | react-core | Move to deprecated import |
| toolbarChipGroupContentRenameComponent | ToolbarChipGroupContent | react-core | Rename to ToolbarLabelGroupContent |
| toolbarRemoveProps | Toolbar components | react-core | Remove 4 props |
| toolbarRenameChipProps | Toolbar components | react-core | Rename 11 chip->label props |
| wizardStepUpdatedBodyTyping | WizardStep | react-core | Remove null body prop |
| enableAnimations | Multiple | react-core, react-table | Add `hasAnimations` prop |

#### Medium Complexity (17 auto-fix)

| Rule | Component(s) | Package | Description |
|------|-------------|---------|-------------|
| bannerReplaceVariantProp | Banner | react-core | `variant` -> `color`/`status` with value mapping |
| colorPropsReplacedColors | Banner, Label | react-core | Color value mapping (cyan->teal, gold->yellow) |
| componentGroups-logSnippetRenameLeftBorderVariant | LogSnippet | react-component-groups | Prop rename + enum swap |
| componentGroupsUnavailableContentBodyTextPropsUpdate | UnavailableContent | react-component-groups | Prop restructuring |
| drawerContentReplaceNoBackgroundColorVariant | DrawerContent | react-core | Value mapping + enum handling |
| drawerReplaceColorVariantLight200 | Drawer components | react-core | `light-200` -> `secondary` |
| emptyStateNonExportedComponents | EmptyStateHeader/Icon | react-core | Remove non-exported imports |
| labelRemoveIsOverflowLabel | Label | react-core | `isOverflowLabel` -> `variant="overflow"` |
| navRemoveTertiaryVariant | Nav | react-core | `tertiary` -> `horizontal-subnav` |
| pageBreadcrumbAndSectionWarnUpdatedWrapperLogic | PageBreadcrumb, PageSection | react-core | Add hasBodyWrapper prop |
| pageSectionRemoveNavType | PageSection | react-core | Remove nav type value |
| pageSectionUpdateVariantValues | PageSection | react-core | Validate/remove variant values |
| tabsReplaceVariantLight300 | Tabs | react-core | `light300` -> `secondary` |
| tokensPrefixWithT | Token variables | react-tokens | Add t_ prefix to token imports |
| toolbarGroupUpdatedIconButtonGroupVariant | ToolbarGroup | react-core | Value mapping (button-group -> action-group) |
| toolbarItemVariantPropUpdates | ToolbarItem | react-core | chip-group -> label-group, remove others |
| toolbarRenameInterfaces | Toolbar interfaces | react-core | Interface renames across type references |
| toolbarReplacedSpacerSpaceItems | Toolbar components | react-core | spacer -> gap with value transform |
| toolbarUpdateAlignValues | Toolbar components | react-core | alignLeft -> alignStart, alignRight -> alignEnd |

#### Complex (13 auto-fix)

| Rule | Component(s) | Package | Description |
|------|-------------|---------|-------------|
| accordionToggleMoveIsExpandedProp | AccordionToggle, AccordionItem | react-core | Move prop from child to ancestor |
| buttonMoveIconsIconProp | Button, Icon | react-core | Move icon children to `icon` prop |
| cardUpdatedClickableMarkup | Card, CardHeader | react-core | Multi-component object prop restructuring |
| chipReplaceWithLabel | Chip -> Label | react-core | Full component replacement with prop mapping |
| emptyStateHeaderMoveIntoEmptyState | EmptyState family | react-core | Collapse header into parent props |
| kebabToggleReplaceWithMenuToggle | KebabToggle -> MenuToggle | react-core | Component replacement + icon import |
| loginMainFooterLinksItemStructureUpdated | LoginMainFooterLinksItem | react-core | Wrap in Button, restructure props |
| mastheadStructureChanges | Masthead family | react-core | Multi-component JSX restructuring |
| menuToggleRemoveSplitButtonOptions | MenuToggle | react-core | Prop restructuring + interface removal |
| pageNavigationRemoveComponent | PageNavigation | react-core | Remove component entirely |
| pageToggleButtonReplaceBarsIconWithIsHamburgerButton | PageToggleButton | react-core | Child removal + prop addition |
| textReplaceWithContent | Text family -> Content | react-core | 8-component replacement + prop mapping |
| tokensUpdate | Token variables | react-tokens | Token mapping + CSS var replacement |

### Warning-Only Rules (28)

| Rule | Component(s) | Change Description |
|------|-------------|-------------------|
| accordionItemWarnUpdateMarkup | AccordionItem | Now renders div wrapper |
| buttonSupportFavoriteVariant | Button | Use isFavorite/isFavorited for favorites |
| drawerHeadWarnUpdatedMarkup | DrawerHead | DrawerPanelBody no longer rendered internally |
| helperTextItemWarnScreenReaderTextUpdate | HelperTextItem | screenReaderText behavior changed |
| jumpLinksItemHrefRequired | JumpLinksItem | href now required |
| jumpLinksItemWarnMarkupChange | JumpLinksItem | Uses Button internally |
| loginMainHeaderWarnUpdatedMarkup | LoginMainHeader | Uses div instead of header element |
| logViewerMovedStyles | LogViewer | Stylesheet moved |
| menuItemActionWarnUpdateMarkup | MenuItemAction | Uses Button internally |
| menuToggleWarnIconOnlyToggle | MenuToggle | Icons should use icon prop |
| notificationBadgeWarnMarkupChange | NotificationBadge | Uses stateful button |
| notificationDrawerHeaderWarnUpdateMarkup | NotificationDrawerHeader | Renders native h1 |
| pageSectionWarnVariantClassesApplied | PageSection | Variant classes only when type=default |
| pageWarnUpdatedMarkup | Page | PageBody wraps contents |
| paginationWarnMarkupChanged | Pagination | Wrapper around toggle |
| popperUpdateAppendToDefault | Dropdown, Select, Popper | appendTo default changed |
| removeDeprecatedComponents | 40+ deprecated components | Multiple components removed |
| simpleFileUploadWarnChanges | SimpleFileUpload | Attribute changes |
| sliderStepWarnUpdateMarkup | Slider | CSS variable name changed |
| tabsUpdateMarkup | Tabs | Scroll button markup updated |
| thTdWarnUpdateMarkup | Th, Td | CSS variable names changed |
| toolbarLabelGroupContentUpdatedMarkup | ToolbarLabelGroupContent | Markup changed |
| treeViewWarnSelectableStylingModifierRemoved | TreeView | pf-m-selectable removed |
| userFeedbackWarnChanges | FeedbackModal | May need manual CSS import |
| wizardFooterWarnUpdateMarkup | Wizard | Footer uses ActionList |
| wizardNavItemWarnUpdateMarkup | WizardNavItem | Wrapper element added |

---

## Appendix B: FA Rules by Developer-Impact Tier

### Tier 1 -- Compilation Breakers (438 rules)

| Change-Type | Count | Examples |
|------------|-------|---------|
| renamed | 100 | Interfaces/types moved between packages (e.g., `ChartProps` from `@patternfly/react-charts` to `/victory`) |
| removed | 76 | Props, exports, enum members deleted (e.g., `ExpandableSection.isActive`, `Card.isSelectableRaised`) |
| prop-value-removed | 74 | String literal values removed from union types (e.g., `PageSectionVariants.darker`, `DrawerColorVariant.light200`) |
| type-changed (non-additive) | 59 | Type incompatibilities (e.g., `RefObject<HTMLLIElement>` -> `RefObject<HTMLLIElement | null>`) |
| component-removal | 50 | Entire deprecated components removed (e.g., `ApplicationLauncher`, `ContextSelector`, old `Select`) |
| signature-changed (breaking) | 31 | Base class changes, deprecation replacements (e.g., Chip -> Label) |
| prop-value-change | 13 | Enum values replaced (e.g., `light-200` -> `secondary`) |
| dependency-update | 13 | Package version requirements changed |
| required-prop-added | 12 | New required props (e.g., `JumpLinksItem.href`) |
| prop-to-child | 6 | Prop moved to child component (e.g., Modal.title -> ModalHeader) |
| deprecated-migration | 2 | Import path changes for deprecated components |
| manifest | 1 | Node.js engine constraint (>=20.15.1 -> >=22.17.1) |
| child-to-prop | 1 | Child moved to prop (EmptyStateIcon -> EmptyState.icon) |

### Tier 2 -- Runtime/Behavioral Breaks (386 rules)

| Change-Type | Count | Examples |
|------------|-------|---------|
| css-variable | 233 | CSS custom property renames (`--pf-v5-global--BorderColor--100` -> `--pf-t--global--border--color--default`) |
| conformance | 110 | Component composition requirements (`<Modal>` must contain ModalBody/ModalFooter/ModalHeader) |
| composition | 18 | Components removed from families (e.g., `MastheadToggle` no longer standalone) |
| context-dependency | 14 | Components now require context providers |
| css-removal | 8 | CSS custom properties removed entirely |
| prop-attribute-override | 2 | Props that override HTML attributes |
| css-class | 1 | CSS class renamed |

### Tier 3 -- Test Breakage (28 rules)

All 28 are `test-impact` rules describing DOM output changes:
- Card no longer renders `<input>`
- ProgressContainer role 'progressbar' removed
- PageToggleButton aria-label changed
- MenuItemAction no longer renders button wrapper
- NotificationBadge no longer renders span
- (23 more similar DOM/ARIA changes)

### Tier 4 -- Informational Only (98 rules)

| Sub-category | Count | Examples |
|-------------|-------|---------|
| New optional prop added | 77 | `fixAxisLabelHeight` added to `ChartAxisProps`, `hasNoActionsOffset` added to `HintProps` |
| Union type widened | 18 | `ChartLegendOrientation` type broadened to accept more values |
| Made readonly | 3 | Component constants made readonly (no runtime effect) |

---

## Appendix C: FA Fix Strategy Quality Assessment

| Strategy | Count | Mechanism | Reliability | Edge Cases | pf-codemods Equivalent |
|----------|-------|-----------|-------------|------------|----------------------|
| CssVariablePrefix | 235 | CSS variable name replacement | **High** -- literal string match in CSS files | Dynamic variable names in JS; CSS-in-JS template literals | `tokensUpdate` handles JS token imports; no CSS file equivalent |
| ImportPathChange | 78 | Import path string replacement | **High** -- path strings are unique | Aliased star imports still work; dynamic imports need separate handling | `chartsImportMoved` (AST-aware, more reliable) |
| PropTypeChange | 182 | None (informational) | N/A | N/A | N/A -- `tsc` catches type errors |
| LlmAssisted | 162 | None (metadata for LLM) | N/A -- depends on LLM quality | LLM may hallucinate prop mappings | pf-codemods auto-fixes for Chip, Text, KebabToggle, Modal |
| PropValueChange | 87 | Incomplete (74 lack `to` value) | **Low** -- most cannot produce fixes | Missing replacement values | pf-codemods handles value mapping with full before/after |
| ImportPathChange | 78 | Import path string replacement | **High** | See above | See above |
| RemoveProp | 44 | Identifies prop to remove (no regex fix) | **Low** for automation | Requires AST to safely remove JSX prop | pf-codemods removes props via AST fixer |
| Manual | 36 | None (explicitly manual) | N/A | N/A | pf-codemods warning rules cover some |
| CompositionChange | 28 | None (describes nesting) | N/A | N/A | pf-codemods has structural transforms for some |
| Rename | 24 | Identifier string replacement | **Medium** -- reliable for unique names, risky for common ones | `Nav` would match `NavItem`, `Navigator`, etc. | pf-codemods renames via AST with import tracking |
| UpdateDependency | 13 | Package.json version update | **High** -- mechanical | None | No pf-codemods equivalent |
| PropToChild | 4 | None (describes structural change) | N/A | N/A | No direct equivalent |
| PropToChildren | 2 | None (describes structural change) | N/A | N/A | No direct equivalent |
| DeprecatedMigration | 2 | Import path swap | **Medium** -- direction appears inverted for Chip | See semantic differences section | pf-codemods handles correctly |
| ConstantGroup | 2 | None (bare entries) | N/A | N/A | N/A |
| ChildToProp | 1 | None (describes structural change) | N/A | N/A | `emptyStateHeaderMoveIntoEmptyState` auto-fixes this |

---

## Appendix D: Incremental Value Ledger

Every FA-only concern that passes the "would the developer find this without FA?" test:

### Definite Incremental Value (developer would NOT find easily)

| Category | Count | Why It's Incremental |
|----------|-------|---------------------|
| CSS variable renames in stylesheets | 233 | No other tool scans CSS files for PF variable renames. Causes visual breakage without clear error messages. |
| react-table breaking changes (FA-only) | ~25 | pf-codemods has 1 warning rule for react-table. FA covers prop type changes, interface changes, new required props. |
| react-templates breaking changes | 16 | Zero pf-codemods coverage. TypeaheadSelect, MultiTypeaheadSelect, CheckboxSelect, SimpleSelect, SimpleDropdown API changes. |
| react-drag-drop new API changes (FA-only) | ~10 | pf-codemods handles old DragDrop deprecation only. FA covers new DragDropContainer/DragDropSort API changes. |
| react-code-editor breaking changes | 3 | Zero pf-codemods coverage. CodeEditor signature and prop changes. |
| Context-dependency changes | 14 | Hard to diagnose from runtime errors. Cryptic failures. |
| CSS removal (properties deleted entirely) | 8 | No error messages; causes silent style degradation. |
| CSS class rename | 1 | Similar to CSS removal -- silent breakage. |
| **Subtotal** | **~310** | |

### Moderate Incremental Value (saves time but discoverable otherwise)

| Category | Count | Why It's Moderate |
|----------|-------|------------------|
| Conformance/composition rules | 128 | Catches structural issues proactively but many would surface at runtime. No fixes. |
| Test-impact details | 28 | Tests catch the breakage; FA explains *why*. Saves debugging time. |
| LLM-assisted metadata (with actual data) | ~20 | member_mappings and overlap_ratio are useful for LLM-powered migration. Not useful alone. |
| **Subtotal** | **~176** | |

### No Incremental Value (caught by other tools)

| Category | Count | Why |
|----------|-------|-----|
| Type-changed (non-additive) | 59 | `tsc` catches all of these with before/after in error messages |
| Tier 4 noise (new optional props, widenings) | 98 | No developer action needed |
| Overlapping with pf-codemods | ~95 | pf-codemods already covers these, often with auto-fixes |
| Bare LlmAssisted entries (no data) | 52 | Literally no useful information |
| Identity no-op fixes | 63 | Produce no code changes |
| **Subtotal** | **~367** | |

### Summary

- **FA's genuine incremental value: ~310 rules** across CSS variables, additional packages, context-dependency, and CSS removal/class changes.
- **FA's moderate value: ~176 rules** that save time but are discoverable through other means.
- **FA's zero incremental value: ~367 rules** that are noise, duplicative, or caught by `tsc`/pf-codemods.
- **Remaining ~97 rules** fall in gray areas (some renamed/removed rules in overlapping packages where the degree of pf-codemods coverage varies).

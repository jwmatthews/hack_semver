# PF6 Migration Automation — Effectiveness Scorecard

## 1. Coverage Statistics

**Total gaps found in PR/6 (excluding noise):** 12 files with meaningful code changes

| Classification | Count | Percentage |
|----------------|-------|------------|
| BREAKAGE       | 1     | 8%         |
| INCOMPLETE     | 5     | 42%        |
| MISS           | 6     | 50%        |

**Note:** Two PR/6 files (notFound.tsx, showAggregateReportModal.tsx) were excluded as formatting-only changes — the automation handled their migration correctly.

## 2. Risk Summary

**Changes the automation BROKE:** 1 file — `viewLayoutToolbar.tsx`. The automation renamed the `spacer` prop to `gap` (correct) but left the old values `spacerNone`/`spacerMd` (should be `gapNone`/`gapMd`), and left `alignRight` (should be `alignEnd`). This directly caused 3 TS2322 build errors.

**Changes the automation MISSED entirely:** 6 files. These are files the automation never touched, primarily modal files requiring `title`→`ModalHeader` and `actions`→`ModalFooter` restructuring, plus one test file requiring PF6 Popper interaction fixes.

**Changes the automation left INCOMPLETE:** 5 files. The automation did partial work (PageSection variant removal, ToolbarFilter prop renames) but left critical gaps (EmptyState consolidation, Modal restructuring, deprecated Select rewrite).

The distinction matters: the 1 BREAKAGE file was _worse_ after automation than before. The 6 MISS files got no help but also no harm. The 5 INCOMPLETE files got some useful work but still needed substantial manual intervention.

## 3. Quality Sweep Results

**PR/5-only files (automation changes not corrected by PR/6):** 17 code files

| Assessment       | Count | Files |
|------------------|-------|-------|
| MATCHES REFERENCE | 8    | aboutModal.tsx, ExtendedButton.test.tsx, usePaginationPropHelpers.ts, SearchFilterControl.tsx, ToolbarBulkSelector.tsx, FilterToolbar.tsx, addSourceModal.test.tsx, showSourceConnectionsModal.css |
| NON-IDIOMATIC    | 3     | errorMessage.tsx, NoDataEmptyState.tsx, StateError.tsx |
| DIVERGENT        | 6     | typeaheadCheckboxes.tsx, contextIcon.tsx, viewLayout.tsx, viewLayoutToolbar.css, useTableWithBatteries.tsx, select-overrides.css |

**8 of 17** automation-only files align with the developer reference. **3 files** use a non-idiomatic EmptyState pattern (keeping `<Title>` as a child instead of using the `titleText` prop). **6 files** diverge meaningfully from PR/664's approach — most notably `typeaheadCheckboxes.tsx` where the automation made an incorrect `TextInputGroupUtilities` wrapping that PR/664 did not make, and `contextIcon.tsx` where PR/5 used token renames vs. PR/664's more idiomatic `<Icon status>` wrapper.

## 4. Pattern-Level Effectiveness

| Pattern | Instances | Automation Handled | Score | Notes |
|---------|-----------|-------------------|-------|-------|
| CSS token/class renames (`pf-v5`→`pf-v6`) | 6 | 6 | 100% | Mechanical find-replace — automation's strength |
| PageSection `variant="light"` removal | 3 | 3 | 100% | Simple prop removal |
| ToolbarFilter `chips`→`labels` | 3 | 3 | 100% | Simple prop rename |
| `TextContent`/`TextList`→`Content` | 1 | 1 | 100% | Component rename |
| `splitButtonOptions`→`splitButtonItems` | 1 | 1 | 100% | Prop restructure |
| `header`→`masthead`, theme removal | 1 | 1 | 100% | Prop rename + removal |
| `alignRight`→`alignEnd` | 2 | 1 | 50% | Handled in pagination but not toolbar |
| EmptyState consolidation (header/icon→props) | 8 | 4 | 50% | Simple standalone files ✓, complex views ✗ |
| Modal `title`→`ModalHeader` | 9 | 1 | 11% | Only handled showAggregateReportModal |
| Modal `actions`→`ModalFooter` | 6 | 1 | 17% | Only handled showAggregateReportModal |
| Deprecated Select→PF6 Select | 2 | 0 | 0% | Complete API rewrite needed |
| DropdownList wrapper | 1 | 0 | 0% | Structural composition addition |
| `data-ouia-component-id`→`ouiaId` | 1 | 0 | 0% | Behavioral/runtime pattern |
| PF6 Popper test interaction fixes | 1 | 0 | 0% | Test environment change |

## 5. Overall Verdict

The automation is effective at **mechanical, pattern-matchable transformations**: CSS token renames, simple prop renames, prop removals, and component name swaps. These account for roughly 16 of the ~32 distinct change instances across the codebase, and the automation handled all 16 correctly — saving genuine engineering time.

Where the automation fails is **compositional restructuring** — changes that require moving JSX children, wrapping elements in new components, or rewriting component APIs. Modal migration (title→ModalHeader, actions→ModalFooter) was the largest category of failure, affecting 8+ files, and the automation handled only 1 of them. The deprecated Select→PF6 Select rewrite (2 files) was completely beyond the automation's capability.

**Net assessment:** The automation saved approximately 30-40% of the total migration effort by handling the mechanical changes. But 25 build errors remained after the automation ran (all in files it either missed or partially handled), and the 1 BREAKAGE file demonstrates that partial fixes can be actively counterproductive — an engineer must now diagnose whether the automation's changes are correct before building on them. The cleanup cost did not _offset_ the gains, but it significantly reduced them. The tool is most valuable when paired with a human who treats its output as a starting point, not a finished migration.

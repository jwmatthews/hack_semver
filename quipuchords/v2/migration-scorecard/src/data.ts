// migration-scorecard/src/data.ts
import { colors } from "./styles";

export type PatternData = {
  name: string;
  instances: number;
  handled: number;
  score: number;
  color: string;
};

export const MECHANICAL_PATTERNS: PatternData[] = [
  { name: "CSS token/class renames (pf-v5→pf-v6)", instances: 6, handled: 6, score: 100, color: colors.green },
  { name: "PageSection variant=\"light\" removal", instances: 3, handled: 3, score: 100, color: colors.green },
  { name: "ToolbarFilter chips→labels", instances: 3, handled: 3, score: 100, color: colors.green },
  { name: "TextContent/TextList→Content", instances: 1, handled: 1, score: 100, color: colors.green },
  { name: "splitButtonOptions→splitButtonItems", instances: 1, handled: 1, score: 100, color: colors.green },
  { name: "header→masthead, theme removal", instances: 1, handled: 1, score: 100, color: colors.green },
];

export const STRUGGLING_PATTERNS: PatternData[] = [
  { name: "alignRight→alignEnd", instances: 2, handled: 1, score: 50, color: colors.amber },
  { name: "EmptyState consolidation", instances: 8, handled: 4, score: 50, color: colors.amber },
  { name: "Modal title→ModalHeader", instances: 9, handled: 1, score: 11, color: colors.red },
  { name: "Modal actions→ModalFooter", instances: 6, handled: 1, score: 17, color: colors.red },
  { name: "Deprecated Select→PF6 Select", instances: 2, handled: 0, score: 0, color: colors.red },
  { name: "DropdownList wrapper", instances: 1, handled: 0, score: 0, color: colors.red },
  { name: "data-ouia-component-id→ouiaId", instances: 1, handled: 0, score: 0, color: colors.red },
  { name: "PF6 Popper test fixes", instances: 1, handled: 0, score: 0, color: colors.red },
];

export const ALL_PATTERNS: PatternData[] = [
  ...MECHANICAL_PATTERNS,
  ...STRUGGLING_PATTERNS,
];

export const CLASSIFICATIONS = {
  breakage: { count: 1, percent: 8, label: "BREAKAGE", color: colors.red, description: "worse after automation" },
  incomplete: { count: 5, percent: 42, label: "INCOMPLETE", color: colors.amber, description: "partial work, needs intervention" },
  miss: { count: 6, percent: 50, label: "MISS", color: colors.red, description: "never touched" },
} as const;

export const SCOPE_PATTERNS = [
  "CSS token renames",
  "Prop renames",
  "Component renames",
  "Prop removals",
  "Modal restructuring",
  "EmptyState consolidation",
  "Select rewrite",
  "Dropdown composition",
  "OUIA prop migration",
  "Test interaction fixes",
  "Toolbar value updates",
  "Masthead restructuring",
  "Import path updates",
  "Token → semantic",
];

export const MISS_FILES = [
  "addCredentialModal.tsx",
  "addSourceModal.tsx",
  "addSourcesScanModal.tsx",
  "showSourceConnectionsModal.tsx",
  "showScansModal.tsx",
  "viewLayoutToolbarInteractions.test.tsx",
];

export const BREAKAGE_ADDITIONAL_ISSUES = [
  { label: "DropdownList wrapper missing", detail: "silent render failure" },
  { label: "data-ouia-component-id → ouiaId", detail: "test selectors broken" },
  { label: "Unused imports added", detail: "lint failures" },
];

export type PunchListItem = {
  id: number;
  pattern: string;
  files: number;
  effort: "trivial" | "moderate" | "significant";
  estimateMin: number;
};

export const PUNCH_LIST: PunchListItem[] = [
  { id: 1, pattern: "Modal title→ModalHeader", files: 8, effort: "trivial", estimateMin: 40 },
  { id: 2, pattern: "Modal actions→ModalFooter", files: 5, effort: "trivial", estimateMin: 50 },
  { id: 3, pattern: "EmptyState consolidation", files: 7, effort: "trivial", estimateMin: 35 },
  { id: 4, pattern: "Deprecated Select rewrite", files: 2, effort: "significant", estimateMin: 90 },
  { id: 5, pattern: "ToolbarGroup prop values", files: 1, effort: "trivial", estimateMin: 5 },
  { id: 6, pattern: "DropdownList wrapper", files: 1, effort: "trivial", estimateMin: 5 },
  { id: 7, pattern: "MenuToggle ouiaId", files: 1, effort: "trivial", estimateMin: 5 },
  { id: 8, pattern: "Unused import cleanup", files: 1, effort: "trivial", estimateMin: 2 },
  { id: 9, pattern: "Test Popper interaction", files: 1, effort: "moderate", estimateMin: 30 },
  { id: 10, pattern: "Non-idiomatic EmptyState", files: 3, effort: "trivial", estimateMin: 15 },
  { id: 11, pattern: "Divergent typeahead", files: 1, effort: "moderate", estimateMin: 20 },
];

export const CODE_BREAKAGE_BEFORE = [
  "<ToolbarGroup",
  "  align={{ default: 'alignRight' }}",
  "  gap={{ default: 'spacerNone', md: 'spacerMd' }}",
  ">",
];

export const CODE_BREAKAGE_AFTER = [
  "<ToolbarGroup",
  "  align={{ default: 'alignEnd' }}",
  "  gap={{ default: 'gapNone', md: 'gapMd' }}",
  ">",
];

export const CODE_MODAL_BEFORE = [
  "<Modal",
  "  variant={ModalVariant.small}",
  "  title={titleExpression}",
  "  isOpen={isOpen}",
  "  onClose={() => onClose()}",
  ">",
];

export const CODE_MODAL_AFTER = [
  "<Modal",
  "  variant={ModalVariant.small}",
  "  isOpen={isOpen}",
  "  onClose={() => onClose()}",
  ">",
  "  <ModalHeader title={titleExpression} />",
];

export const CODE_EMPTYSTATE_BEFORE = [
  "<EmptyState>",
  "  <EmptyStateHeader",
  "    headingLevel=\"h4\"",
  "    titleText={...}",
  "    icon={<EmptyStateIcon icon={PlusCircleIcon} />}",
  "  />",
  "  <EmptyStateBody>...</EmptyStateBody>",
  "</EmptyState>",
];

export const CODE_EMPTYSTATE_AFTER = [
  "<EmptyState",
  "  headingLevel=\"h4\"",
  "  titleText={...}",
  "  icon={PlusCircleIcon}",
  ">",
  "  <EmptyStateBody>...</EmptyStateBody>",
  "</EmptyState>",
];

export const CODE_SELECT_DEPRECATED = [
  "import {",
  "  Select, SelectOption, SelectVariant",
  "} from '@patternfly/react-core/deprecated';",
];

export const CODE_SELECT_PF6 = [
  "<Select",
  "  isOpen={isOpen}",
  "  onSelect={onFilterSelect}",
  "  toggle={toggleRef => (",
  "    <MenuToggle ref={toggleRef} ...>",
  "      {placeholder}",
  "    </MenuToggle>",
  "  )}",
  ">",
  "  <SelectList>",
  "    <SelectOption ...>{...}</SelectOption>",
  "  </SelectList>",
  "</Select>",
];

export const INCOMPLETE_MODAL_FILES = [
  { name: "viewCredentialsList.tsx", modals: 2 },
  { name: "viewScansList.tsx", modals: 2 },
  { name: "viewSourcesList.tsx", modals: 2 },
];

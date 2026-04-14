# Migration Scorecard Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 4.5-minute Remotion video presenting the PF6 migration automation effectiveness scorecard as a three-act data presentation with real code examples.

**Architecture:** Single Remotion composition using `<Series>` for scene sequencing. Each scene is a self-contained component that handles its own entrance animations. Shared components (FadeIn, AnimatedNumber, CodeBlock, PatternRow, StatCard, EffortBadge, SceneContainer) provide consistent animation and styling. All data is hardcoded in `data.ts`.

**Tech Stack:** Remotion 4.x, React 19, TypeScript, `@remotion/google-fonts` (Inter + JetBrains Mono)

**Spec:** `docs/superpowers/specs/2026-04-13-migration-scorecard-video-design.md`

---

## File Structure

```
migration-scorecard/
  src/
    Root.tsx                         # Composition registration
    MigrationScorecard.tsx           # Root component with <Series>
    data.ts                          # All hardcoded data constants
    styles.ts                        # Colors, fonts, shared CSS-in-JS
    components/
      FadeIn.tsx                     # Fade + slide-up animation wrapper
      AnimatedNumber.tsx             # Count-up number display
      CodeBlock.tsx                  # Syntax-highlighted code with stagger
      PatternRow.tsx                 # Pattern table row with progress bar
      StatCard.tsx                   # Large stat display card
      EffortBadge.tsx                # Colored effort pill (trivial/moderate/significant)
      SceneContainer.tsx             # Scene wrapper with padding, header, caption
    scenes/
      TitleCard.tsx                  # Scene 1: title + subtitle
      ScopeOverview.tsx              # Scene 2: 14 patterns, 32+ instances
      MechanicalWins.tsx             # Scene 3: 100% pattern rows
      Transition.tsx                 # Scene 4: "25 build errors remained"
      ClassificationBreakdown.tsx    # Scene 5: BREAKAGE/INCOMPLETE/MISS cards
      BreakageDeepDive.tsx           # Scene 6: viewLayoutToolbar code diff
      IncompleteDeepDive.tsx         # Scene 7: Modal + Select code examples
      MissOverview.tsx               # Scene 8: 6 untouched files
      PatternTable.tsx               # Scene 9: full 14-row effectiveness table
      PunchListOverview.tsx          # Scene 10: 11 items, ~5 hours
      ModalFix.tsx                   # Scene 11: Modal title→ModalHeader fix
      EmptyStateFix.tsx              # Scene 12: EmptyState consolidation fix
      FinalVerdict.tsx               # Scene 13: stacked bar + verdict text
```

---

### Task 1: Scaffold Remotion Project and Install Dependencies

**Files:**
- Create: `migration-scorecard/` (via scaffolding tool)

- [ ] **Step 1: Scaffold the project**

```bash
cd /Users/jmatthews/synced/hack_semver/quipuchords/v2
npx create-video@latest --yes --blank --no-tailwind migration-scorecard
```

Expected: A `migration-scorecard/` directory with `package.json`, `src/Root.tsx`, `tsconfig.json`, `remotion.config.ts`.

- [ ] **Step 2: Install font package**

```bash
cd /Users/jmatthews/synced/hack_semver/quipuchords/v2/migration-scorecard
npx remotion add @remotion/google-fonts
```

Expected: `@remotion/google-fonts` added to `package.json` dependencies.

- [ ] **Step 3: Verify the project starts**

```bash
cd /Users/jmatthews/synced/hack_semver/quipuchords/v2/migration-scorecard
npx remotion studio
```

Expected: Remotion Studio opens in browser. Stop the server after confirming.

- [ ] **Step 4: Create component and scene directories**

```bash
mkdir -p src/components src/scenes
```

- [ ] **Step 5: Commit**

```bash
git add migration-scorecard/
git commit -m "feat: scaffold Remotion project for migration scorecard video"
```

---

### Task 2: Create Styles and Data Constants

**Files:**
- Create: `migration-scorecard/src/styles.ts`
- Create: `migration-scorecard/src/data.ts`

- [ ] **Step 1: Create styles.ts**

```ts
// migration-scorecard/src/styles.ts
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: interFamily } = loadInter("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

const { fontFamily: monoFamily } = loadJetBrainsMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const fonts = {
  heading: monoFamily,
  body: interFamily,
  code: monoFamily,
} as const;

export const colors = {
  bg: "#0f1117",
  green: "#4ade80",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#60a5fa",
  textPrimary: "#e0e0e0",
  textSecondary: "#6b7280",
  codeBg: "#1a1a2e",
  codeRedBg: "#2a1515",
  codeGreenBg: "#152a15",
} as const;
```

- [ ] **Step 2: Create data.ts**

```ts
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
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/jmatthews/synced/hack_semver/quipuchords/v2/migration-scorecard
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles.ts src/data.ts
git commit -m "feat: add color/font constants and hardcoded data for all scenes"
```

---

### Task 3: Build Shared Components

**Files:**
- Create: `migration-scorecard/src/components/FadeIn.tsx`
- Create: `migration-scorecard/src/components/SceneContainer.tsx`
- Create: `migration-scorecard/src/components/AnimatedNumber.tsx`
- Create: `migration-scorecard/src/components/StatCard.tsx`
- Create: `migration-scorecard/src/components/CodeBlock.tsx`
- Create: `migration-scorecard/src/components/PatternRow.tsx`
- Create: `migration-scorecard/src/components/EffortBadge.tsx`

- [ ] **Step 1: Create FadeIn.tsx**

```tsx
// migration-scorecard/src/components/FadeIn.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

type FadeInProps = {
  delay?: number;
  children: React.ReactNode;
  slideDistance?: number;
};

export const FadeIn: React.FC<FadeInProps> = ({
  delay = 0,
  children,
  slideDistance = 20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animDuration = Math.round(fps * 0.6);

  const opacity = interpolate(frame, [delay, delay + animDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const translateY = interpolate(
    frame,
    [delay, delay + animDuration],
    [slideDistance, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </div>
  );
};
```

- [ ] **Step 2: Create SceneContainer.tsx**

```tsx
// migration-scorecard/src/components/SceneContainer.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../styles";
import { FadeIn } from "./FadeIn";

type SceneContainerProps = {
  header?: string;
  headerColor?: string;
  caption?: string;
  children: React.ReactNode;
};

export const SceneContainer: React.FC<SceneContainerProps> = ({
  header,
  headerColor = colors.textPrimary,
  caption,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        padding: "60px 80px",
        fontFamily: fonts.body,
        opacity: fadeIn * fadeOut,
      }}
    >
      {header && (
        <FadeIn delay={5}>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: 42,
              fontWeight: 700,
              color: headerColor,
              margin: "0 0 40px 0",
            }}
          >
            {header}
          </h2>
        </FadeIn>
      )}
      <div style={{ flex: 1 }}>{children}</div>
      {caption && (
        <FadeIn delay={30}>
          <p
            style={{
              fontSize: 22,
              color: colors.textSecondary,
              margin: "30px 0 0 0",
              fontFamily: fonts.body,
            }}
          >
            {caption}
          </p>
        </FadeIn>
      )}
    </AbsoluteFill>
  );
};
```

- [ ] **Step 3: Create AnimatedNumber.tsx**

```tsx
// migration-scorecard/src/components/AnimatedNumber.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { fonts } from "../styles";

type AnimatedNumberProps = {
  value: number;
  delay?: number;
  fontSize?: number;
  color?: string;
  suffix?: string;
  prefix?: string;
};

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  delay = 0,
  fontSize = 120,
  color = "#e0e0e0",
  suffix = "",
  prefix = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animDuration = Math.round(fps * 1.2);

  const displayValue = Math.round(
    interpolate(frame, [delay, delay + animDuration], [0, value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );

  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        fontFamily: fonts.heading,
        fontSize,
        fontWeight: 700,
        color,
        opacity,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {prefix}{displayValue}{suffix}
    </span>
  );
};
```

- [ ] **Step 4: Create StatCard.tsx**

```tsx
// migration-scorecard/src/components/StatCard.tsx
import React from "react";
import { colors, fonts } from "../styles";
import { FadeIn } from "./FadeIn";
import { AnimatedNumber } from "./AnimatedNumber";

type StatCardProps = {
  value: number;
  label: string;
  description: string;
  color: string;
  delay?: number;
  suffix?: string;
};

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  description,
  color,
  delay = 0,
  suffix = "",
}) => {
  return (
    <FadeIn delay={delay}>
      <div
        style={{
          background: colors.codeBg,
          borderRadius: 16,
          padding: "32px 36px",
          borderLeft: `5px solid ${color}`,
          flex: 1,
        }}
      >
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 14,
            fontWeight: 700,
            color,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <AnimatedNumber
            value={value}
            delay={delay + 5}
            fontSize={56}
            color={colors.textPrimary}
            suffix={suffix}
          />
        </div>
        <div
          style={{
            fontSize: 18,
            color: colors.textSecondary,
            marginTop: 8,
          }}
        >
          {description}
        </div>
      </div>
    </FadeIn>
  );
};
```

- [ ] **Step 5: Create CodeBlock.tsx**

```tsx
// migration-scorecard/src/components/CodeBlock.tsx
import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { colors, fonts } from "../styles";

type HighlightSegment = {
  text: string;
  color: string;
};

type CodeLine = string | HighlightSegment[];

type CodeBlockProps = {
  lines: CodeLine[];
  bgColor?: string;
  delay?: number;
  staggerFrames?: number;
  title?: string;
  titleColor?: string;
  fontSize?: number;
};

const renderLine = (line: CodeLine): React.ReactNode => {
  if (typeof line === "string") {
    return <span style={{ color: colors.textPrimary }}>{line}</span>;
  }
  return line.map((seg, i) => (
    <span key={i} style={{ color: seg.color }}>
      {seg.text}
    </span>
  ));
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  lines,
  bgColor = colors.codeBg,
  delay = 0,
  staggerFrames = 3,
  title,
  titleColor = colors.textSecondary,
  fontSize = 22,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 12,
        padding: "24px 28px",
        flex: 1,
      }}
    >
      {title && (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 16,
            fontWeight: 600,
            color: titleColor,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {title}
        </div>
      )}
      <pre
        style={{
          fontFamily: fonts.code,
          fontSize,
          lineHeight: 1.6,
          margin: 0,
          whiteSpace: "pre-wrap",
        }}
      >
        {lines.map((line, i) => {
          const lineDelay = delay + i * staggerFrames;
          const opacity = interpolate(
            frame,
            [lineDelay, lineDelay + 8],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            },
          );
          return (
            <div key={i} style={{ opacity }}>
              {renderLine(line)}
            </div>
          );
        })}
      </pre>
    </div>
  );
};
```

- [ ] **Step 6: Create PatternRow.tsx**

```tsx
// migration-scorecard/src/components/PatternRow.tsx
import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { colors, fonts } from "../styles";

type PatternRowProps = {
  label: string;
  fraction: string;
  score: number;
  color: string;
  delay?: number;
};

export const PatternRow: React.FC<PatternRowProps> = ({
  label,
  fraction,
  score,
  color,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const barWidth = interpolate(
    frame,
    [delay + 5, delay + 5 + Math.round(fps * 0.6)],
    [0, score],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 18,
          color: colors.textPrimary,
          width: 380,
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 24,
          backgroundColor: "#1f2937",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: fonts.heading,
          fontSize: 18,
          color,
          width: 80,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {fraction}
      </div>
      <div
        style={{
          fontFamily: fonts.heading,
          fontSize: 18,
          color,
          width: 60,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {score}%
      </div>
    </div>
  );
};
```

- [ ] **Step 7: Create EffortBadge.tsx**

```tsx
// migration-scorecard/src/components/EffortBadge.tsx
import React from "react";
import { colors, fonts } from "../styles";

type EffortBadgeProps = {
  level: "trivial" | "moderate" | "significant";
};

const BADGE_STYLES: Record<
  EffortBadgeProps["level"],
  { bg: string; text: string }
> = {
  trivial: { bg: colors.codeGreenBg, text: colors.green },
  moderate: { bg: "#2a2215", text: colors.amber },
  significant: { bg: colors.codeRedBg, text: colors.red },
};

export const EffortBadge: React.FC<EffortBadgeProps> = ({ level }) => {
  const style = BADGE_STYLES[level];
  return (
    <span
      style={{
        fontFamily: fonts.body,
        fontSize: 14,
        fontWeight: 600,
        color: style.text,
        backgroundColor: style.bg,
        padding: "4px 12px",
        borderRadius: 12,
      }}
    >
      {level}
    </span>
  );
};
```

- [ ] **Step 8: Verify TypeScript compiles**

```bash
cd /Users/jmatthews/synced/hack_semver/quipuchords/v2/migration-scorecard
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 9: Commit**

```bash
git add src/components/
git commit -m "feat: add shared components (FadeIn, AnimatedNumber, CodeBlock, PatternRow, StatCard, EffortBadge, SceneContainer)"
```

---

### Task 4: Build Act 1 Scenes

**Files:**
- Create: `migration-scorecard/src/scenes/TitleCard.tsx`
- Create: `migration-scorecard/src/scenes/ScopeOverview.tsx`
- Create: `migration-scorecard/src/scenes/MechanicalWins.tsx`
- Create: `migration-scorecard/src/scenes/Transition.tsx`

- [ ] **Step 1: Create TitleCard.tsx**

```tsx
// migration-scorecard/src/scenes/TitleCard.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { colors, fonts } from "../styles";

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const subtitleOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const tertiaryOpacity = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: fonts.heading,
          fontSize: 64,
          fontWeight: 700,
          color: colors.textPrimary,
          opacity: titleOpacity,
          textAlign: "center",
        }}
      >
        PF6 Migration Automation
      </div>
      <div
        style={{
          fontFamily: fonts.heading,
          fontSize: 36,
          fontWeight: 400,
          color: colors.blue,
          opacity: subtitleOpacity,
          marginTop: 16,
          textAlign: "center",
        }}
      >
        Effectiveness Scorecard
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 22,
          color: colors.textSecondary,
          opacity: tertiaryOpacity,
          marginTop: 24,
          textAlign: "center",
        }}
      >
        quipuchords codebase evaluation
      </div>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 2: Create ScopeOverview.tsx**

```tsx
// migration-scorecard/src/scenes/ScopeOverview.tsx
import React from "react";
import { colors, fonts } from "../styles";
import { SceneContainer } from "../components/SceneContainer";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { FadeIn } from "../components/FadeIn";
import { SCOPE_PATTERNS } from "../data";

export const ScopeOverview: React.FC = () => {
  return (
    <SceneContainer>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 120,
          marginTop: 40,
          marginBottom: 60,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <AnimatedNumber value={14} delay={10} fontSize={120} color={colors.green} />
          <FadeIn delay={20}>
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 24,
                color: colors.textSecondary,
                marginTop: 12,
              }}
            >
              migration patterns targeted
            </div>
          </FadeIn>
        </div>
        <div style={{ textAlign: "center" }}>
          <AnimatedNumber value={32} delay={20} fontSize={120} color={colors.green} suffix="+" />
          <FadeIn delay={30}>
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 24,
                color: colors.textSecondary,
                marginTop: 12,
              }}
            >
              change instances across codebase
            </div>
          </FadeIn>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "8px 40px",
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        {SCOPE_PATTERNS.map((name, i) => (
          <FadeIn key={name} delay={40 + i * 3}>
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 20,
                color: colors.textSecondary,
                padding: "6px 0",
                borderBottom: "1px solid #1f2937",
              }}
            >
              {name}
            </div>
          </FadeIn>
        ))}
      </div>
    </SceneContainer>
  );
};
```

- [ ] **Step 3: Create MechanicalWins.tsx**

```tsx
// migration-scorecard/src/scenes/MechanicalWins.tsx
import React from "react";
import { SceneContainer } from "../components/SceneContainer";
import { PatternRow } from "../components/PatternRow";
import { FadeIn } from "../components/FadeIn";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { MECHANICAL_PATTERNS } from "../data";
import { colors } from "../styles";

export const MechanicalWins: React.FC = () => {
  return (
    <SceneContainer header="What the tool nailed">
      <div style={{ marginTop: 20 }}>
        {MECHANICAL_PATTERNS.map((p, i) => (
          <PatternRow
            key={p.name}
            label={p.name}
            fraction={`${p.handled}/${p.instances}`}
            score={p.score}
            color={p.color}
            delay={10 + i * 12}
          />
        ))}
      </div>
      <FadeIn delay={90}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 12,
            marginTop: 40,
            justifyContent: "center",
          }}
        >
          <AnimatedNumber
            value={16}
            delay={95}
            fontSize={48}
            color={colors.green}
          />
          <span
            style={{
              fontSize: 28,
              color: colors.green,
            }}
          >
            / 16 mechanical transforms — perfect score
          </span>
        </div>
      </FadeIn>
    </SceneContainer>
  );
};
```

- [ ] **Step 4: Create Transition.tsx (Scene 4)**

```tsx
// migration-scorecard/src/scenes/Transition.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { colors, fonts } from "../styles";
import { AnimatedNumber } from "../components/AnimatedNumber";
import { FadeIn } from "../components/FadeIn";

export const TransitionScene: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [480, 600], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <AnimatedNumber value={25} delay={15} fontSize={160} color={colors.red} />
        <FadeIn delay={20}>
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 32,
              color: colors.red,
              marginTop: 8,
            }}
          >
            build errors remained
          </div>
        </FadeIn>
      </div>
      <FadeIn delay={50}>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <AnimatedNumber
            value={12}
            delay={55}
            fontSize={80}
            color={colors.red}
          />
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 28,
              color: colors.red,
              marginTop: 8,
            }}
          >
            files with meaningful gaps
          </div>
        </div>
      </FadeIn>
      <FadeIn delay={100}>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 26,
            color: colors.textSecondary,
            marginTop: 60,
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.5,
          }}
        >
          The automation handles find-and-replace.
          <br />
          It struggles with compositional restructuring.
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /Users/jmatthews/synced/hack_semver/quipuchords/v2/migration-scorecard
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/scenes/TitleCard.tsx src/scenes/ScopeOverview.tsx src/scenes/MechanicalWins.tsx src/scenes/Transition.tsx
git commit -m "feat: add Act 1 scenes (TitleCard, ScopeOverview, MechanicalWins, Transition)"
```

---

### Task 5: Build Act 2 Scenes

**Files:**
- Create: `migration-scorecard/src/scenes/ClassificationBreakdown.tsx`
- Create: `migration-scorecard/src/scenes/BreakageDeepDive.tsx`
- Create: `migration-scorecard/src/scenes/IncompleteDeepDive.tsx`
- Create: `migration-scorecard/src/scenes/MissOverview.tsx`
- Create: `migration-scorecard/src/scenes/PatternTable.tsx`

- [ ] **Step 1: Create ClassificationBreakdown.tsx**

```tsx
// migration-scorecard/src/scenes/ClassificationBreakdown.tsx
import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { SceneContainer } from "../components/SceneContainer";
import { StatCard } from "../components/StatCard";
import { FadeIn } from "../components/FadeIn";
import { CLASSIFICATIONS } from "../data";
import { colors } from "../styles";

export const ClassificationBreakdown: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const classifications = [
    CLASSIFICATIONS.breakage,
    CLASSIFICATIONS.incomplete,
    CLASSIFICATIONS.miss,
  ];

  const barProgress = interpolate(
    frame,
    [60, 60 + Math.round(fps * 1.2)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <SceneContainer header="12 files with meaningful gaps">
      <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
        {classifications.map((c, i) => (
          <StatCard
            key={c.label}
            value={c.count}
            label={c.label}
            description={c.description}
            color={c.color}
            delay={10 + i * 15}
            suffix={` files (${c.percent}%)`}
          />
        ))}
      </div>
      <FadeIn delay={60}>
        <div
          style={{
            marginTop: 50,
            height: 40,
            borderRadius: 8,
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              width: `${8 * barProgress}%`,
              backgroundColor: colors.red,
              height: "100%",
            }}
          />
          <div
            style={{
              width: `${42 * barProgress}%`,
              backgroundColor: colors.amber,
              height: "100%",
            }}
          />
          <div
            style={{
              width: `${50 * barProgress}%`,
              backgroundColor: "#dc2626",
              height: "100%",
            }}
          />
        </div>
      </FadeIn>
    </SceneContainer>
  );
};
```

- [ ] **Step 2: Create BreakageDeepDive.tsx**

```tsx
// migration-scorecard/src/scenes/BreakageDeepDive.tsx
import React from "react";
import { SceneContainer } from "../components/SceneContainer";
import { CodeBlock } from "../components/CodeBlock";
import { FadeIn } from "../components/FadeIn";
import { BREAKAGE_ADDITIONAL_ISSUES } from "../data";
import { colors, fonts } from "../styles";

const BEFORE_LINES = [
  [
    { text: "<ToolbarGroup", color: colors.textPrimary },
  ],
  [
    { text: "  align={{ default: '", color: colors.textPrimary },
    { text: "alignRight", color: colors.red },
    { text: "' }}", color: colors.textPrimary },
  ],
  [
    { text: "  gap={{ default: '", color: colors.textPrimary },
    { text: "spacerNone", color: colors.red },
    { text: "', md: '", color: colors.textPrimary },
    { text: "spacerMd", color: colors.red },
    { text: "' }}", color: colors.textPrimary },
  ],
  [{ text: ">", color: colors.textPrimary }],
] as const;

const AFTER_LINES = [
  [{ text: "<ToolbarGroup", color: colors.textPrimary }],
  [
    { text: "  align={{ default: '", color: colors.textPrimary },
    { text: "alignEnd", color: colors.green },
    { text: "' }}", color: colors.textPrimary },
  ],
  [
    { text: "  gap={{ default: '", color: colors.textPrimary },
    { text: "gapNone", color: colors.green },
    { text: "', md: '", color: colors.textPrimary },
    { text: "gapMd", color: colors.green },
    { text: "' }}", color: colors.textPrimary },
  ],
  [{ text: ">", color: colors.textPrimary }],
] as const;

export const BreakageDeepDive: React.FC = () => {
  return (
    <SceneContainer
      header="BREAKAGE — viewLayoutToolbar.tsx"
      headerColor={colors.red}
      caption="3 TS2322 build errors + silent rendering failure"
    >
      <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
        <CodeBlock
          lines={BEFORE_LINES as any}
          bgColor={colors.codeRedBg}
          delay={15}
          title="What the tool produced"
          titleColor={colors.red}
          fontSize={24}
        />
        <CodeBlock
          lines={AFTER_LINES as any}
          bgColor={colors.codeGreenBg}
          delay={40}
          title="What was needed"
          titleColor={colors.green}
          fontSize={24}
        />
      </div>
      <div style={{ marginTop: 32 }}>
        {BREAKAGE_ADDITIONAL_ISSUES.map((issue, i) => (
          <FadeIn key={issue.label} delay={80 + i * 12}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid #1f2937",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.red,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontFamily: fonts.body, fontSize: 20, color: colors.textPrimary }}>
                {issue.label}
              </span>
              <span style={{ fontFamily: fonts.body, fontSize: 18, color: colors.textSecondary }}>
                — {issue.detail}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>
    </SceneContainer>
  );
};
```

- [ ] **Step 3: Create IncompleteDeepDive.tsx**

```tsx
// migration-scorecard/src/scenes/IncompleteDeepDive.tsx
import React from "react";
import { useCurrentFrame } from "remotion";
import { Sequence } from "remotion";
import { SceneContainer } from "../components/SceneContainer";
import { CodeBlock } from "../components/CodeBlock";
import { FadeIn } from "../components/FadeIn";
import {
  CODE_MODAL_BEFORE,
  CODE_MODAL_AFTER,
  CODE_SELECT_DEPRECATED,
  CODE_SELECT_PF6,
  INCOMPLETE_MODAL_FILES,
} from "../data";
import { colors, fonts } from "../styles";

const ModalHalf: React.FC = () => {
  return (
    <SceneContainer
      header="INCOMPLETE — Modal restructuring"
      headerColor={colors.amber}
      caption="Tool removed PageSection variant but left Modal props untouched"
    >
      <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
        <CodeBlock
          lines={CODE_MODAL_BEFORE.map((l) =>
            l.includes("title=")
              ? [
                  { text: l.replace("title={titleExpression}", ""), color: colors.textPrimary },
                  { text: "title={titleExpression}", color: colors.amber },
                ]
              : l,
          )}
          bgColor={colors.codeBg}
          delay={15}
          title="Before (automation output)"
          titleColor={colors.amber}
        />
        <CodeBlock
          lines={CODE_MODAL_AFTER.map((l) =>
            l.includes("ModalHeader")
              ? [{ text: l, color: colors.green }]
              : l,
          )}
          bgColor={colors.codeGreenBg}
          delay={30}
          title="After (what was needed)"
          titleColor={colors.green}
        />
      </div>
      <div style={{ display: "flex", gap: 24, marginTop: 24 }}>
        {INCOMPLETE_MODAL_FILES.map((f, i) => (
          <FadeIn key={f.name} delay={60 + i * 8}>
            <div
              style={{
                fontFamily: fonts.code,
                fontSize: 18,
                color: colors.textSecondary,
              }}
            >
              {f.name}{" "}
              <span style={{ color: colors.amber }}>({f.modals} modals)</span>
            </div>
          </FadeIn>
        ))}
      </div>
    </SceneContainer>
  );
};

const SelectHalf: React.FC = () => {
  return (
    <SceneContainer
      header="INCOMPLETE — Select rewrite"
      headerColor={colors.amber}
      caption="Complete API rewrite — 8 build errors across 2 files"
    >
      <FadeIn delay={5}>
        <CodeBlock
          lines={CODE_SELECT_DEPRECATED.map((l) => [
            { text: l, color: colors.red },
          ])}
          bgColor={colors.codeRedBg}
          delay={10}
          title="Deprecated import left untouched"
          titleColor={colors.red}
          fontSize={20}
        />
      </FadeIn>
      <div style={{ marginTop: 24 }}>
        <CodeBlock
          lines={CODE_SELECT_PF6.map((l) => [
            { text: l, color: colors.green },
          ])}
          bgColor={colors.codeGreenBg}
          delay={30}
          title="PF6 replacement (composition-based)"
          titleColor={colors.green}
          fontSize={20}
        />
      </div>
    </SceneContainer>
  );
};

export const IncompleteDeepDive: React.FC = () => {
  return (
    <>
      <Sequence durationInFrames={600} layout="none">
        <ModalHalf />
      </Sequence>
      <Sequence from={600} durationInFrames={600} layout="none">
        <SelectHalf />
      </Sequence>
    </>
  );
};
```

- [ ] **Step 4: Create MissOverview.tsx**

```tsx
// migration-scorecard/src/scenes/MissOverview.tsx
import React from "react";
import { SceneContainer } from "../components/SceneContainer";
import { FadeIn } from "../components/FadeIn";
import { MISS_FILES } from "../data";
import { colors, fonts } from "../styles";

export const MissOverview: React.FC = () => {
  return (
    <SceneContainer
      header="MISS — 6 files never touched"
      headerColor={colors.red}
      caption="No harm done — but no help either. Primarily modal files requiring structural changes."
    >
      <div style={{ marginTop: 40 }}>
        {MISS_FILES.map((file, i) => (
          <FadeIn key={file} delay={15 + i * 10}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "14px 0",
                borderBottom: "1px solid #1f2937",
              }}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.red,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: fonts.code,
                  fontSize: 24,
                  color: colors.textPrimary,
                }}
              >
                {file}
              </span>
            </div>
          </FadeIn>
        ))}
      </div>
    </SceneContainer>
  );
};
```

- [ ] **Step 5: Create PatternTable.tsx**

```tsx
// migration-scorecard/src/scenes/PatternTable.tsx
import React from "react";
import { SceneContainer } from "../components/SceneContainer";
import { PatternRow } from "../components/PatternRow";
import { ALL_PATTERNS } from "../data";
import { fonts, colors } from "../styles";
import { FadeIn } from "../components/FadeIn";

export const PatternTable: React.FC = () => {
  return (
    <SceneContainer header="Pattern Effectiveness — Full Picture">
      <FadeIn delay={5}>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: "1px solid #374151",
          }}
        >
          <div style={{ width: 380, fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>
            Pattern
          </div>
          <div style={{ flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1 }}>
            Coverage
          </div>
          <div style={{ width: 80, fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, textAlign: "right" }}>
            Handled
          </div>
          <div style={{ width: 60, fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, textAlign: "right" }}>
            Score
          </div>
        </div>
      </FadeIn>
      <div>
        {ALL_PATTERNS.map((p, i) => (
          <PatternRow
            key={p.name}
            label={p.name}
            fraction={`${p.handled}/${p.instances}`}
            score={p.score}
            color={p.color}
            delay={i < 6 ? 5 : 10 + (i - 6) * 8}
          />
        ))}
      </div>
    </SceneContainer>
  );
};
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd /Users/jmatthews/synced/hack_semver/quipuchords/v2/migration-scorecard
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/scenes/ClassificationBreakdown.tsx src/scenes/BreakageDeepDive.tsx src/scenes/IncompleteDeepDive.tsx src/scenes/MissOverview.tsx src/scenes/PatternTable.tsx
git commit -m "feat: add Act 2 scenes (ClassificationBreakdown, BreakageDeepDive, IncompleteDeepDive, MissOverview, PatternTable)"
```

---

### Task 6: Build Act 3 Scenes

**Files:**
- Create: `migration-scorecard/src/scenes/PunchListOverview.tsx`
- Create: `migration-scorecard/src/scenes/ModalFix.tsx`
- Create: `migration-scorecard/src/scenes/EmptyStateFix.tsx`
- Create: `migration-scorecard/src/scenes/FinalVerdict.tsx`

- [ ] **Step 1: Create PunchListOverview.tsx**

```tsx
// migration-scorecard/src/scenes/PunchListOverview.tsx
import React from "react";
import { SceneContainer } from "../components/SceneContainer";
import { FadeIn } from "../components/FadeIn";
import { EffortBadge } from "../components/EffortBadge";
import { PUNCH_LIST } from "../data";
import { colors, fonts } from "../styles";

export const PunchListOverview: React.FC = () => {
  return (
    <SceneContainer header="What's left — 11 items, ~5 hours" headerColor={colors.blue}>
      <div style={{ marginTop: 10 }}>
        {PUNCH_LIST.map((item, i) => (
          <FadeIn key={item.id} delay={10 + i * 6}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "10px 0",
                borderBottom: "1px solid #1f2937",
              }}
            >
              <div
                style={{
                  fontFamily: fonts.heading,
                  fontSize: 16,
                  color: colors.textSecondary,
                  width: 30,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {item.id}.
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 20,
                  color: colors.textPrimary,
                  flex: 1,
                }}
              >
                {item.pattern}
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 16,
                  color: colors.textSecondary,
                  width: 70,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {item.files} file{item.files > 1 ? "s" : ""}
              </div>
              <div
                style={{
                  fontFamily: fonts.heading,
                  fontSize: 16,
                  color: colors.textSecondary,
                  width: 60,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                ~{item.estimateMin}m
              </div>
              <div style={{ width: 100, flexShrink: 0 }}>
                <EffortBadge level={item.effort} />
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </SceneContainer>
  );
};
```

- [ ] **Step 2: Create ModalFix.tsx**

```tsx
// migration-scorecard/src/scenes/ModalFix.tsx
import React from "react";
import { SceneContainer } from "../components/SceneContainer";
import { CodeBlock } from "../components/CodeBlock";
import { CODE_MODAL_BEFORE, CODE_MODAL_AFTER } from "../data";
import { colors } from "../styles";

export const ModalFix: React.FC = () => {
  return (
    <SceneContainer
      header="Fix: Modal title → ModalHeader"
      headerColor={colors.blue}
      caption="8 files, ~40 min total"
    >
      <div style={{ display: "flex", gap: 24, marginTop: 30 }}>
        <CodeBlock
          lines={CODE_MODAL_BEFORE.map((l) =>
            l.includes("title=")
              ? [{ text: l, color: colors.red }]
              : l,
          )}
          bgColor={colors.codeRedBg}
          delay={10}
          title="Before"
          titleColor={colors.red}
          fontSize={24}
        />
        <CodeBlock
          lines={CODE_MODAL_AFTER.map((l) =>
            l.includes("ModalHeader")
              ? [{ text: l, color: colors.green }]
              : l,
          )}
          bgColor={colors.codeGreenBg}
          delay={25}
          title="After"
          titleColor={colors.green}
          fontSize={24}
        />
      </div>
    </SceneContainer>
  );
};
```

- [ ] **Step 3: Create EmptyStateFix.tsx**

```tsx
// migration-scorecard/src/scenes/EmptyStateFix.tsx
import React from "react";
import { SceneContainer } from "../components/SceneContainer";
import { CodeBlock } from "../components/CodeBlock";
import { CODE_EMPTYSTATE_BEFORE, CODE_EMPTYSTATE_AFTER } from "../data";
import { colors } from "../styles";

export const EmptyStateFix: React.FC = () => {
  return (
    <SceneContainer
      header="Fix: EmptyState consolidation"
      headerColor={colors.blue}
      caption="7 files (4 broken + 3 non-idiomatic), ~35 min total"
    >
      <div style={{ display: "flex", gap: 24, marginTop: 30 }}>
        <CodeBlock
          lines={CODE_EMPTYSTATE_BEFORE.map((l) =>
            l.includes("EmptyStateHeader") || l.includes("EmptyStateIcon")
              ? [{ text: l, color: colors.red }]
              : l,
          )}
          bgColor={colors.codeRedBg}
          delay={10}
          title="Before"
          titleColor={colors.red}
          fontSize={22}
        />
        <CodeBlock
          lines={CODE_EMPTYSTATE_AFTER.map((l) =>
            l.includes("titleText") || l.includes("icon=")
              ? [{ text: l, color: colors.green }]
              : l,
          )}
          bgColor={colors.codeGreenBg}
          delay={25}
          title="After"
          titleColor={colors.green}
          fontSize={22}
        />
      </div>
    </SceneContainer>
  );
};
```

- [ ] **Step 4: Create FinalVerdict.tsx**

```tsx
// migration-scorecard/src/scenes/FinalVerdict.tsx
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { colors, fonts } from "../styles";
import { FadeIn } from "../components/FadeIn";

export const FinalVerdict: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const barProgress = interpolate(
    frame,
    [15, 15 + Math.round(fps * 1.2)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 120px",
      }}
    >
      <FadeIn delay={5}>
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 32,
            color: colors.textSecondary,
            marginBottom: 32,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Net Assessment
        </div>
      </FadeIn>

      <FadeIn delay={10}>
        <div
          style={{
            width: 1000,
            height: 64,
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: `${35 * barProgress}%`,
              backgroundColor: colors.green,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {barProgress > 0.5 && (
              <span
                style={{
                  fontFamily: fonts.body,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0f1117",
                }}
              >
                30–40% automated
              </span>
            )}
          </div>
          <div
            style={{
              width: `${65 * barProgress}%`,
              backgroundColor: colors.amber,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {barProgress > 0.5 && (
              <span
                style={{
                  fontFamily: fonts.body,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0f1117",
                }}
              >
                60–70% manual
              </span>
            )}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 32,
            color: colors.textPrimary,
            textAlign: "center",
            lineHeight: 1.6,
            marginTop: 50,
            maxWidth: 900,
          }}
        >
          The tool saves real time on mechanical transforms.
        </div>
      </FadeIn>

      <FadeIn delay={80}>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 28,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 1.6,
            marginTop: 16,
            maxWidth: 900,
          }}
        >
          Treat its output as a starting point, not a finished migration.
        </div>
      </FadeIn>

      <FadeIn delay={110}>
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 20,
            color: colors.blue,
            textAlign: "center",
            marginTop: 60,
            opacity: 0.6,
          }}
        >
          PF6 Migration Automation — Effectiveness Scorecard
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
cd /Users/jmatthews/synced/hack_semver/quipuchords/v2/migration-scorecard
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 6: Commit**

```bash
git add src/scenes/PunchListOverview.tsx src/scenes/ModalFix.tsx src/scenes/EmptyStateFix.tsx src/scenes/FinalVerdict.tsx
git commit -m "feat: add Act 3 scenes (PunchListOverview, ModalFix, EmptyStateFix, FinalVerdict)"
```

---

### Task 7: Wire Up Root Composition

**Files:**
- Create: `migration-scorecard/src/MigrationScorecard.tsx`
- Modify: `migration-scorecard/src/Root.tsx`

- [ ] **Step 1: Create MigrationScorecard.tsx**

```tsx
// migration-scorecard/src/MigrationScorecard.tsx
import React from "react";
import { Series } from "remotion";
import { TitleCard } from "./scenes/TitleCard";
import { ScopeOverview } from "./scenes/ScopeOverview";
import { MechanicalWins } from "./scenes/MechanicalWins";
import { TransitionScene } from "./scenes/Transition";
import { ClassificationBreakdown } from "./scenes/ClassificationBreakdown";
import { BreakageDeepDive } from "./scenes/BreakageDeepDive";
import { IncompleteDeepDive } from "./scenes/IncompleteDeepDive";
import { MissOverview } from "./scenes/MissOverview";
import { PatternTable } from "./scenes/PatternTable";
import { PunchListOverview } from "./scenes/PunchListOverview";
import { ModalFix } from "./scenes/ModalFix";
import { EmptyStateFix } from "./scenes/EmptyStateFix";
import { FinalVerdict } from "./scenes/FinalVerdict";

export const MigrationScorecard: React.FC = () => {
  return (
    <Series>
      {/* Act 1 — The Promise */}
      <Series.Sequence durationInFrames={150}>
        <TitleCard />
      </Series.Sequence>
      <Series.Sequence durationInFrames={450}>
        <ScopeOverview />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <MechanicalWins />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <TransitionScene />
      </Series.Sequence>

      {/* Act 2 — The Reality */}
      <Series.Sequence durationInFrames={900}>
        <ClassificationBreakdown />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1200}>
        <BreakageDeepDive />
      </Series.Sequence>
      <Series.Sequence durationInFrames={1200}>
        <IncompleteDeepDive />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <MissOverview />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <PatternTable />
      </Series.Sequence>

      {/* Act 3 — The Cleanup */}
      <Series.Sequence durationInFrames={600}>
        <PunchListOverview />
      </Series.Sequence>
      <Series.Sequence durationInFrames={300}>
        <ModalFix />
      </Series.Sequence>
      <Series.Sequence durationInFrames={300}>
        <EmptyStateFix />
      </Series.Sequence>
      <Series.Sequence durationInFrames={600}>
        <FinalVerdict />
      </Series.Sequence>
    </Series>
  );
};
```

- [ ] **Step 2: Update Root.tsx**

Replace the contents of `src/Root.tsx` with:

```tsx
// migration-scorecard/src/Root.tsx
import { Composition } from "remotion";
import { MigrationScorecard } from "./MigrationScorecard";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MigrationScorecard"
      component={MigrationScorecard}
      durationInFrames={8100}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/jmatthews/synced/hack_semver/quipuchords/v2/migration-scorecard
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/MigrationScorecard.tsx src/Root.tsx
git commit -m "feat: wire up root composition with all 13 scenes in Series"
```

---

### Task 8: Preview and Verify

**Files:** None — verification only.

- [ ] **Step 1: Render a still from the title card (frame 75)**

```bash
cd /Users/jmatthews/synced/hack_semver/quipuchords/v2/migration-scorecard
npx remotion still MigrationScorecard --frame=75 --scale=0.5 out/title-check.png
```

Expected: A dark image with "PF6 Migration Automation" and "Effectiveness Scorecard" visible.

- [ ] **Step 2: Render a still from the mechanical wins scene (frame 900)**

```bash
npx remotion still MigrationScorecard --frame=900 --scale=0.5 out/wins-check.png
```

Expected: Pattern table with green 100% bars visible.

- [ ] **Step 3: Render a still from the breakage deep dive (frame 3300)**

```bash
npx remotion still MigrationScorecard --frame=3300 --scale=0.5 out/breakage-check.png
```

Expected: Side-by-side code blocks with red/green highlighted values.

- [ ] **Step 4: Render a still from the final verdict (frame 7800)**

```bash
npx remotion still MigrationScorecard --frame=7800 --scale=0.5 out/verdict-check.png
```

Expected: Horizontal bar chart with "30-40% automated" / "60-70% manual" and verdict text.

- [ ] **Step 5: Start Remotion Studio for full preview**

```bash
npx remotion studio
```

Scrub through the full timeline and verify:
- All 13 scenes play in order
- Fade-in/fade-out transitions between scenes work
- Code blocks render with syntax highlighting
- Numbers count up smoothly
- Pattern table bars animate correctly
- No layout overflow or clipping issues

- [ ] **Step 6: Fix any visual issues discovered during preview**

Address any layout, timing, or animation issues found in Step 5. Common adjustments:
- Font sizes too large/small for the 1920x1080 canvas
- FadeIn delays that feel too fast or too slow
- Code blocks that overflow their containers
- Stagger timing that causes content to appear after the scene ends

- [ ] **Step 7: Commit any fixes**

```bash
git add -A
git commit -m "fix: adjust layout and timing after visual review"
```

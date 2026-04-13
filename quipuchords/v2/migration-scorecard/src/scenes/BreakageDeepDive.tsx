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
];

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
];

export const BreakageDeepDive: React.FC = () => {
  return (
    <SceneContainer
      header="BREAKAGE — viewLayoutToolbar.tsx"
      headerColor={colors.red}
      caption="3 TS2322 build errors + silent rendering failure"
    >
      <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
        <CodeBlock
          lines={BEFORE_LINES}
          bgColor={colors.codeRedBg}
          delay={15}
          title="What the tool produced"
          titleColor={colors.red}
          fontSize={24}
        />
        <CodeBlock
          lines={AFTER_LINES}
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

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

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

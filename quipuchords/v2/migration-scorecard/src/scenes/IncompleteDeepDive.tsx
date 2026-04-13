import React from "react";
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

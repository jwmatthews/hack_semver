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

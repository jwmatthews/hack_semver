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

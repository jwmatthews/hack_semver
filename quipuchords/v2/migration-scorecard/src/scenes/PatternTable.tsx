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

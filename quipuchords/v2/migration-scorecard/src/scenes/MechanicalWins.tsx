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

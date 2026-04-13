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

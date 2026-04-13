import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
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

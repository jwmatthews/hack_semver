import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from "remotion";
import { colors, fonts } from "../styles";

export const TitleCard: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [10, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const subtitleOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const tertiaryOpacity = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontFamily: fonts.heading,
          fontSize: 64,
          fontWeight: 700,
          color: colors.textPrimary,
          opacity: titleOpacity,
          textAlign: "center",
        }}
      >
        PF6 Migration Automation
      </div>
      <div
        style={{
          fontFamily: fonts.heading,
          fontSize: 36,
          fontWeight: 400,
          color: colors.blue,
          opacity: subtitleOpacity,
          marginTop: 16,
          textAlign: "center",
        }}
      >
        Effectiveness Scorecard
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 22,
          color: colors.textSecondary,
          opacity: tertiaryOpacity,
          marginTop: 24,
          textAlign: "center",
        }}
      >
        quipuchords codebase evaluation
      </div>
    </AbsoluteFill>
  );
};

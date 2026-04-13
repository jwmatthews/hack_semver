import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { colors, fonts } from "../styles";

type PatternRowProps = {
  label: string;
  fraction: string;
  score: number;
  color: string;
  delay?: number;
};

export const PatternRow: React.FC<PatternRowProps> = ({
  label,
  fraction,
  score,
  color,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const barWidth = interpolate(
    frame,
    [delay + 5, delay + 5 + Math.round(fps * 0.6)],
    [0, score],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity,
        marginBottom: 8,
      }}
    >
      <div
        style={{
          fontFamily: fonts.body,
          fontSize: 18,
          color: colors.textPrimary,
          width: 380,
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div
        style={{
          flex: 1,
          height: 24,
          backgroundColor: "#1f2937",
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${barWidth}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 4,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: fonts.heading,
          fontSize: 18,
          color,
          width: 80,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {fraction}
      </div>
      <div
        style={{
          fontFamily: fonts.heading,
          fontSize: 18,
          color,
          width: 60,
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {score}%
      </div>
    </div>
  );
};

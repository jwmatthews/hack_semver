import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { fonts } from "../styles";

type AnimatedNumberProps = {
  value: number;
  delay?: number;
  fontSize?: number;
  color?: string;
  suffix?: string;
  prefix?: string;
};

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  delay = 0,
  fontSize = 120,
  color = "#e0e0e0",
  suffix = "",
  prefix = "",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animDuration = Math.round(fps * 1.2);

  const displayValue = Math.round(
    interpolate(frame, [delay, delay + animDuration], [0, value], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );

  const opacity = interpolate(frame, [delay, delay + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        fontFamily: fonts.heading,
        fontSize,
        fontWeight: 700,
        color,
        opacity,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {prefix}{displayValue}{suffix}
    </span>
  );
};

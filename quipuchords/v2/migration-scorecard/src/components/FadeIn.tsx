import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

type FadeInProps = {
  delay?: number;
  children: React.ReactNode;
  slideDistance?: number;
};

export const FadeIn: React.FC<FadeInProps> = ({
  delay = 0,
  children,
  slideDistance = 20,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const animDuration = Math.round(fps * 0.6);

  const opacity = interpolate(frame, [delay, delay + animDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const translateY = interpolate(
    frame,
    [delay, delay + animDuration],
    [slideDistance, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <div style={{ opacity, transform: `translateY(${translateY}px)` }}>
      {children}
    </div>
  );
};

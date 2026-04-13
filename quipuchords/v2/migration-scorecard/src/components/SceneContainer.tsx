import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { colors, fonts } from "../styles";
import { FadeIn } from "./FadeIn";

type SceneContainerProps = {
  header?: string;
  headerColor?: string;
  caption?: string;
  children: React.ReactNode;
};

export const SceneContainer: React.FC<SceneContainerProps> = ({
  header,
  headerColor = colors.textPrimary,
  caption,
  children,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 10, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        padding: "60px 80px",
        fontFamily: fonts.body,
        opacity: fadeIn * fadeOut,
      }}
    >
      {header && (
        <FadeIn delay={5}>
          <h2
            style={{
              fontFamily: fonts.heading,
              fontSize: 42,
              fontWeight: 700,
              color: headerColor,
              margin: "0 0 40px 0",
            }}
          >
            {header}
          </h2>
        </FadeIn>
      )}
      <div style={{ flex: 1 }}>{children}</div>
      {caption && (
        <FadeIn delay={30}>
          <p
            style={{
              fontSize: 22,
              color: colors.textSecondary,
              margin: "30px 0 0 0",
              fontFamily: fonts.body,
            }}
          >
            {caption}
          </p>
        </FadeIn>
      )}
    </AbsoluteFill>
  );
};

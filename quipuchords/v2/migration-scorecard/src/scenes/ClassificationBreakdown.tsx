import React from "react";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { SceneContainer } from "../components/SceneContainer";
import { StatCard } from "../components/StatCard";
import { FadeIn } from "../components/FadeIn";
import { CLASSIFICATIONS } from "../data";
import { colors } from "../styles";

export const ClassificationBreakdown: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const classifications = [
    CLASSIFICATIONS.breakage,
    CLASSIFICATIONS.incomplete,
    CLASSIFICATIONS.miss,
  ];

  const barProgress = interpolate(
    frame,
    [60, 60 + Math.round(fps * 1.2)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <SceneContainer header="12 files with meaningful gaps">
      <div style={{ display: "flex", gap: 24, marginTop: 20 }}>
        {classifications.map((c, i) => (
          <StatCard
            key={c.label}
            value={c.count}
            label={c.label}
            description={c.description}
            color={c.color}
            delay={10 + i * 15}
            suffix={` files (${c.percent}%)`}
          />
        ))}
      </div>
      <FadeIn delay={60}>
        <div
          style={{
            marginTop: 50,
            height: 40,
            borderRadius: 8,
            overflow: "hidden",
            display: "flex",
          }}
        >
          <div
            style={{
              width: `${8 * barProgress}%`,
              backgroundColor: colors.red,
              height: "100%",
            }}
          />
          <div
            style={{
              width: `${42 * barProgress}%`,
              backgroundColor: colors.amber,
              height: "100%",
            }}
          />
          <div
            style={{
              width: `${50 * barProgress}%`,
              backgroundColor: "#dc2626",
              height: "100%",
            }}
          />
        </div>
      </FadeIn>
    </SceneContainer>
  );
};

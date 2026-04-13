import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
} from "remotion";
import { colors, fonts } from "../styles";
import { FadeIn } from "../components/FadeIn";

export const FinalVerdict: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const barProgress = interpolate(
    frame,
    [15, 15 + Math.round(fps * 1.2)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 120px",
      }}
    >
      <FadeIn delay={5}>
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 32,
            color: colors.textSecondary,
            marginBottom: 32,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          Net Assessment
        </div>
      </FadeIn>

      <FadeIn delay={10}>
        <div
          style={{
            width: 1000,
            height: 64,
            borderRadius: 12,
            overflow: "hidden",
            display: "flex",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: `${35 * barProgress}%`,
              backgroundColor: colors.green,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {barProgress > 0.5 && (
              <span
                style={{
                  fontFamily: fonts.body,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0f1117",
                }}
              >
                30–40% automated
              </span>
            )}
          </div>
          <div
            style={{
              width: `${65 * barProgress}%`,
              backgroundColor: colors.amber,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {barProgress > 0.5 && (
              <span
                style={{
                  fontFamily: fonts.body,
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0f1117",
                }}
              >
                60–70% manual
              </span>
            )}
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={60}>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 32,
            color: colors.textPrimary,
            textAlign: "center",
            lineHeight: 1.6,
            marginTop: 50,
            maxWidth: 900,
          }}
        >
          The tool saves real time on mechanical transforms.
        </div>
      </FadeIn>

      <FadeIn delay={80}>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 28,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 1.6,
            marginTop: 16,
            maxWidth: 900,
          }}
        >
          Treat its output as a starting point, not a finished migration.
        </div>
      </FadeIn>

      <FadeIn delay={110}>
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 20,
            color: colors.blue,
            textAlign: "center",
            marginTop: 60,
            opacity: 0.6,
          }}
        >
          PF6 Migration Automation — Effectiveness Scorecard
        </div>
      </FadeIn>
    </AbsoluteFill>
  );
};

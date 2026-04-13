import React from "react";
import { colors, fonts } from "../styles";
import { FadeIn } from "./FadeIn";
import { AnimatedNumber } from "./AnimatedNumber";

type StatCardProps = {
  value: number;
  label: string;
  description: string;
  color: string;
  delay?: number;
  suffix?: string;
};

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  description,
  color,
  delay = 0,
  suffix = "",
}) => {
  return (
    <FadeIn delay={delay}>
      <div
        style={{
          background: colors.codeBg,
          borderRadius: 16,
          padding: "32px 36px",
          borderLeft: `5px solid ${color}`,
          flex: 1,
        }}
      >
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 14,
            fontWeight: 700,
            color,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          {label}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <AnimatedNumber
            value={value}
            delay={delay + 5}
            fontSize={56}
            color={colors.textPrimary}
            suffix={suffix}
          />
        </div>
        <div
          style={{
            fontSize: 18,
            color: colors.textSecondary,
            marginTop: 8,
          }}
        >
          {description}
        </div>
      </div>
    </FadeIn>
  );
};

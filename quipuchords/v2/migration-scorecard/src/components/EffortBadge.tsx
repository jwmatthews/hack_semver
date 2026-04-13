import React from "react";
import { colors, fonts } from "../styles";

type EffortBadgeProps = {
  level: "trivial" | "moderate" | "significant";
};

const BADGE_STYLES: Record<
  EffortBadgeProps["level"],
  { bg: string; text: string }
> = {
  trivial: { bg: colors.codeGreenBg, text: colors.green },
  moderate: { bg: "#2a2215", text: colors.amber },
  significant: { bg: colors.codeRedBg, text: colors.red },
};

export const EffortBadge: React.FC<EffortBadgeProps> = ({ level }) => {
  const style = BADGE_STYLES[level];
  return (
    <span
      style={{
        fontFamily: fonts.body,
        fontSize: 14,
        fontWeight: 600,
        color: style.text,
        backgroundColor: style.bg,
        padding: "4px 12px",
        borderRadius: 12,
      }}
    >
      {level}
    </span>
  );
};

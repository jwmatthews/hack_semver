import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { colors, fonts } from "../styles";

type HighlightSegment = {
  text: string;
  color: string;
};

type CodeLine = string | HighlightSegment[];

type CodeBlockProps = {
  lines: CodeLine[];
  bgColor?: string;
  delay?: number;
  staggerFrames?: number;
  title?: string;
  titleColor?: string;
  fontSize?: number;
};

const renderLine = (line: CodeLine): React.ReactNode => {
  if (typeof line === "string") {
    return <span style={{ color: colors.textPrimary }}>{line}</span>;
  }
  return line.map((seg, i) => (
    <span key={i} style={{ color: seg.color }}>
      {seg.text}
    </span>
  ));
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  lines,
  bgColor = colors.codeBg,
  delay = 0,
  staggerFrames = 3,
  title,
  titleColor = colors.textSecondary,
  fontSize = 22,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        background: bgColor,
        borderRadius: 12,
        padding: "24px 28px",
        flex: 1,
      }}
    >
      {title && (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 16,
            fontWeight: 600,
            color: titleColor,
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {title}
        </div>
      )}
      <pre
        style={{
          fontFamily: fonts.code,
          fontSize,
          lineHeight: 1.6,
          margin: 0,
          whiteSpace: "pre-wrap",
        }}
      >
        {lines.map((line, i) => {
          const lineDelay = delay + i * staggerFrames;
          const opacity = interpolate(
            frame,
            [lineDelay, lineDelay + 8],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.out(Easing.cubic),
            },
          );
          return (
            <div key={i} style={{ opacity }}>
              {renderLine(line)}
            </div>
          );
        })}
      </pre>
    </div>
  );
};

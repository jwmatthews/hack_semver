// migration-scorecard/src/styles.ts
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: interFamily } = loadInter("normal", {
  weights: ["400", "600", "700"],
  subsets: ["latin"],
});

const { fontFamily: monoFamily } = loadJetBrainsMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const fonts = {
  heading: monoFamily,
  body: interFamily,
  code: monoFamily,
} as const;

export const colors = {
  bg: "#0f1117",
  green: "#4ade80",
  amber: "#f59e0b",
  red: "#ef4444",
  blue: "#60a5fa",
  textPrimary: "#e0e0e0",
  textSecondary: "#6b7280",
  codeBg: "#1a1a2e",
  codeRedBg: "#2a1515",
  codeGreenBg: "#152a15",
} as const;

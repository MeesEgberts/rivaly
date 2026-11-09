import { RESULT_COLORS } from "./result-colors";
import type { Jersey } from "@modules/cycling/stage-profile";

/** Truikleuren zoals in de Tour; vaste kleuren, ook in dark mode. */
export const JERSEY_COLORS: Record<Jersey, string> = {
  yellow: "#F7C600",
  green: "#1E9E52",
  polka: "#FFFFFF",
  white: "#FFFFFF",
};

export const POLKA_DOT_COLOR = "#E0262B";

/** Podiumblokken: goud, zilver, brons. */
export const PODIUM_COLORS: Record<number, string> = {
  1: "#D4A017",
  2: "#9AA3AD",
  3: "#B8733F",
};

export const HIT_COLORS = {
  exact: RESULT_COLORS.exact,
  inTop: RESULT_COLORS.partial,
} as const;

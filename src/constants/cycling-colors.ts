import { RESULT_COLORS } from "./result-colors";
import type { Jersey } from "@modules/cycling/stage-profile";

/** Truikleuren zoals in de Tour; vaste kleuren, ook in dark mode. */
export const JERSEY_COLORS: Record<Jersey, string> = {
  yellow: "#F7C600",
  green: "#1E9E52",
  polka: "#FFFFFF",
  white: "#FFFFFF",
  pink: "#F2559B",
  purple: "#7B3FA0",
  blue: "#1F6FD1",
  red: "#D6202B",
  polkaBlue: "#FFFFFF",
};

/** Kleur van de bollen op een bolletjestrui. */
export const POLKA_DOT_COLORS: Partial<Record<Jersey, string>> = {
  polka: "#E0262B",
  polkaBlue: "#1F6FD1",
};

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

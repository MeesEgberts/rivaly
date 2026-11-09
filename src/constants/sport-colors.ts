/**
 * Kleur per sport voor het rondje met sporticoon, zoals Apple Kaarten een
 * kleur per soort plek heeft. Gebruikt als een evenement geen logo heeft.
 */
export const SPORT_COLORS: Record<string, string> = {
  cycling: "#FF9500",
  football: "#34C759",
};

export const DEFAULT_SPORT_COLOR = "#007AFF";

/**
 * Achtergrond van gegroepeerde schermen in licht en donker, als vaste
 * kleur: een kleurverloop kan geen systeemkleur gebruiken.
 */
export const GROUPED_BACKGROUND = {
  light: "rgba(242,242,247,",
  dark: "rgba(0,0,0,",
} as const;

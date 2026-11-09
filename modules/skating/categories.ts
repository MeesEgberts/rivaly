/**
 * Categorie van een schaatsafstand en van een atleet: mannen, vrouwen of
 * een aflossingsploeg. Een vraag met een pool zoekt alleen in atleten van
 * dezelfde categorie, zodat je bij de 500 m vrouwen geen mannen vindt.
 */
export const SKATING_CATEGORIES = {
  men: { label: "Mannen", symbol: "♂" },
  women: { label: "Vrouwen", symbol: "♀" },
  relayMen: { label: "Aflossing mannen", symbol: "♂" },
  relayWomen: { label: "Aflossing vrouwen", symbol: "♀" },
  relayMixed: { label: "Aflossing gemengd", symbol: "⚥" },
} as const;

export type SkatingCategory = keyof typeof SKATING_CATEGORIES;

export function isSkatingCategory(value: string): value is SkatingCategory {
  return value in SKATING_CATEGORIES;
}

export function isRelayCategory(category: string): boolean {
  return category.startsWith("relay");
}

/** "500 m", "1.500 m" of "10.000 m". */
export function formatDistance(meters: number): string {
  return `${meters.toLocaleString("nl-NL")} m`;
}

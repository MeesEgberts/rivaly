/**
 * Categorie van een schaatsafstand en van een atleet: mannen, vrouwen of
 * een aflossingsploeg. Een vraag met een pool zoekt alleen in atleten van
 * dezelfde categorie, zodat je bij de 500 m vrouwen geen mannen vindt.
 * `figure` is een SF Symbol: een man, een vrouw, of beide bij gemengd.
 */
export const SKATING_CATEGORIES = {
  men: { label: "Mannen", figure: "figure.stand" },
  women: { label: "Vrouwen", figure: "figure.stand.dress" },
  relayMen: { label: "Aflossing mannen", figure: "figure.stand" },
  relayWomen: { label: "Aflossing vrouwen", figure: "figure.stand.dress" },
  relayMixed: {
    label: "Aflossing gemengd",
    figure: "figure.stand.dress.line.vertical.figure",
  },
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

/** Soort race: een afstand, de massastart, een aflossing of een klassement (EK). */
export type SkatingFormat =
  "distance" | "massstart" | "relay" | "sprint" | "allround";

const FORMATS = new Set<string>(["massstart", "relay", "sprint", "allround"]);

export function skatingFormat(format: string | undefined): SkatingFormat {
  return format && FORMATS.has(format) ? (format as SkatingFormat) : "distance";
}

/** SF Symbol per soort race, ook als icoon van de vraag. */
export const SKATING_FORMAT_ICONS: Record<SkatingFormat, string> = {
  distance: "stopwatch",
  massstart: "flag.pattern.checkered",
  relay: "person.3.sequence.fill",
  sprint: "bolt.fill",
  allround: "list.number",
};

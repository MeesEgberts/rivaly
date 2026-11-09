import type { EventSeries, ScoringPreset, SportModule } from "../types";

export const cyclingStageKinds = {
  /** Vooraf in te vullen klassementen: eindklassement, truien, ploegen. */
  classification: "classification",
  /** Etappes van een ronde, één fase per week. */
  stages: "stages",
  /** Een eendagskoers: podium en extra vragen. */
  race: "race",
} as const;

/**
 * Dezelfde sleutels als bij voetbal, zodat één poule voetbal en wielrennen
 * kan combineren met één puntentelling.
 */
export const cyclingPresets: ScoringPreset[] = [
  {
    key: "classic",
    name: "Klassiek",
    description:
      "Renner op de juiste plek 5 · wel in de top maar andere plek 2 · keuzevraag 5",
    rules: {
      ranking: { exactPosition: 5, inTopN: 2 },
      pick: { points: 5 },
      numeric: { exact: 5, within: 2, tolerance: 1 },
    },
  },
  {
    key: "allOrNothing",
    name: "Alles of niets",
    description:
      "Alleen een renner op precies de juiste plek telt: 5 punten · keuzevraag 5",
    rules: {
      ranking: { exactPosition: 5, inTopN: 0 },
      pick: { points: 5 },
      numeric: { exact: 5, within: 0, tolerance: 0 },
    },
  },
];

export const cyclingSeries: EventSeries[] = [
  {
    key: "grandTours",
    memberName: "Grote ronde",
    name: "Grote rondes",
    description: "Giro, Tour en Vuelta",
    icon: "map",
  },
  {
    key: "monuments",
    memberName: "Monument",
    name: "Monumenten",
    description: "Sanremo, Vlaanderen, Roubaix, Luik en Lombardije",
    icon: "building.columns",
  },
  {
    key: "springClassics",
    memberName: "Voorjaarsklassieker",
    name: "Voorjaarsklassiekers",
    description: "Van de Omloop tot Luik-Bastenaken-Luik",
    icon: "leaf",
  },
  {
    key: "cobbledClassics",
    memberName: "Kasseiklassieker",
    name: "Kasseiklassiekers",
    description: "De Vlaamse koersen en Parijs-Roubaix",
    icon: "square.grid.3x3",
  },
  {
    key: "ardennesClassics",
    memberName: "Ardennenklassieker",
    name: "Ardennenklassiekers",
    description: "Amstel, Waalse Pijl en Luik",
    icon: "mountain.2",
  },
];

export const cyclingModule: SportModule = {
  key: "cycling",
  name: "Wielrennen",
  icon: "bicycle",
  fixtureTypes: ["ranking", "pick", "numeric"],
  stageKinds: Object.values(cyclingStageKinds),
  presets: cyclingPresets,
  series: cyclingSeries,
  athleteNoun: { singular: "renner", plural: "renners" },
};

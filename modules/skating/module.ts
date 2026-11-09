import type { ScoringPreset, SportModule } from "../types";

/** Fases van een schaatstoernooi; "bonus" deelt de Extra-tab met voetbal. */
export const skatingStageKinds = {
  /** De afstanden, elk met een podium als vraag. */
  distances: "distances",
  /** Extra vragen: aantal medailles, beste Nederlander. */
  bonus: "bonus",
} as const;

/** Zelfde sleutels als voetbal en wielrennen, zodat sporten in één poule passen. */
export const skatingPresets: ScoringPreset[] = [
  {
    key: "classic",
    name: "Klassiek",
    description:
      "Schaatser op de juiste plek 5 · wel op het podium maar andere plek 2 · keuzevraag 5",
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
      "Alleen een schaatser op precies de juiste plek telt: 5 punten · keuzevraag 5",
    rules: {
      ranking: { exactPosition: 5, inTopN: 0 },
      pick: { points: 5 },
      numeric: { exact: 5, within: 0, tolerance: 0 },
    },
  },
];

const stageKinds = Object.values(skatingStageKinds);

/** Langebaanschaatsen: afstanden van 500 m tot 10.000 m en de massastart. */
export const speedskatingModule: SportModule = {
  key: "speedskating",
  name: "Schaatsen",
  icon: "figure.ice.skating",
  fixtureTypes: ["ranking", "pick", "numeric"],
  stageKinds,
  presets: skatingPresets,
  athleteNoun: { singular: "schaatser", plural: "schaatsers" },
};

/** Shorttrack: 500, 1000 en 1500 m en de aflossingen. */
export const shorttrackModule: SportModule = {
  key: "shorttrack",
  name: "Shorttrack",
  icon: "figure.ice.skating",
  fixtureTypes: ["ranking", "pick", "numeric"],
  stageKinds,
  presets: skatingPresets,
  athleteNoun: { singular: "shorttracker", plural: "shorttrackers" },
};

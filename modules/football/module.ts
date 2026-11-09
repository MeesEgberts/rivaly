import type { ScoringPreset, SportModule } from "../types";

export const footballStageKinds = {
  /** Poule-/groepsfase: tabel plus wedstrijden. */
  group: "group",
  /** Knock-out: toernooischema. */
  knockout: "knockout",
  /** Het hele knock-outschema vooraf invullen (onderdeel van type bracket). */
  bracket: "bracket",
  /** Speelronde van een competitie, bijv. Eredivisie. */
  matchday: "matchday",
  /** Bonusvragen: kampioen, topscorer, enzovoort. */
  bonus: "bonus",
} as const;

export const footballPresets: ScoringPreset[] = [
  {
    key: "classic",
    name: "Klassiek",
    description: "Exacte uitslag 5 · juiste toto 2 · juist doelsaldo +1 · bonusvraag 5",
    rules: {
      score: { exact: 5, outcome: 2, goalDifference: 1 },
      pick: { points: 5 },
      ranking: { exactPosition: 3, inTopN: 1 },
      bracket: { groupPosition: 1, perRound: [2, 4, 6, 8], champion: 10 },
    },
  },
  {
    key: "allOrNothing",
    name: "Alles of niets",
    description: "Alleen de exacte uitslag telt: 3 punten · bonusvraag 5",
    rules: {
      score: { exact: 3, outcome: 0, goalDifference: 0 },
      pick: { points: 5 },
      ranking: { exactPosition: 3, inTopN: 0 },
      bracket: { groupPosition: 0, perRound: [3, 5, 8, 10], champion: 15 },
    },
  },
];

export const footballModule: SportModule = {
  key: "football",
  name: "Voetbal",
  icon: "soccerball",
  fixtureTypes: ["score", "pick", "ranking", "numeric", "bracket"],
  stageKinds: Object.values(footballStageKinds),
  presets: footballPresets,
};

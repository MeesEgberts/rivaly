import { describe, expect, it } from "vitest";

import { bracketFixtureType, type BracketPayload, type BracketValue } from "./bracket";
import {
  championOf,
  emptyBracketValue,
  pickWinner,
  resolveBracket,
  setGroupOrder,
} from "./bracket-tree";
import { computeGroupTable } from "../football/group-table";
import { scorePrediction, defaultRules } from "../registry";

/** Twee groepen van vier, halve finales 1A–2B en 1B–2A, finale. */
const payload: BracketPayload = {
  type: "bracket",
  groups: [
    { key: "A", name: "Groep A", teamIds: ["ned", "bel", "ger", "fra"] },
    { key: "B", name: "Groep B", teamIds: ["esp", "por", "ita", "eng"] },
  ],
  rounds: [
    {
      key: "sf",
      name: "Halve finale",
      matches: [
        {
          id: "sf1",
          home: { kind: "group", group: "A", position: 1 },
          away: { kind: "group", group: "B", position: 2 },
        },
        {
          id: "sf2",
          home: { kind: "group", group: "B", position: 1 },
          away: { kind: "group", group: "A", position: 2 },
        },
      ],
    },
    {
      key: "final",
      name: "Finale",
      matches: [
        {
          id: "f",
          home: { kind: "winner", matchId: "sf1" },
          away: { kind: "winner", matchId: "sf2" },
        },
      ],
    },
  ],
};

function filled(): BracketValue {
  let value = setGroupOrder(payload, emptyBracketValue, "A", ["ned", "bel", "ger", "fra"]);
  value = setGroupOrder(payload, value, "B", ["esp", "por", "ita", "eng"]);
  value = pickWinner(payload, value, "sf1", "ned");
  value = pickWinner(payload, value, "sf2", "esp");
  value = pickWinner(payload, value, "f", "ned");

  return value;
}

describe("bracket-boom", () => {
  it("vult de halve finales uit de groepsvolgorde", () => {
    const resolved = resolveBracket(payload, filled());

    expect(resolved[0].matches[0]).toMatchObject({ home: "ned", away: "por" });
    expect(resolved[0].matches[1]).toMatchObject({ home: "esp", away: "bel" });
    expect(championOf(resolved)).toBe("ned");
  });

  it("wist alleen de keuzes die na een groepswijziging niet meer kloppen", () => {
    const changed = setGroupOrder(payload, filled(), "A", ["ger", "bel", "ned", "fra"]);

    expect(changed.winners).toEqual([{ matchId: "sf2", winnerId: "esp" }]);
  });

  it("wist de finale als de winnaar van een halve finale verandert", () => {
    const changed = pickWinner(payload, filled(), "sf1", "por");
    const resolved = resolveBracket(payload, changed);

    expect(resolved[1].matches[0]).toMatchObject({ home: "por", away: "esp", winner: null });
  });
});

describe("bracket-validatie", () => {
  it("accepteert een gedeeltelijk ingevuld schema", () => {
    const partial = pickWinner(payload, filled(), "sf1", "por");

    expect(() => bracketFixtureType.assertPredictionFits(payload, partial)).not.toThrow();
  });

  it("weigert een winnaar die de wedstrijd niet speelt", () => {
    const invalid: BracketValue = {
      ...filled(),
      winners: [{ matchId: "sf1", winnerId: "esp" }],
    };

    expect(() => bracketFixtureType.assertPredictionFits(payload, invalid)).toThrow();
  });

  it("weigert een groep met ontbrekende teams", () => {
    const invalid: BracketValue = {
      ...emptyBracketValue,
      groups: [{ group: "A", order: ["ned", "bel", "ger"] }],
    };

    expect(() => bracketFixtureType.assertPredictionFits(payload, invalid)).toThrow();
  });
});

describe("bracket-scoring", () => {
  const rules = { groupPosition: 1, perRound: [2, 4], champion: 10 };

  it("geeft punten per juiste groepsplek, per team per ronde en voor de kampioen", () => {
    const outcome = bracketFixtureType.score({
      prediction: filled(),
      result: filled(),
      rules,
      payload,
    });

    expect(outcome.breakdown).toEqual({
      groupPosition: 8,
      round_sf: 8,
      round_final: 8,
      champion: 10,
    });
    expect(outcome.points).toBe(34);
  });

  it("telt een team in de juiste ronde, ook via een ander pad", () => {
    let result = setGroupOrder(payload, emptyBracketValue, "A", ["bel", "ned", "ger", "fra"]);
    result = setGroupOrder(payload, result, "B", ["esp", "por", "ita", "eng"]);

    const outcome = bracketFixtureType.score({
      prediction: filled(),
      result,
      rules,
      payload,
    });

    // ned, bel, esp, por staan allemaal in de halve finale; in groep A
    // kloppen alleen plek 3 en 4, groep B klopt helemaal.
    expect(outcome.breakdown).toEqual({ round_sf: 8, groupPosition: 6 });
  });

  it("werkt via scorePrediction in de registry", () => {
    const outcome = scorePrediction({
      prediction: filled(),
      result: filled(),
      rules: defaultRules,
      payload,
    });

    expect(outcome.points).toBeGreaterThan(0);
  });
});

describe("groepsstand", () => {
  it("sorteert op punten, doelsaldo en goals", () => {
    const table = computeGroupTable(
      ["ned", "bel", "ger", "fra"],
      [
        { homeId: "ned", awayId: "bel", home: 2, away: 0 },
        { homeId: "ger", awayId: "fra", home: 1, away: 1 },
        { homeId: "bel", awayId: "ger", home: 3, away: 0 },
      ],
    );

    expect(table.map((row) => row.teamId)).toEqual(["ned", "bel", "fra", "ger"]);
    expect(table[0]).toMatchObject({ played: 1, won: 1, points: 3 });
  });

  it("houdt de oorspronkelijke volgorde zonder uitslagen", () => {
    const table = computeGroupTable(["a", "b", "c"], []);

    expect(table.map((row) => row.teamId)).toEqual(["a", "b", "c"]);
  });
});

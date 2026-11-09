import { describe, expect, it } from "vitest";

import { numericFixtureType } from "./numeric";
import { pickFixtureType, type PickPayload } from "./pick";
import { rankingFixtureType, type RankingPayload } from "./ranking";
import { scoreFixtureType } from "./score";
import { defaultRules, resolveRules, scorePrediction } from "../registry";
import { footballPresets } from "../football/module";

describe("score", () => {
  const rules = scoreFixtureType.defaultRules;

  it("geeft exact-punten bij de juiste uitslag", () => {
    const outcome = scoreFixtureType.score({
      prediction: { type: "score", home: 2, away: 1 },
      result: { type: "score", home: 2, away: 1 },
      rules,
    });

    expect(outcome).toEqual({ points: 5, breakdown: { exact: 5 } });
  });

  it("geeft toto plus doelsaldo bij juiste winnaar en zelfde verschil", () => {
    const outcome = scoreFixtureType.score({
      prediction: { type: "score", home: 1, away: 0 },
      result: { type: "score", home: 3, away: 2 },
      rules,
    });

    expect(outcome).toEqual({
      points: 3,
      breakdown: { outcome: 2, goalDifference: 1 },
    });
  });

  it("geeft alleen toto bij juiste winnaar en ander verschil", () => {
    const outcome = scoreFixtureType.score({
      prediction: { type: "score", home: 1, away: 0 },
      result: { type: "score", home: 4, away: 0 },
      rules,
    });

    expect(outcome).toEqual({ points: 2, breakdown: { outcome: 2 } });
  });

  it("herkent gelijkspel als toto", () => {
    const outcome = scoreFixtureType.score({
      prediction: { type: "score", home: 0, away: 0 },
      result: { type: "score", home: 2, away: 2 },
      rules,
    });

    expect(outcome.points).toBe(3);
  });

  it("geeft niets bij verkeerde toto", () => {
    const outcome = scoreFixtureType.score({
      prediction: { type: "score", home: 2, away: 0 },
      result: { type: "score", home: 0, away: 1 },
      rules,
    });

    expect(outcome).toEqual({ points: 0, breakdown: {} });
  });

  it("weigert negatieve of halve scores", () => {
    const payload = {
      type: "score" as const,
      homeId: "a",
      awayId: "b",
      allowDraw: true,
    };

    expect(() =>
      scoreFixtureType.assertPredictionFits(payload, {
        type: "score",
        home: -1,
        away: 0,
      }),
    ).toThrow();

    expect(() =>
      scoreFixtureType.assertPredictionFits(payload, {
        type: "score",
        home: 1.5,
        away: 0,
      }),
    ).toThrow();
  });
});

describe("pick", () => {
  const payload: PickPayload = {
    type: "pick",
    options: [
      { id: "ned", label: "Nederland" },
      { id: "bel", label: "België" },
    ],
  };

  it("scoort alleen bij de juiste keuze", () => {
    const rules = { points: 5 };

    expect(
      pickFixtureType.score({
        prediction: { type: "pick", optionId: "ned" },
        result: { type: "pick", optionId: "ned" },
        rules,
      }),
    ).toEqual({ points: 5, breakdown: { correct: 5 } });

    expect(
      pickFixtureType.score({
        prediction: { type: "pick", optionId: "bel" },
        result: { type: "pick", optionId: "ned" },
        rules,
      }).points,
    ).toBe(0);
  });

  it("weigert een onbekende optie", () => {
    expect(() =>
      pickFixtureType.assertPredictionFits(payload, {
        type: "pick",
        optionId: "ger",
      }),
    ).toThrow();
  });
});

describe("ranking", () => {
  const payload: RankingPayload = {
    type: "ranking",
    size: 3,
    options: ["a", "b", "c", "d", "e"].map((id) => ({ id, label: id })),
  };

  it("telt juiste plekken en top-N-treffers op", () => {
    const outcome = rankingFixtureType.score({
      prediction: { type: "ranking", order: ["a", "b", "c"] },
      result: { type: "ranking", order: ["a", "c", "d"] },
      rules: rankingFixtureType.defaultRules,
    });

    // a exact (3), c wel in top 3 (1), b niet in top 3 (0)
    expect(outcome).toEqual({
      points: 4,
      breakdown: { exactPosition: 3, inTopN: 1 },
    });
  });

  it("weigert dubbele deelnemers en verkeerde lengte", () => {
    expect(() =>
      rankingFixtureType.assertPredictionFits(payload, {
        type: "ranking",
        order: ["a", "a", "b"],
      }),
    ).toThrow();

    expect(() =>
      rankingFixtureType.assertPredictionFits(payload, {
        type: "ranking",
        order: ["a", "b"],
      }),
    ).toThrow();
  });
});

describe("numeric", () => {
  const rules = numericFixtureType.defaultRules;

  it("geeft exact, binnen marge of niets", () => {
    const result = { type: "numeric" as const, value: 10 };

    expect(
      numericFixtureType.score({
        prediction: { type: "numeric", value: 10 },
        result,
        rules,
      }).points,
    ).toBe(5);

    expect(
      numericFixtureType.score({
        prediction: { type: "numeric", value: 11 },
        result,
        rules,
      }).points,
    ).toBe(2);

    expect(
      numericFixtureType.score({
        prediction: { type: "numeric", value: 13 },
        result,
        rules,
      }).points,
    ).toBe(0);
  });

  it("bewaakt min en max", () => {
    const payload = { type: "numeric" as const, min: 0, max: 20 };

    expect(() =>
      numericFixtureType.assertPredictionFits(payload, {
        type: "numeric",
        value: 21,
      }),
    ).toThrow();
  });
});

describe("registry", () => {
  it("lost regels op als standaard → preset → override", () => {
    const allOrNothing = footballPresets.find(
      (preset) => preset.key === "allOrNothing",
    )!;

    const rules = resolveRules(allOrNothing, { pick: { points: 10 } });

    expect(rules.score).toEqual({ exact: 3, outcome: 0, goalDifference: 0 });
    expect(rules.pick).toEqual({ points: 10 });
    expect(rules.numeric).toEqual(defaultRules.numeric);
  });

  it("geeft 0 punten als voorspelling en uitslag van ander type zijn", () => {
    const outcome = scorePrediction({
      prediction: { type: "pick", optionId: "x" },
      result: { type: "score", home: 1, away: 0 },
      rules: defaultRules,
    });

    expect(outcome.points).toBe(0);
  });

  it("dispatcht naar het juiste type", () => {
    const outcome = scorePrediction({
      prediction: { type: "score", home: 1, away: 0 },
      result: { type: "score", home: 1, away: 0 },
      rules: defaultRules,
    });

    expect(outcome.points).toBe(5);
  });
});

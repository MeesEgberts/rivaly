import { ConvexError, v, type Infer } from "convex/values";

import type { FixtureType } from "../types";

/** Een uitslag tussen twee partijen: thuis–uit. */
export const scorePayloadValidator = v.object({
  type: v.literal("score"),
  homeId: v.string(),
  awayId: v.string(),
  /** Mag het gelijkspel worden? In een knock-out meestal niet. */
  allowDraw: v.boolean(),
});

export const scoreResultValidator = v.object({
  type: v.literal("score"),
  home: v.number(),
  away: v.number(),
  /** Winnaar na verlenging/strafschoppen wanneer de reguliere uitslag gelijk is. */
  winnerId: v.optional(v.string()),
});

export const scorePredictionValidator = v.object({
  type: v.literal("score"),
  home: v.number(),
  away: v.number(),
});

export const scoreRulesValidator = v.object({
  /** Exacte uitslag goed. */
  exact: v.number(),
  /** Juiste toto (winst thuis, gelijk, winst uit). */
  outcome: v.number(),
  /** Bonus bij juiste toto én juist doelsaldo, maar niet exact. */
  goalDifference: v.number(),
});

export type ScorePayload = Infer<typeof scorePayloadValidator>;
export type ScoreResult = Infer<typeof scoreResultValidator>;
export type ScorePrediction = Infer<typeof scorePredictionValidator>;
export type ScoreRules = Infer<typeof scoreRulesValidator>;

function outcomeOf(home: number, away: number): "home" | "draw" | "away" {
  if (home > away) {
    return "home";
  }

  if (home < away) {
    return "away";
  }

  return "draw";
}

function assertWholeNonNegative(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new ConvexError(`${label} moet een geheel getal van 0 of hoger zijn.`);
  }
}

export const scoreFixtureType: FixtureType<
  ScorePayload,
  ScoreResult,
  ScorePrediction,
  ScoreRules
> = {
  key: "score",
  name: "Uitslag",
  defaultRules: { exact: 5, outcome: 2, goalDifference: 1 },

  assertPredictionFits(_payload, prediction) {
    assertWholeNonNegative(prediction.home, "Thuisscore");
    assertWholeNonNegative(prediction.away, "Uitscore");
  },

  assertResultFits(payload, result) {
    assertWholeNonNegative(result.home, "Thuisscore");
    assertWholeNonNegative(result.away, "Uitscore");

    if (result.winnerId !== undefined) {
      const knownIds = [payload.homeId, payload.awayId];

      if (!knownIds.includes(result.winnerId)) {
        throw new ConvexError("De winnaar moet een van de twee partijen zijn.");
      }
    }
  },

  score({ prediction, result, rules }) {
    const exact =
      prediction.home === result.home && prediction.away === result.away;

    if (exact) {
      return { points: rules.exact, breakdown: { exact: rules.exact } };
    }

    const predictedOutcome = outcomeOf(prediction.home, prediction.away);
    const actualOutcome = outcomeOf(result.home, result.away);

    if (predictedOutcome !== actualOutcome) {
      return { points: 0, breakdown: {} };
    }

    const breakdown: Record<string, number> = { outcome: rules.outcome };
    let points = rules.outcome;

    const sameGoalDifference =
      prediction.home - prediction.away === result.home - result.away;

    if (sameGoalDifference && rules.goalDifference > 0) {
      breakdown.goalDifference = rules.goalDifference;
      points += rules.goalDifference;
    }

    return { points, breakdown };
  },
};

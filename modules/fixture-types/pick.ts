import { ConvexError, v, type Infer } from "convex/values";

import type { FixtureType, ScoreOutcome } from "../types";

/**
 * Optie "iemand anders" voor als de winnaar niet in de lijst staat, zoals
 * een verrassende renner. Bij een volgorde mag alleen de uitslag hem
 * gebruiken, en dan ook meerdere keren.
 */
export const OTHER_OPTION_ID = "other";

export const optionValidator = v.object({
  id: v.string(),
  label: v.string(),
});

/**
 * Kiezen uit alle atleten van een sport in plaats van alleen uit `options`.
 * De opties zijn dan de favorieten die bovenaan staan; de server controleert
 * dat een andere keuze echt een atleet van deze sport is.
 */
export const athletePoolValidator = v.object({
  sport: v.string(),
  /** Alleen atleten uit dit land, bijv. "NED" voor "Beste Nederlander". */
  nation: v.optional(v.string()),
});

/** Eén keuze uit een lijst: winnaar van een wedstrijd, kampioen, topscorer, bonusvraag. */
export const pickPayloadValidator = v.object({
  type: v.literal("pick"),
  options: v.array(optionValidator),
  pool: v.optional(athletePoolValidator),
});

export const pickResultValidator = v.object({
  type: v.literal("pick"),
  optionId: v.string(),
});

export const pickPredictionValidator = v.object({
  type: v.literal("pick"),
  optionId: v.string(),
});

export const pickRulesValidator = v.object({
  points: v.number(),
});

export type PickOption = Infer<typeof optionValidator>;
export type AthletePool = Infer<typeof athletePoolValidator>;
export type PickPayload = Infer<typeof pickPayloadValidator>;
export type PickResult = Infer<typeof pickResultValidator>;
export type PickPrediction = Infer<typeof pickPredictionValidator>;
export type PickRules = Infer<typeof pickRulesValidator>;

function assertKnownOption(payload: PickPayload, optionId: string) {
  const known = payload.options.some((option) => option.id === optionId);

  // Met een pool mag het ook een andere atleet zijn; dat checkt de server.
  if (!known && !payload.pool) {
    throw new ConvexError("Die keuze hoort niet bij dit onderdeel.");
  }
}

export const pickFixtureType: FixtureType<
  PickPayload,
  PickResult,
  PickPrediction,
  PickRules
> = {
  key: "pick",
  name: "Keuze",
  defaultRules: { points: 3 },

  assertPredictionFits(payload, prediction) {
    assertKnownOption(payload, prediction.optionId);
  },

  assertResultFits(payload, result) {
    assertKnownOption(payload, result.optionId);
  },

  score({ prediction, result, rules }): ScoreOutcome {
    if (prediction.optionId !== result.optionId) {
      return { points: 0, breakdown: {} };
    }

    return { points: rules.points, breakdown: { correct: rules.points } };
  },
};

/**
 * Gekozen ids die niet in de opties staan en dus een atleet uit de pool
 * moeten zijn. De server zoekt ze op en controleert de sport.
 */
export function idsOutsideOptions(
  options: PickOption[],
  ids: string[],
): string[] {
  const known = new Set(options.map((option) => option.id));

  return [...new Set(ids)].filter(
    (id) => id !== OTHER_OPTION_ID && !known.has(id),
  );
}

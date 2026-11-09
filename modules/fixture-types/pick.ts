import { ConvexError, v, type Infer } from "convex/values";

import type { FixtureType, ScoreOutcome } from "../types";

export const optionValidator = v.object({
  id: v.string(),
  label: v.string(),
});

/** Eén keuze uit een lijst: winnaar van een wedstrijd, kampioen, topscorer, bonusvraag. */
export const pickPayloadValidator = v.object({
  type: v.literal("pick"),
  options: v.array(optionValidator),
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
export type PickPayload = Infer<typeof pickPayloadValidator>;
export type PickResult = Infer<typeof pickResultValidator>;
export type PickPrediction = Infer<typeof pickPredictionValidator>;
export type PickRules = Infer<typeof pickRulesValidator>;

function assertKnownOption(payload: PickPayload, optionId: string) {
  const known = payload.options.some((option) => option.id === optionId);

  if (!known) {
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

import { ConvexError, v, type Infer } from "convex/values";

import type { FixtureType, ScoreOutcome } from "../types";

/** Een getal: totaal aantal goals, aantal medailles, een tijd. */
export const numericPayloadValidator = v.object({
  type: v.literal("numeric"),
  unit: v.optional(v.string()),
  min: v.optional(v.number()),
  max: v.optional(v.number()),
  /** Stapgrootte, bijv. 1 voor hele getallen of 0.01 voor tijden. */
  step: v.optional(v.number()),
});

export const numericResultValidator = v.object({
  type: v.literal("numeric"),
  value: v.number(),
});

export const numericPredictionValidator = v.object({
  type: v.literal("numeric"),
  value: v.number(),
});

export const numericRulesValidator = v.object({
  exact: v.number(),
  /** Punten wanneer de voorspelling binnen `tolerance` van de uitslag ligt. */
  within: v.number(),
  tolerance: v.number(),
});

export type NumericPayload = Infer<typeof numericPayloadValidator>;
export type NumericResult = Infer<typeof numericResultValidator>;
export type NumericPrediction = Infer<typeof numericPredictionValidator>;
export type NumericRules = Infer<typeof numericRulesValidator>;

function assertInRange(payload: NumericPayload, value: number) {
  if (!Number.isFinite(value)) {
    throw new ConvexError("Vul een getal in.");
  }

  if (payload.min !== undefined && value < payload.min) {
    throw new ConvexError(`Het getal moet minimaal ${payload.min} zijn.`);
  }

  if (payload.max !== undefined && value > payload.max) {
    throw new ConvexError(`Het getal mag maximaal ${payload.max} zijn.`);
  }
}

export const numericFixtureType: FixtureType<
  NumericPayload,
  NumericResult,
  NumericPrediction,
  NumericRules
> = {
  key: "numeric",
  name: "Getal",
  defaultRules: { exact: 5, within: 2, tolerance: 1 },

  assertPredictionFits(payload, prediction) {
    assertInRange(payload, prediction.value);
  },

  assertResultFits(payload, result) {
    assertInRange(payload, result.value);
  },

  score({ prediction, result, rules }): ScoreOutcome {
    const distance = Math.abs(prediction.value - result.value);

    if (distance === 0) {
      return { points: rules.exact, breakdown: { exact: rules.exact } };
    }

    if (distance <= rules.tolerance) {
      return { points: rules.within, breakdown: { within: rules.within } };
    }

    return { points: 0, breakdown: {} };
  },
};

import { v, type Infer } from "convex/values";

import {
  bracketPayloadValidator,
  bracketPredictionValidator,
  bracketResultValidator,
  bracketRulesValidator,
} from "./fixture-types/bracket";
import {
  numericPayloadValidator,
  numericPredictionValidator,
  numericResultValidator,
  numericRulesValidator,
} from "./fixture-types/numeric";
import {
  pickPayloadValidator,
  pickPredictionValidator,
  pickResultValidator,
  pickRulesValidator,
} from "./fixture-types/pick";
import {
  rankingPayloadValidator,
  rankingPredictionValidator,
  rankingResultValidator,
  rankingRulesValidator,
} from "./fixture-types/ranking";
import {
  scorePayloadValidator,
  scorePredictionValidator,
  scoreResultValidator,
  scoreRulesValidator,
} from "./fixture-types/score";

/**
 * Samengestelde validators. Omdat elk type een `type`-discriminator draagt,
 * valideert Convex module-data al aan de grens van elke mutation en in het
 * schema, zonder `v.any()`.
 */

export const fixtureTypeKeyValidator = v.union(
  v.literal("score"),
  v.literal("pick"),
  v.literal("ranking"),
  v.literal("numeric"),
  v.literal("bracket"),
);

export const fixturePayloadValidator = v.union(
  scorePayloadValidator,
  pickPayloadValidator,
  rankingPayloadValidator,
  numericPayloadValidator,
  bracketPayloadValidator,
);

export const fixtureResultValidator = v.union(
  scoreResultValidator,
  pickResultValidator,
  rankingResultValidator,
  numericResultValidator,
  bracketResultValidator,
);

export const fixturePredictionValidator = v.union(
  scorePredictionValidator,
  pickPredictionValidator,
  rankingPredictionValidator,
  numericPredictionValidator,
  bracketPredictionValidator,
);

export const rulesOverridesValidator = v.object({
  score: v.optional(scoreRulesValidator),
  pick: v.optional(pickRulesValidator),
  ranking: v.optional(rankingRulesValidator),
  numeric: v.optional(numericRulesValidator),
  bracket: v.optional(bracketRulesValidator),
});

export type FixturePayload = Infer<typeof fixturePayloadValidator>;
export type FixtureResult = Infer<typeof fixtureResultValidator>;
export type FixturePrediction = Infer<typeof fixturePredictionValidator>;
export type RulesOverrides = Infer<typeof rulesOverridesValidator>;

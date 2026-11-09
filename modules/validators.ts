import { v, type Infer } from "convex/values";

import {
  jerseyValidator,
  stageProfileValidator,
} from "./cycling/stage-profile";
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

/** Extra gegevens over een onderdeel, zoals het parcours van een etappe. */
export const fixtureDetailsValidator = v.object({
  /** Bijv. "Lille – Arras". */
  route: v.optional(v.string()),
  distanceKm: v.optional(v.number()),
  profile: v.optional(stageProfileValidator),
  /** Bij een klassementsvraag: welke trui erbij hoort. */
  jersey: v.optional(jerseyValidator),
  /** SF Symbol voor op de kaart, bijv. "trophy.fill" bij "Wie wordt kampioen?". */
  icon: v.optional(v.string()),
});

export type FixtureDetails = Infer<typeof fixtureDetailsValidator>;
export type FixturePayload = Infer<typeof fixturePayloadValidator>;
export type FixtureResult = Infer<typeof fixtureResultValidator>;
export type FixturePrediction = Infer<typeof fixturePredictionValidator>;
export type RulesOverrides = Infer<typeof rulesOverridesValidator>;

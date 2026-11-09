import { ConvexError, v, type Infer } from "convex/values";

import { optionValidator } from "./pick";
import type { FixtureType } from "../types";

/** Een volgorde van de top N: podium, medaillespiegel, eindstand van een groep. */
export const rankingPayloadValidator = v.object({
  type: v.literal("ranking"),
  options: v.array(optionValidator),
  /** Hoeveel plekken worden voorspeld (3 voor een podium). */
  size: v.number(),
});

export const rankingResultValidator = v.object({
  type: v.literal("ranking"),
  order: v.array(v.string()),
});

export const rankingPredictionValidator = v.object({
  type: v.literal("ranking"),
  order: v.array(v.string()),
});

export const rankingRulesValidator = v.object({
  /** Per deelnemer op precies de juiste plek. */
  exactPosition: v.number(),
  /** Per deelnemer die wel in de top N staat maar op een andere plek. */
  inTopN: v.number(),
});

export type RankingPayload = Infer<typeof rankingPayloadValidator>;
export type RankingResult = Infer<typeof rankingResultValidator>;
export type RankingPrediction = Infer<typeof rankingPredictionValidator>;
export type RankingRules = Infer<typeof rankingRulesValidator>;

function assertValidOrder(payload: RankingPayload, order: string[]) {
  if (order.length !== payload.size) {
    throw new ConvexError(`Vul precies ${payload.size} plekken in.`);
  }

  const unique = new Set(order);

  if (unique.size !== order.length) {
    throw new ConvexError("Elke deelnemer mag maar één keer voorkomen.");
  }

  const knownIds = new Set(payload.options.map((option) => option.id));

  for (const id of order) {
    if (!knownIds.has(id)) {
      throw new ConvexError("Een van de gekozen deelnemers hoort niet bij dit onderdeel.");
    }
  }
}

export const rankingFixtureType: FixtureType<
  RankingPayload,
  RankingResult,
  RankingPrediction,
  RankingRules
> = {
  key: "ranking",
  name: "Volgorde",
  defaultRules: { exactPosition: 3, inTopN: 1 },

  assertPredictionFits(payload, prediction) {
    assertValidOrder(payload, prediction.order);
  },

  assertResultFits(payload, result) {
    assertValidOrder(payload, result.order);
  },

  score({ prediction, result, rules }) {
    const breakdown: Record<string, number> = {};
    let points = 0;

    prediction.order.forEach((id, index) => {
      if (result.order[index] === id) {
        points += rules.exactPosition;
        breakdown.exactPosition = (breakdown.exactPosition ?? 0) + rules.exactPosition;
        return;
      }

      if (result.order.includes(id)) {
        points += rules.inTopN;
        breakdown.inTopN = (breakdown.inTopN ?? 0) + rules.inTopN;
      }
    });

    return { points, breakdown };
  },
};

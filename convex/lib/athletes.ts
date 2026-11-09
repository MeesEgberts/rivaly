import { ConvexError } from "convex/values";

import { idsOutsideOptions } from "../../modules/fixture-types/pick";
import { normalizeSearch } from "../../modules/search";
import type {
  FixturePayload,
  FixturePrediction,
  FixtureResult,
} from "../../modules/validators";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

/** Tekst voor de zoekindex: naam, korte naam en land, zonder accenten. */
export function athleteSearchText(
  athlete: Pick<Doc<"athletes">, "name" | "shortName" | "nation">,
): string {
  return normalizeSearch(
    `${athlete.name} ${athlete.shortName} ${athlete.nation}`,
  );
}

/** Ids in een voorspelling of uitslag van een keuze- of volgordevraag. */
export function chosenIds(
  value: FixturePrediction | FixtureResult | null | undefined,
): string[] {
  if (value?.type === "pick") {
    return [value.optionId];
  }

  if (value?.type === "ranking") {
    return value.order;
  }

  return [];
}

/**
 * Ids die een atleet kunnen zijn: de opties plus wat er gekozen is. Ids van
 * gewone deelnemers vallen later vanzelf weg bij het opzoeken.
 */
export function athleteIdsOf(
  payload: FixturePayload,
  values: (FixturePrediction | FixtureResult | null | undefined)[],
): string[] {
  if (payload.type !== "pick" && payload.type !== "ranking") {
    return [];
  }

  return [
    ...payload.options.map((option) => option.id),
    ...values.flatMap(chosenIds),
  ];
}

/**
 * Atleten opgezocht in de vorm van deelnemers, zodat de app ze net zo toont
 * als deelnemers van een evenement. Onbekende ids vallen weg.
 */
export async function athletesAsParticipants(
  ctx: QueryCtx,
  ids: string[],
): Promise<
  {
    _id: string;
    name: string;
    shortName: string;
    code: string;
    imageUrl: string | null;
    groupKey: null;
  }[]
> {
  const result = [];

  for (const id of new Set(ids)) {
    const athleteId = ctx.db.normalizeId("athletes", id);
    const athlete = athleteId ? await ctx.db.get("athletes", athleteId) : null;

    if (athlete) {
      result.push({
        _id: athlete._id as string,
        name: athlete.name,
        shortName: athlete.shortName,
        code: athlete.nation,
        imageUrl: athlete.imageUrl ?? null,
        groupKey: null,
      });
    }
  }

  return result;
}

/**
 * Controleert dat gekozen atleten buiten de favorieten echt bestaan en bij
 * de sport van het onderdeel horen.
 */
export async function assertAthletesInPool(
  ctx: MutationCtx,
  payload: FixturePayload,
  value: FixturePrediction | FixtureResult,
): Promise<void> {
  if (
    (payload.type !== "pick" && payload.type !== "ranking") ||
    !payload.pool
  ) {
    return;
  }

  for (const id of idsOutsideOptions(payload.options, chosenIds(value))) {
    const athleteId: Id<"athletes"> | null = ctx.db.normalizeId("athletes", id);
    const athlete = athleteId ? await ctx.db.get("athletes", athleteId) : null;

    const wrongNation =
      payload.pool.nation !== undefined &&
      athlete?.nation !== payload.pool.nation;

    if (!athlete || athlete.sport !== payload.pool.sport || wrongNation) {
      throw new ConvexError(
        "Een van de gekozen atleten past niet bij deze vraag.",
      );
    }
  }
}

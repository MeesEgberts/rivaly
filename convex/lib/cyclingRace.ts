import { cyclingStageKinds } from "../../modules/cycling/module";
import type { FixtureDetails } from "../../modules/validators";
import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const HOUR = 60 * 60 * 1000;

export const CYCLING_SPORT = "cycling";

export interface RaceFavourite {
  id: Id<"athletes">;
  label: string;
  nation: string;
}

export interface OneDayRaceInput {
  name: string;
  shortName?: string;
  slug: string;
  startsAt: number;
  visibility: Doc<"events">["visibility"];
  /** Alleen bij een eigen koers van een poule. */
  ownerPouleId?: Id<"poules">;
  createdBy: Id<"users">;
  series: string[];
  /** Parcours: route, afstand en profiel. */
  details: FixtureDetails;
  /** Renners die bovenaan staan; andere renners vind je via zoeken. */
  favourites: RaceFavourite[];
  /** Ook "Beste Nederlander" en "Nederlanders in de top 10" vragen. */
  includeDutchQuestions: boolean;
}

/**
 * Eendagskoers: podium (top 3) uit alle renners, en optioneel de beste
 * Nederlander en het aantal Nederlanders in de top 10. Alles sluit bij de
 * start. Gebruikt door de seed (catalogus) en door poules die zelf een
 * koers aanmaken.
 */
export async function insertOneDayRace(
  ctx: MutationCtx,
  input: OneDayRaceInput,
): Promise<Id<"events">> {
  const eventId = await ctx.db.insert("events", {
    moduleKey: CYCLING_SPORT,
    name: input.name,
    slug: input.slug,
    startsAt: input.startsAt,
    endsAt: input.startsAt + 7 * HOUR,
    status: "upcoming",
    visibility: input.visibility,
    ownerPouleId: input.ownerPouleId,
    createdBy: input.createdBy,
    meta: { shortName: input.shortName, series: input.series },
  });

  const stageId = await ctx.db.insert("stages", {
    eventId,
    key: "race",
    name: "Koers",
    order: 0,
    kind: cyclingStageKinds.race,
  });

  const timing = {
    eventId,
    stageId,
    startsAt: input.startsAt,
    locksAt: input.startsAt,
    status: "scheduled" as const,
  };
  const options = input.favourites.map(({ id, label }) => ({ id, label }));

  await ctx.db.insert("fixtures", {
    ...timing,
    type: "ranking",
    order: 0,
    label: "Podium",
    details: input.details,
    payload: {
      type: "ranking",
      size: 3,
      options,
      pool: { sport: CYCLING_SPORT },
    },
  });

  if (!input.includeDutchQuestions) {
    return eventId;
  }

  const dutch = input.favourites.filter(
    (favourite) => favourite.nation === "NED",
  );

  await ctx.db.insert("fixtures", {
    ...timing,
    type: "pick",
    order: 1,
    label: "Beste Nederlander",
    payload: {
      type: "pick",
      options: dutch.map(({ id, label }) => ({ id, label })),
      pool: { sport: CYCLING_SPORT, nation: "NED" },
    },
  });

  await ctx.db.insert("fixtures", {
    ...timing,
    type: "numeric",
    order: 2,
    label: "Nederlanders in de top 10",
    payload: { type: "numeric", min: 0, max: 10, step: 1 },
  });

  return eventId;
}

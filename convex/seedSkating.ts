import { v } from "convex/values";

import {
  isRelayCategory,
  SKATING_FORMAT_ICONS,
  skatingFormat,
} from "../modules/skating/categories";
import { skatingStageKinds } from "../modules/skating/module";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { athleteSearchText } from "./lib/athletes";
import {
  RELAY_NATIONS,
  SHORTTRACK_2026_27,
  SHORTTRACKERS,
  SPEEDSKATERS,
  SPEEDSKATING_2026_27,
  TEST_SPEEDSKATING,
  type SeedChampionship,
  type SeedDistance,
  type SeedSkater,
} from "./lib/skatingSeedData";
import { firstAdminOrUser } from "./seed";
import { surname } from "./seedCycling";

const HOUR = 60 * 60 * 1000;
const RELAYS = ["relayMen", "relayWomen", "relayMixed"] as const;

/** Atleten op naam per categorie, bijv. "women:Jutta Leerdam" → id. */
type AthleteIds = Map<string, Id<"athletes">>;

const keyOf = (category: string, name: string) => `${category}:${name}`;

async function upsertAthlete(
  ctx: MutationCtx,
  sport: string,
  athlete: {
    name: string;
    shortName: string;
    nation: string;
    category: string;
  },
): Promise<Id<"athletes">> {
  const existing = await ctx.db
    .query("athletes")
    .withIndex("by_sport_and_name", (q) =>
      q.eq("sport", sport).eq("name", athlete.name),
    )
    .take(10);
  const match = existing.find((row) => row.category === athlete.category);

  if (match) {
    return match._id;
  }

  return await ctx.db.insert("athletes", {
    sport,
    ...athlete,
    searchText: athleteSearchText(athlete),
  });
}

/**
 * Zet de schaatsers van een sport in de atletentabel, plus voor shorttrack
 * de aflossingsploegen per categorie. Bestaande worden hergebruikt.
 */
async function upsertSkaters(
  ctx: MutationCtx,
  sport: string,
  skaters: SeedSkater[],
  withRelays: boolean,
): Promise<AthleteIds> {
  const ids: AthleteIds = new Map();

  for (const skater of skaters) {
    ids.set(
      keyOf(skater.category, skater.name),
      await upsertAthlete(ctx, sport, {
        name: skater.name,
        shortName: surname(skater.name),
        nation: skater.nation,
        category: skater.category,
      }),
    );
  }

  if (withRelays) {
    for (const category of RELAYS) {
      for (const team of RELAY_NATIONS) {
        ids.set(
          keyOf(category, team.name),
          await upsertAthlete(ctx, sport, {
            name: team.name,
            shortName: team.name,
            nation: team.nation,
            category,
          }),
        );
      }
    }
  }

  return ids;
}

function favouriteOptions(
  ids: AthleteIds,
  category: string,
  names: string[],
): { id: string; label: string }[] {
  const list = isRelayCategory(category)
    ? RELAY_NATIONS.map((team) => team.name)
    : names;

  return list.map((name) => {
    const id = ids.get(keyOf(category, name));

    if (!id) {
      throw new Error(`${name} (${category}) staat niet in de atletenlijst.`);
    }

    return { id, label: name };
  });
}

const FORMAT_LABELS: Record<string, string> = {
  massstart: "Massastart",
  relay: "Aflossing",
  sprint: "Sprintklassement",
  allround: "Allroundklassement",
};

function distanceLabel(distance: SeedDistance): string {
  return distance.format ? FORMAT_LABELS[distance.format] : "Podium";
}

function distanceDetails(distance: SeedDistance) {
  return {
    distanceM: distance.distanceM,
    format: distance.format,
    category: distance.category,
    icon: SKATING_FORMAT_ICONS[skatingFormat(distance.format)],
  };
}

const MAX_FIXTURES = 100;

/**
 * Bestaand toernooi met dezelfde opbouw: naam, data en tijden bijwerken,
 * zodat voorspellingen blijven staan. Geeft `false` als de opbouw anders is.
 */
async function updateChampionship(
  ctx: MutationCtx,
  eventId: Id<"events">,
  championship: SeedChampionship,
  starts: number[],
): Promise<boolean> {
  const event = await ctx.db.get("events", eventId);
  const fixtures = await ctx.db
    .query("fixtures")
    .withIndex("by_event_and_order", (q) => q.eq("eventId", eventId))
    .take(MAX_FIXTURES);
  const distances = fixtures.filter((fixture) => fixture.type === "ranking");
  const extras = fixtures.filter((fixture) => fixture.type !== "ranking");

  if (!event || distances.length !== championship.distances.length) {
    return false;
  }

  const firstStart = Math.min(...starts);

  await ctx.db.patch("events", eventId, {
    name: championship.name,
    startsAt: firstStart,
    endsAt: Math.max(...starts) + 3 * HOUR,
    meta: {
      ...event.meta,
      shortName: championship.shortName,
      series: championship.series,
    },
  });

  for (const [index, fixture] of distances.entries()) {
    const distance = championship.distances[index];

    await ctx.db.patch("fixtures", fixture._id, {
      label: distanceLabel(distance),
      startsAt: starts[index],
      locksAt: starts[index],
      details: distanceDetails(distance),
    });
  }

  for (const fixture of extras) {
    await ctx.db.patch("fixtures", fixture._id, {
      startsAt: firstStart,
      locksAt: firstStart,
    });
  }

  return true;
}

/**
 * Een kampioenschap: per afstand een podium (top 3) met een pool van alle
 * atleten van die categorie, plus extra vragen over Nederlandse medailles.
 * Bestaat het al, dan worden naam, data en tijden bijgewerkt.
 */
async function insertChampionship(
  ctx: MutationCtx,
  args: {
    sport: string;
    championship: SeedChampionship;
    slug: string;
    starts: number[];
    ids: AthleteIds;
    createdBy: Id<"users">;
  },
): Promise<Id<"events"> | null> {
  const { sport, championship, starts, ids } = args;
  const existing = await ctx.db
    .query("events")
    .withIndex("by_slug", (q) => q.eq("slug", args.slug))
    .first();

  if (existing) {
    await updateChampionship(ctx, existing._id, championship, starts);
    return null;
  }

  const firstStart = Math.min(...starts);
  const lastStart = Math.max(...starts);

  const eventId = await ctx.db.insert("events", {
    moduleKey: sport,
    name: championship.name,
    slug: args.slug,
    startsAt: firstStart,
    endsAt: lastStart + 3 * HOUR,
    status: "upcoming",
    visibility: "public",
    createdBy: args.createdBy,
    meta: {
      shortName: championship.shortName,
      series: championship.series,
    },
  });

  const distancesStage = await ctx.db.insert("stages", {
    eventId,
    key: "distances",
    name: "Afstanden",
    order: 0,
    kind: skatingStageKinds.distances,
  });
  const bonusStage = await ctx.db.insert("stages", {
    eventId,
    key: "bonus",
    name: "Extra",
    order: 1,
    kind: skatingStageKinds.bonus,
  });

  let order = 0;

  for (const [index, distance] of championship.distances.entries()) {
    const startsAt = starts[index];

    await ctx.db.insert("fixtures", {
      eventId,
      stageId: distancesStage,
      type: "ranking",
      order: order++,
      label: distanceLabel(distance),
      startsAt,
      locksAt: startsAt,
      status: "scheduled",
      details: distanceDetails(distance),
      payload: {
        type: "ranking",
        size: 3,
        options: favouriteOptions(ids, distance.category, distance.favourites),
        pool: { sport, category: distance.category },
      },
    });
  }

  const beforeStart = {
    eventId,
    stageId: bonusStage,
    startsAt: firstStart,
    locksAt: firstStart,
    status: "scheduled" as const,
    type: "numeric" as const,
  };
  const medals = championship.distances.length * 3;

  await ctx.db.insert("fixtures", {
    ...beforeStart,
    order: order++,
    label: "Gouden medailles voor Nederland",
    details: { icon: "medal.fill" },
    payload: { type: "numeric", min: 0, max: championship.distances.length },
  });

  await ctx.db.insert("fixtures", {
    ...beforeStart,
    order: order++,
    label: "Medailles voor Nederland",
    details: { icon: "medal" },
    payload: { type: "numeric", min: 0, max: medals },
  });

  return eventId;
}

/**
 * Het seizoen 2026/27 volgens de ISU-kalender: World Cups, World Tour, EK's
 * en WK's, met alle schaatsers, shorttrackers en aflossingsploegen. Bestaande
 * toernooien worden bijgewerkt, dus opnieuw draaien kan.
 *
 * Draaien: `npx convex run seedSkating:season2026_27`
 */
export const season2026_27 = internalMutation({
  args: {},
  returns: v.array(v.id("events")),
  handler: async (ctx) => {
    const createdBy = await firstAdminOrUser(ctx);
    const created: Id<"events">[] = [];
    const sports = [
      {
        sport: "speedskating",
        skaters: SPEEDSKATERS,
        relays: false,
        season: SPEEDSKATING_2026_27,
      },
      {
        sport: "shorttrack",
        skaters: SHORTTRACKERS,
        relays: true,
        season: SHORTTRACK_2026_27,
      },
    ];

    for (const { sport, skaters, relays, season } of sports) {
      const ids = await upsertSkaters(ctx, sport, skaters, relays);

      for (const championship of season) {
        const eventId = await insertChampionship(ctx, {
          sport,
          championship,
          slug: `${sport}-${championship.key}`,
          starts: championship.distances.map((distance) =>
            Date.parse(distance.startsAt),
          ),
          ids,
          createdBy,
        });

        if (eventId) {
          created.push(eventId);
        }
      }
    }

    return created;
  },
});

/**
 * Korte schaatstest met vier afstanden, één per uur. De eerste start over
 * `startInHours` uur (standaard 2).
 *
 * Draaien: `npx convex run seedSkating:testSpeedskating`
 */
export const testSpeedskating = internalMutation({
  args: { startInHours: v.optional(v.number()) },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    const createdBy = await firstAdminOrUser(ctx);
    const now = Date.now();
    const first = now + (args.startInHours ?? 2) * HOUR;
    const ids = await upsertSkaters(ctx, "speedskating", SPEEDSKATERS, false);

    const eventId = await insertChampionship(ctx, {
      sport: "speedskating",
      championship: TEST_SPEEDSKATING,
      slug: `speedskating-test-${now}`,
      starts: TEST_SPEEDSKATING.distances.map(
        (_, index) => first + index * HOUR,
      ),
      ids,
      createdBy,
    });

    return eventId!;
  },
});

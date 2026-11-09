import { v } from "convex/values";

import { cyclingStageKinds } from "../modules/cycling/module";
import { OTHER_OPTION_ID } from "../modules/fixture-types/pick";
import type { FixtureDetails } from "../modules/validators";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { athleteSearchText } from "./lib/athletes";
import {
  ALL_RIDERS,
  CLASSICS_2027,
  TEST_TOUR_STAGES,
  TOUR_2027_STAGE_DATES,
  TOUR_CLASSIFICATIONS,
  TOUR_RIDERS,
  TOUR_TEAMS,
  TOUR_WEEK_STARTS,
  type SeedClassic,
  type SeedRider,
  type SeedStage,
} from "./lib/cyclingSeedData";
import { firstAdminOrUser } from "./seed";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type RiderIds = Map<string, Id<"athletes">>;

const SPORT = "cycling";
const POOL = { sport: SPORT };

/**
 * "Mathieu van der Poel" → "Van der Poel", voor in krappe rijen. Zonder
 * voornaam krijgt het tussenvoegsel een hoofdletter.
 */
export function surname(name: string): string {
  const short = surnameParts(name);

  return short.charAt(0).toUpperCase() + short.slice(1);
}

function surnameParts(name: string): string {
  const parts = name.split(" ");
  const tussenvoegsels = new Set(["van", "der", "de", "del", "den"]);
  const firstSurnamePart = parts.findIndex(
    (part, index) => index > 0 && tussenvoegsels.has(part.toLowerCase()),
  );

  if (firstSurnamePart > 0) {
    return parts.slice(firstSurnamePart).join(" ");
  }

  return parts.slice(1).join(" ") || name;
}

/**
 * Zet alle renners in de atletentabel (bestaande worden hergebruikt) en
 * geeft hun ids terug op naam.
 */
async function upsertRiders(ctx: MutationCtx): Promise<RiderIds> {
  const ids: RiderIds = new Map();

  for (const seedRider of ALL_RIDERS) {
    const existing = await ctx.db
      .query("athletes")
      .withIndex("by_sport_and_name", (q) =>
        q.eq("sport", SPORT).eq("name", seedRider.name),
      )
      .unique();

    if (existing) {
      ids.set(seedRider.name, existing._id);
      continue;
    }

    const athlete = {
      sport: SPORT,
      name: seedRider.name,
      shortName: surname(seedRider.name),
      nation: seedRider.nation,
    };

    ids.set(
      seedRider.name,
      await ctx.db.insert("athletes", {
        ...athlete,
        searchText: athleteSearchText(athlete),
      }),
    );
  }

  return ids;
}

/**
 * Favorieten voor een vraag met een pool. Andere renners vind je via
 * zoeken, dus een optie "Andere renner" is niet nodig.
 */
function riderOptions(riders: SeedRider[], ids: RiderIds) {
  return riders.map((rider) => {
    const id = ids.get(rider.name);

    if (!id) {
      throw new Error(`${rider.name} staat niet in de atletenlijst.`);
    }

    return { id, label: rider.name };
  });
}

async function eventExists(ctx: MutationCtx, slug: string): Promise<boolean> {
  const existing = await ctx.db
    .query("events")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();

  return existing !== null;
}

/**
 * Eendagskoers: podium (top 3), beste Nederlander en het aantal
 * Nederlanders in de top 10. Alles sluit bij de start.
 */
async function insertClassic(
  ctx: MutationCtx,
  classic: SeedClassic,
  riderIds: RiderIds,
  createdBy: Id<"users">,
): Promise<Id<"events"> | null> {
  const slug = `cycling-${classic.key}-2027`;

  if (await eventExists(ctx, slug)) {
    return null;
  }

  const startsAt = Date.parse(classic.startsAt);

  const eventId = await ctx.db.insert("events", {
    moduleKey: "cycling",
    name: classic.name,
    slug,
    startsAt,
    endsAt: startsAt + 7 * HOUR,
    status: "upcoming",
    visibility: "public",
    createdBy,
    meta: { shortName: classic.shortName, series: classic.series },
  });

  const dutchRiders = classic.riders.filter((rider) => rider.nation === "NED");

  const stageId = await ctx.db.insert("stages", {
    eventId,
    key: "race",
    name: "Koers",
    order: 0,
    kind: cyclingStageKinds.race,
  });

  const details: FixtureDetails = {
    route: classic.route,
    distanceKm: classic.distanceKm,
    profile: classic.profile,
  };
  const timing = {
    eventId,
    stageId,
    startsAt,
    locksAt: startsAt,
    status: "scheduled" as const,
  };

  await ctx.db.insert("fixtures", {
    ...timing,
    type: "ranking",
    order: 0,
    label: "Podium",
    details,
    payload: {
      type: "ranking",
      size: 3,
      options: riderOptions(classic.riders, riderIds),
      pool: POOL,
    },
  });

  if (dutchRiders.length > 0) {
    await ctx.db.insert("fixtures", {
      ...timing,
      type: "pick",
      order: 1,
      label: "Beste Nederlander",
      payload: {
        type: "pick",
        options: riderOptions(dutchRiders, riderIds),
        pool: { sport: SPORT, nation: "NED" },
      },
    });
  }

  await ctx.db.insert("fixtures", {
    ...timing,
    type: "numeric",
    order: 2,
    label: "Nederlanders in de top 10",
    payload: { type: "numeric", min: 0, max: 10, step: 1 },
  });

  return eventId;
}

interface GrandTourInput {
  name: string;
  shortName: string;
  slug: string;
  stages: SeedStage[];
  /** Etappenummers waarop een nieuwe week begint, bijv. [1, 10, 16]. */
  weekStarts: number[];
  series: string[];
  riderIds: RiderIds;
  createdBy: Id<"users">;
}

/**
 * Grote ronde: vooraf de klassementen (eindklassement, truien, ploeg,
 * Nederlandse etappezeges), daarna per etappe de top 3. Een etappe sluit
 * bij haar eigen start, zodat je elke dag opnieuw kunt invullen.
 */
async function insertGrandTour(
  ctx: MutationCtx,
  input: GrandTourInput,
): Promise<Id<"events"> | null> {
  const { riderIds } = input;
  if (await eventExists(ctx, input.slug)) {
    return null;
  }

  const stageStarts = input.stages.map((stage) => Date.parse(stage.startsAt));
  const firstStart = stageStarts[0];
  const lastStart = stageStarts[stageStarts.length - 1];

  const eventId = await ctx.db.insert("events", {
    moduleKey: "cycling",
    name: input.name,
    slug: input.slug,
    startsAt: firstStart,
    endsAt: lastStart + 6 * HOUR,
    status: "upcoming",
    visibility: "public",
    createdBy: input.createdBy,
    meta: { shortName: input.shortName, series: input.series },
  });

  const classificationStage = await ctx.db.insert("stages", {
    eventId,
    key: "classifications",
    name: "Klassementen",
    order: 0,
    kind: cyclingStageKinds.classification,
  });

  const weekStages: Id<"stages">[] = [];

  for (let index = 0; index < input.weekStarts.length; index += 1) {
    weekStages.push(
      await ctx.db.insert("stages", {
        eventId,
        key: `week-${index + 1}`,
        name: `Week ${index + 1}`,
        order: index + 1,
        kind: cyclingStageKinds.stages,
      }),
    );
  }

  const beforeStart = {
    eventId,
    stageId: classificationStage,
    startsAt: firstStart,
    locksAt: firstStart,
    status: "scheduled" as const,
  };
  let order = 0;

  await ctx.db.insert("fixtures", {
    ...beforeStart,
    type: "ranking",
    order: order++,
    label: "Eindklassement top 5",
    details: { jersey: "yellow" },
    payload: {
      type: "ranking",
      size: 5,
      options: riderOptions(TOUR_CLASSIFICATIONS.gc, riderIds),
      pool: POOL,
    },
  });

  const jerseys = [
    {
      label: "Groene trui",
      jersey: "green" as const,
      riders: TOUR_CLASSIFICATIONS.points,
    },
    {
      label: "Bolletjestrui",
      jersey: "polka" as const,
      riders: TOUR_CLASSIFICATIONS.mountains,
    },
    {
      label: "Witte trui",
      jersey: "white" as const,
      riders: TOUR_CLASSIFICATIONS.youth,
    },
  ];

  for (const jersey of jerseys) {
    await ctx.db.insert("fixtures", {
      ...beforeStart,
      type: "pick",
      order: order++,
      label: jersey.label,
      details: { jersey: jersey.jersey },
      payload: {
        type: "pick",
        options: riderOptions(jersey.riders, riderIds),
        pool: POOL,
      },
    });
  }

  await ctx.db.insert("fixtures", {
    ...beforeStart,
    type: "pick",
    order: order++,
    label: "Beste ploeg (etappezeges)",
    details: { icon: "person.3.fill" },
    payload: {
      type: "pick",
      options: [
        ...TOUR_TEAMS.map((team, index) => ({
          id: `team-${index}`,
          label: team,
        })),
        { id: OTHER_OPTION_ID, label: "Andere ploeg" },
      ],
    },
  });

  await ctx.db.insert("fixtures", {
    ...beforeStart,
    type: "numeric",
    order: order++,
    label: "Etappezeges NL",
    payload: { type: "numeric", min: 0, max: input.stages.length, step: 1 },
  });

  const stageOptions = riderOptions(TOUR_RIDERS, riderIds);

  for (const [index, stage] of input.stages.entries()) {
    const stageNumber = index + 1;
    const week =
      input.weekStarts.filter((start) => start <= stageNumber).length - 1;
    const startsAt = stageStarts[index];

    await ctx.db.insert("fixtures", {
      eventId,
      stageId: weekStages[week],
      type: "ranking",
      order: order++,
      label: `Etappe ${stageNumber}`,
      startsAt,
      locksAt: startsAt,
      status: "scheduled",
      details: {
        route: stage.route,
        distanceKm: stage.distanceKm,
        profile: stage.profile,
      },
      payload: { type: "ranking", size: 3, options: stageOptions, pool: POOL },
    });
  }

  return eventId;
}

/**
 * Wielerkalender 2027: alle voorjaarsklassiekers, de monumenten en de Tour
 * de France. Slaat koersen over die al bestaan, dus opnieuw draaien kan.
 *
 * Draaien: `npx convex run seedCycling:calendar2027`
 */
export const calendar2027 = internalMutation({
  args: {},
  returns: v.array(v.id("events")),
  handler: async (ctx) => {
    const createdBy = await firstAdminOrUser(ctx);
    const riderIds = await upsertRiders(ctx);
    const created: Id<"events">[] = [];

    for (const classic of CLASSICS_2027) {
      const eventId = await insertClassic(ctx, classic, riderIds, createdBy);

      if (eventId) {
        created.push(eventId);
      }
    }

    const tour = await insertGrandTour(ctx, {
      name: "Tour de France 2027",
      shortName: "Tour",
      slug: "cycling-tour-de-france-2027",
      stages: TOUR_2027_STAGE_DATES.map((date) => ({
        startsAt: `${date}T13:00:00+02:00`,
      })),
      weekStarts: TOUR_WEEK_STARTS,
      series: ["grandTours"],
      riderIds,
      createdBy,
    });

    if (tour) {
      created.push(tour);
    }

    return created;
  },
});

/**
 * Korte testronde van vijf etappes, één per dag. De eerste etappe start over
 * `startInHours` uur (standaard 2), zodat je locken en uitslagen kunt testen.
 *
 * Draaien: `npx convex run seedCycling:testTour`
 */
export const testTour = internalMutation({
  args: { startInHours: v.optional(v.number()) },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    const createdBy = await firstAdminOrUser(ctx);
    const riderIds = await upsertRiders(ctx);
    const now = Date.now();
    const firstStart = now + (args.startInHours ?? 2) * HOUR;

    const eventId = await insertGrandTour(ctx, {
      name: "Rivaly Testronde",
      shortName: "Testronde",
      slug: `cycling-test-tour-${now}`,
      stages: TEST_TOUR_STAGES.map((stage, index) => ({
        ...stage,
        startsAt: new Date(firstStart + index * DAY).toISOString(),
      })),
      weekStarts: [1],
      series: [],
      riderIds,
      createdBy,
    });

    return eventId!;
  },
});

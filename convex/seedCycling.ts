import { v } from "convex/values";

import { cyclingStageKinds } from "../modules/cycling/module";
import { OTHER_OPTION_ID } from "../modules/fixture-types/pick";
import type { FixtureDetails } from "../modules/validators";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx } from "./_generated/server";
import {
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

type RiderIds = Map<string, Id<"participants">>;

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

async function insertRiders(
  ctx: MutationCtx,
  eventId: Id<"events">,
  riders: SeedRider[],
): Promise<RiderIds> {
  const ids: RiderIds = new Map();

  for (const rider of riders) {
    const id = await ctx.db.insert("participants", {
      eventId,
      name: rider.name,
      shortName: surname(rider.name),
      code: rider.nation,
    });

    ids.set(rider.name, id);
  }

  return ids;
}

/** Opties voor een keuze- of volgordevraag, met "Andere renner" achteraan. */
function riderOptions(
  riders: SeedRider[],
  ids: RiderIds,
  otherLabel = "Andere renner",
) {
  return [
    ...riders.map((rider) => {
      const id = ids.get(rider.name);

      if (!id) {
        throw new Error(`${rider.name} staat niet in de deelnemerslijst.`);
      }

      return { id, label: rider.name };
    }),
    { id: OTHER_OPTION_ID, label: otherLabel },
  ];
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

  const riderIds = await insertRiders(ctx, eventId, classic.riders);
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
        options: riderOptions(dutchRiders, riderIds, "Andere Nederlander"),
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

  const riderIds = await insertRiders(ctx, eventId, TOUR_RIDERS);

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
      payload: { type: "pick", options: riderOptions(jersey.riders, riderIds) },
    });
  }

  await ctx.db.insert("fixtures", {
    ...beforeStart,
    type: "pick",
    order: order++,
    label: "Beste ploeg (etappezeges)",
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
      payload: { type: "ranking", size: 3, options: stageOptions },
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
    const created: Id<"events">[] = [];

    for (const classic of CLASSICS_2027) {
      const eventId = await insertClassic(ctx, classic, createdBy);

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
      createdBy,
    });

    return eventId!;
  },
});

import { v } from "convex/values";

import { cyclingStageKinds } from "../modules/cycling/module";
import { JERSEYS, type Jersey } from "../modules/cycling/stage-profile";
import type { Id } from "./_generated/dataModel";
import { internalMutation, type MutationCtx } from "./_generated/server";
import { athleteSearchText } from "./lib/athletes";
import { insertOneDayRace } from "./lib/cyclingRace";
import {
  ALL_RIDERS,
  CLASSICS_2027,
  GIRO_2027_STAGE_DATES,
  GIRO_WEEK_STARTS,
  TEST_TOUR_STAGES,
  TOUR_2027_STAGE_DATES,
  TOUR_CLASSIFICATIONS,
  TOUR_RIDERS,
  GRAND_TOUR_TEAMS,
  LEGACY_TOUR_TEAMS,
  TOUR_WEEK_STARTS,
  VUELTA_2027_STAGE_DATES,
  VUELTA_WEEK_STARTS,
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

const MAX_PARTICIPANTS = 100;

/**
 * Zet alle ploegen als deelnemers in het evenement (bestaande worden
 * hergebruikt op code) en geeft ze terug als keuzes voor een vraag.
 */
async function insertTeams(
  ctx: MutationCtx,
  eventId: Id<"events">,
): Promise<{ id: string; label: string }[]> {
  const existing = await ctx.db
    .query("participants")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .take(MAX_PARTICIPANTS);
  const byCode = new Map(
    existing.map((participant) => [participant.code, participant._id]),
  );
  const options: { id: string; label: string }[] = [];

  for (const seedTeam of GRAND_TOUR_TEAMS) {
    const id =
      byCode.get(seedTeam.code) ??
      (await ctx.db.insert("participants", {
        eventId,
        name: seedTeam.name,
        shortName: seedTeam.shortName,
        code: seedTeam.code,
      }));

    options.push({ id, label: seedTeam.name });
  }

  return options;
}

/**
 * Eenmalig: rondes van vóór de ploegen deelnemers waren. De ploegvraag krijgt
 * alle ploegen (met logo) en geen "Andere ploeg" meer; voorspellingen op een
 * oude ploeg gaan mee, "Andere ploeg" vervalt.
 *
 * Draaien: `npx convex run seedCycling:teamsAsParticipants`
 */
export const teamsAsParticipants = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const events = await ctx.db.query("events").take(200);
    let converted = 0;

    for (const event of events) {
      if (event.moduleKey !== "cycling") {
        continue;
      }

      const fixtures = await ctx.db
        .query("fixtures")
        .withIndex("by_event_and_order", (q) => q.eq("eventId", event._id))
        .take(200);

      for (const fixture of fixtures) {
        const payload = fixture.payload;
        const isLegacy =
          payload.type === "pick" &&
          payload.options.some((option) => option.id.startsWith("team-"));

        if (!isLegacy) {
          continue;
        }

        const options = await insertTeams(ctx, event._id);
        const idByName = new Map(options.map((option) => [option.label, option.id]));
        const remap = (id: string) => {
          const index = Number(id.replace("team-", ""));
          return idByName.get(LEGACY_TOUR_TEAMS[index] ?? "") ?? null;
        };

        await ctx.db.patch("fixtures", fixture._id, {
          payload: { type: "pick", options },
        });

        const predictions = await ctx.db
          .query("predictions")
          .withIndex("by_fixture", (q) => q.eq("fixtureId", fixture._id))
          .take(1000);

        for (const prediction of predictions) {
          const chosen =
            prediction.payload.type === "pick"
              ? remap(prediction.payload.optionId)
              : null;

          if (chosen) {
            await ctx.db.patch("predictions", prediction._id, {
              payload: { type: "pick", optionId: chosen },
            });
          } else {
            await ctx.db.delete("predictions", prediction._id);
          }
        }

        converted += 1;
      }
    }

    return converted;
  },
});

async function eventExists(ctx: MutationCtx, slug: string): Promise<boolean> {
  const existing = await ctx.db
    .query("events")
    .withIndex("by_slug", (q) => q.eq("slug", slug))
    .first();

  return existing !== null;
}

/** Eendagskoers uit de kalender; de opbouw staat in `lib/cyclingRace.ts`. */
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

  return await insertOneDayRace(ctx, {
    name: classic.name,
    shortName: classic.shortName,
    slug,
    startsAt: Date.parse(classic.startsAt),
    visibility: "public",
    createdBy,
    series: classic.series,
    details: {
      route: classic.route,
      distanceKm: classic.distanceKm,
      profile: classic.profile,
    },
    favourites: classic.riders.map((rider) => ({
      ...riderOptions([rider], riderIds)[0],
      nation: rider.nation,
    })),
    includeDutchQuestions: true,
  });
}

interface GrandTourInput {
  name: string;
  shortName: string;
  slug: string;
  stages: SeedStage[];
  /** Etappenummers waarop een nieuwe week begint, bijv. [1, 10, 16]. */
  weekStarts: number[];
  series: string[];
  /** Truien van deze ronde, bijv. geel/groen/bollen/wit voor de Tour. */
  jerseys: GrandTourJerseys;
  riderIds: RiderIds;
  createdBy: Id<"users">;
}

interface GrandTourJerseys {
  gc: Jersey;
  points: Jersey;
  mountains: Jersey;
  youth: Jersey;
}

const TOUR_JERSEYS: GrandTourJerseys = {
  gc: "yellow",
  points: "green",
  mountains: "polka",
  youth: "white",
};

const GIRO_JERSEYS: GrandTourJerseys = {
  gc: "pink",
  points: "purple",
  mountains: "blue",
  youth: "white",
};

const VUELTA_JERSEYS: GrandTourJerseys = {
  gc: "red",
  points: "green",
  mountains: "polkaBlue",
  youth: "white",
};

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
    details: { jersey: input.jerseys.gc },
    payload: {
      type: "ranking",
      size: 5,
      options: riderOptions(TOUR_CLASSIFICATIONS.gc, riderIds),
      pool: POOL,
    },
  });

  const jerseys = [
    { jersey: input.jerseys.points, riders: TOUR_CLASSIFICATIONS.points },
    { jersey: input.jerseys.mountains, riders: TOUR_CLASSIFICATIONS.mountains },
    { jersey: input.jerseys.youth, riders: TOUR_CLASSIFICATIONS.youth },
  ];

  for (const jersey of jerseys) {
    await ctx.db.insert("fixtures", {
      ...beforeStart,
      type: "pick",
      order: order++,
      label: JERSEYS[jersey.jersey].name,
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
      options: await insertTeams(ctx, eventId),
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
      jerseys: TOUR_JERSEYS,
      riderIds,
      createdBy,
    });

    if (tour) {
      created.push(tour);
    }

    const giro = await insertGrandTour(ctx, {
      name: "Giro d'Italia 2027",
      shortName: "Giro",
      slug: "cycling-giro-d-italia-2027",
      stages: GIRO_2027_STAGE_DATES.map((date) => ({
        startsAt: `${date}T13:00:00+02:00`,
      })),
      weekStarts: GIRO_WEEK_STARTS,
      series: ["grandTours"],
      jerseys: GIRO_JERSEYS,
      riderIds,
      createdBy,
    });

    if (giro) {
      created.push(giro);
    }

    const vuelta = await insertGrandTour(ctx, {
      name: "Vuelta a España 2027",
      shortName: "Vuelta",
      slug: "cycling-vuelta-a-espana-2027",
      stages: VUELTA_2027_STAGE_DATES.map((date) => ({
        startsAt: `${date}T13:00:00+02:00`,
      })),
      weekStarts: VUELTA_WEEK_STARTS,
      series: ["grandTours"],
      jerseys: VUELTA_JERSEYS,
      riderIds,
      createdBy,
    });

    if (vuelta) {
      created.push(vuelta);
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
      jerseys: TOUR_JERSEYS,
      riderIds,
      createdBy,
    });

    return eventId!;
  },
});

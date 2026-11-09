import { ConvexError, v } from "convex/values";

import { countBracketMatches } from "../modules/fixture-types/bracket-tree";
import { assertPredictionFits } from "../modules/registry";
import { fixturePredictionValidator } from "../modules/validators";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { isInPouleWithEvent } from "./lib/access";
import {
  assertAthletesInPool,
  athleteIdsOf,
  athletesAsParticipants,
} from "./lib/athletes";
import { getMembership, requireMembership, requireUser } from "./lib/auth";
import {
  isRevealed,
  memberPredictionsForFixture,
  type MemberPrediction,
} from "./lib/reveal";
import { eventPreview, type EventPreview } from "./lib/eventPreview";
import { eventIdsForUser } from "./lib/userEvents";

const MAX_OPEN_PER_EVENT = 30;
const MAX_OPEN_TOTAL = 50;
const MAX_FIXTURES_PER_EVENT = 500;
const MAX_POULES_PER_FIXTURE = 50;
const MAX_EVENTS_PER_POULE = 20;
const MAX_PARTICIPANTS = 500;
const MAX_SCORES_PER_MEMBER = 2000;

export const save = mutation({
  args: {
    fixtureId: v.id("fixtures"),
    payload: fixturePredictionValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const fixture = await ctx.db.get("fixtures", args.fixtureId);

    if (!fixture) {
      throw new ConvexError("Onderdeel niet gevonden.");
    }

    const now = Date.now();

    if (fixture.status !== "scheduled" || now >= fixture.locksAt) {
      throw new ConvexError(
        "Dit onderdeel is gesloten. Voorspellen kan niet meer.",
      );
    }

    assertPredictionFits(fixture.payload, args.payload);
    await assertAthletesInPool(ctx, fixture.payload, args.payload);

    const allowed = await isInPouleWithEvent(ctx, fixture.eventId, user._id);

    if (!allowed) {
      throw new ConvexError("Je zit in geen enkele poule met dit evenement.");
    }

    const existing = await ctx.db
      .query("predictions")
      .withIndex("by_user_and_fixture", (q) =>
        q.eq("userId", user._id).eq("fixtureId", args.fixtureId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch("predictions", existing._id, {
        payload: args.payload,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("predictions", {
        userId: user._id,
        fixtureId: args.fixtureId,
        eventId: fixture.eventId,
        payload: args.payload,
        updatedAt: now,
      });
    }

    return null;
  },
});

/**
 * "Te voorspellen": alle nog open onderdelen uit alle poules van de
 * gebruiker, gesorteerd op sluitingstijd. `now` komt van de client omdat een
 * query de klok niet mag lezen.
 */
export const open = query({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const eventIds = await eventIdsForUser(ctx, user._id);

    const items: {
      fixtureId: Id<"fixtures">;
      eventId: Id<"events">;
      eventName: string;
      moduleKey: string;
      type: Doc<"fixtures">["type"];
      label: string | null;
      startsAt: number;
      locksAt: number;
      payload: Doc<"fixtures">["payload"];
      details: NonNullable<Doc<"fixtures">["details"]> | null;
      hasPrediction: boolean;
    }[] = [];

    for (const eventId of eventIds) {
      const event = await ctx.db.get("events", eventId);

      if (!event || event.status === "finished") {
        continue;
      }

      const fixtures = await ctx.db
        .query("fixtures")
        .withIndex("by_event_and_locksAt", (q) =>
          q.eq("eventId", eventId).gt("locksAt", args.now),
        )
        .take(MAX_OPEN_PER_EVENT);

      for (const fixture of fixtures) {
        if (fixture.status !== "scheduled") {
          continue;
        }

        const prediction = await ctx.db
          .query("predictions")
          .withIndex("by_user_and_fixture", (q) =>
            q.eq("userId", user._id).eq("fixtureId", fixture._id),
          )
          .unique();

        items.push({
          fixtureId: fixture._id,
          eventId,
          eventName: event.name,
          moduleKey: event.moduleKey,
          type: fixture.type,
          label: fixture.label ?? null,
          startsAt: fixture.startsAt,
          locksAt: fixture.locksAt,
          payload: fixture.payload,
          details: fixture.details ?? null,
          hasPrediction: prediction !== null,
        });
      }
    }

    return items.sort((a, b) => a.locksAt - b.locksAt).slice(0, MAX_OPEN_TOTAL);
  },
});

/**
 * Voorspellingen van poule-leden op één onderdeel. Alleen zichtbaar na
 * sluiting, of altijd als de poule dat zo heeft ingesteld.
 */
export const forFixtureInPoule = query({
  args: {
    pouleId: v.id("poules"),
    fixtureId: v.id("fixtures"),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await requireMembership(ctx, args.pouleId, user._id);

    const poule = await ctx.db.get("poules", args.pouleId);
    const fixture = await ctx.db.get("fixtures", args.fixtureId);

    if (!poule || !fixture) {
      throw new ConvexError("Niet gevonden.");
    }

    if (!isRevealed(poule, fixture, args.now)) {
      return { revealed: false as const, predictions: [] };
    }

    return {
      revealed: true as const,
      predictions: await memberPredictionsForFixture(
        ctx,
        args.pouleId,
        args.fixtureId,
        user._id,
      ),
    };
  },
});

/**
 * Hetzelfde, maar voor élke poule van de gebruiker die dit onderdeel heeft.
 * Voedt de kaart "Jouw poule" onder een voorspelling; het voorspelscherm
 * weet zelf niet vanuit welke poule het geopend is.
 */
export const forFixtureInMyPoules = query({
  args: { fixtureId: v.id("fixtures"), now: v.number() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const fixture = await ctx.db.get("fixtures", args.fixtureId);

    if (!fixture) {
      throw new ConvexError("Onderdeel niet gevonden.");
    }

    const links = await ctx.db
      .query("pouleEvents")
      .withIndex("by_event", (q) => q.eq("eventId", fixture.eventId))
      .take(MAX_POULES_PER_FIXTURE);

    const poules: {
      pouleId: Id<"poules">;
      name: string;
      emoji: string | null;
      revealed: boolean;
      predictions: MemberPrediction[];
    }[] = [];

    for (const link of links) {
      const membership = await getMembership(ctx, link.pouleId, user._id);
      const poule = membership ? await ctx.db.get("poules", link.pouleId) : null;

      if (!poule || poule.status !== "open") {
        continue;
      }

      const revealed = isRevealed(poule, fixture, args.now);

      poules.push({
        pouleId: poule._id,
        name: poule.name,
        emoji: poule.emoji ?? null,
        revealed,
        predictions: revealed
          ? await memberPredictionsForFixture(
              ctx,
              poule._id,
              args.fixtureId,
              user._id,
            )
          : [],
      });
    }

    return poules.sort((a, b) => a.name.localeCompare(b.name, "nl"));
  },
});

/**
 * Alles wat één poulegenoot heeft ingevuld, per evenement van de poule, met
 * de punten die het opleverde. Voorspellingen op nog open onderdelen blijven
 * verborgen (tenzij de poule "altijd" tonen heeft gekozen).
 */
export const forMemberInPoule = query({
  args: {
    pouleId: v.id("poules"),
    userId: v.id("users"),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const me = await requireUser(ctx);
    await requireMembership(ctx, args.pouleId, me._id);
    await requireMembership(ctx, args.pouleId, args.userId);

    const poule = await ctx.db.get("poules", args.pouleId);
    const member = await ctx.db.get("users", args.userId);

    if (!poule || !member) {
      throw new ConvexError("Niet gevonden.");
    }

    const standing = await ctx.db
      .query("standings")
      .withIndex("by_poule_and_user", (q) =>
        q.eq("pouleId", args.pouleId).eq("userId", args.userId),
      )
      .unique();

    const scores = await ctx.db
      .query("scores")
      .withIndex("by_poule_and_user", (q) =>
        q.eq("pouleId", args.pouleId).eq("userId", args.userId),
      )
      .take(MAX_SCORES_PER_MEMBER);
    const pointsByFixture = new Map(
      scores.map((score) => [score.fixtureId, score.points]),
    );

    const links = await ctx.db
      .query("pouleEvents")
      .withIndex("by_poule", (q) => q.eq("pouleId", args.pouleId))
      .take(MAX_EVENTS_PER_POULE);

    const events: {
      eventId: Id<"events">;
      name: string;
      moduleKey: string;
      logoUrl: string | null;
      startsAt: number;
      points: number;
      participants: Awaited<ReturnType<typeof athletesAsParticipants>>;
      fixtures: {
        fixtureId: Id<"fixtures">;
        type: Doc<"fixtures">["type"];
        label: string | null;
        payload: Doc<"fixtures">["payload"];
        locksAt: number;
        result: Doc<"fixtures">["result"] | null;
        /** `false`: nog niet zichtbaar, dus `prediction` is dan altijd leeg. */
        revealed: boolean;
        prediction: Doc<"predictions">["payload"] | null;
        points: number | null;
      }[];
    }[] = [];

    for (const link of links) {
      const event = await ctx.db.get("events", link.eventId);

      if (!event) {
        continue;
      }

      const fixtures = await ctx.db
        .query("fixtures")
        .withIndex("by_event_and_order", (q) => q.eq("eventId", event._id))
        .take(MAX_FIXTURES_PER_EVENT);

      const predictions = await ctx.db
        .query("predictions")
        .withIndex("by_user_and_event", (q) =>
          q.eq("userId", args.userId).eq("eventId", event._id),
        )
        .take(MAX_FIXTURES_PER_EVENT);
      const predictionByFixture = new Map(
        predictions.map((prediction) => [
          prediction.fixtureId,
          prediction.payload,
        ]),
      );

      // Je eigen voorspellingen zie je altijd; die van anderen pas na sluiting.
      const rows = fixtures.map((fixture) => {
        const revealed =
          member._id === me._id || isRevealed(poule, fixture, args.now);
        const prediction = revealed
          ? (predictionByFixture.get(fixture._id) ?? null)
          : null;

        return {
          fixtureId: fixture._id,
          type: fixture.type,
          label: fixture.label ?? null,
          payload: fixture.payload,
          locksAt: fixture.locksAt,
          result: fixture.result ?? null,
          revealed,
          prediction,
          points: pointsByFixture.get(fixture._id) ?? null,
        };
      });

      const participants = await ctx.db
        .query("participants")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .take(MAX_PARTICIPANTS);
      const athletes = await athletesAsParticipants(
        ctx,
        rows.flatMap((row) =>
          athleteIdsOf(row.payload, [row.result, row.prediction]),
        ),
      );

      events.push({
        eventId: event._id,
        name: event.name,
        moduleKey: event.moduleKey,
        logoUrl: event.meta.logoUrl ?? null,
        startsAt: event.startsAt,
        points: rows.reduce((sum, row) => sum + (row.points ?? 0), 0),
        participants: [
          ...participants.map((participant) => ({
            _id: participant._id as string,
            name: participant.name,
            shortName: participant.shortName ?? participant.name,
            code: participant.code ?? "",
            imageUrl: participant.imageUrl ?? null,
            groupKey: null,
          })),
          ...athletes,
        ],
        fixtures: rows,
      });
    }

    return {
      member: {
        userId: member._id,
        name: member.name,
        imageUrl: member.imageUrl ?? null,
        isMe: member._id === me._id,
        points: standing?.points ?? 0,
        rank: standing?.rank ?? 0,
        exact: standing?.stats.exact ?? 0,
      },
      events: events.sort((a, b) => a.startsAt - b.startsAt),
    };
  },
});

/** Een schema telt pas als ingevuld wanneer elke wedstrijd een winnaar heeft. */
function isCompletePrediction(
  payload: Doc<"fixtures">["payload"],
  prediction: Doc<"predictions">["payload"] | undefined,
): boolean {
  if (!prediction) {
    return false;
  }

  if (payload.type === "bracket" && prediction.type === "bracket") {
    return prediction.winners.length === countBracketMatches(payload);
  }

  return true;
}

/**
 * Voortgang per evenement uit alle poules van de gebruiker: hoeveel open
 * onderdelen er nog zijn, hoeveel daarvan al voorspeld, en wanneer het
 * eerstvolgende onvoorspelde onderdeel sluit. Voedt "Jouw toernooien" op
 * het startscherm.
 */
export const overview = query({
  args: { now: v.number() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const eventIds = await eventIdsForUser(ctx, user._id);

    const rows: {
      eventId: Id<"events">;
      name: string;
      moduleKey: string;
      logoUrl: string | null;
      preview: EventPreview;
      open: number;
      predicted: number;
      nextLockAt: number | null;
    }[] = [];

    for (const eventId of eventIds) {
      const event = await ctx.db.get("events", eventId);

      if (!event || event.status === "finished" || event.status === "draft") {
        continue;
      }

      const openFixtures = await ctx.db
        .query("fixtures")
        .withIndex("by_event_and_locksAt", (q) =>
          q.eq("eventId", eventId).gt("locksAt", args.now),
        )
        .take(MAX_FIXTURES_PER_EVENT);

      const predictions = await ctx.db
        .query("predictions")
        .withIndex("by_user_and_event", (q) =>
          q.eq("userId", user._id).eq("eventId", eventId),
        )
        .take(MAX_FIXTURES_PER_EVENT);

      const predictionByFixture = new Map(
        predictions.map((prediction) => [
          prediction.fixtureId,
          prediction.payload,
        ]),
      );

      let open = 0;
      let predicted = 0;
      let nextLockAt: number | null = null;

      for (const fixture of openFixtures) {
        if (fixture.status !== "scheduled") {
          continue;
        }

        open += 1;

        if (
          isCompletePrediction(
            fixture.payload,
            predictionByFixture.get(fixture._id),
          )
        ) {
          predicted += 1;
          continue;
        }

        if (nextLockAt === null || fixture.locksAt < nextLockAt) {
          nextLockAt = fixture.locksAt;
        }
      }

      rows.push({
        eventId,
        name: event.name,
        moduleKey: event.moduleKey,
        logoUrl: event.meta.logoUrl ?? null,
        preview: eventPreview(event),
        open,
        predicted,
        nextLockAt,
      });
    }

    return rows.sort(
      (a, b) =>
        (a.nextLockAt ?? Number.MAX_SAFE_INTEGER) -
        (b.nextLockAt ?? Number.MAX_SAFE_INTEGER),
    );
  },
});

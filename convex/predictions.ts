import { ConvexError, v } from "convex/values";

import { countBracketMatches } from "../modules/fixture-types/bracket-tree";
import { assertPredictionFits } from "../modules/registry";
import { fixturePredictionValidator } from "../modules/validators";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { isInPouleWithEvent } from "./lib/access";
import { assertAthletesInPool } from "./lib/athletes";
import { requireMembership, requireUser } from "./lib/auth";
import { eventIdsForUser } from "./lib/userEvents";

const MAX_OPEN_PER_EVENT = 30;
const MAX_OPEN_TOTAL = 50;
const MAX_FIXTURES_PER_EVENT = 500;
const MAX_PREDICTIONS_PER_FIXTURE = 500;

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

    const revealed =
      poule.settings.revealPredictions === "always" ||
      args.now >= fixture.locksAt;

    if (!revealed) {
      return { revealed: false as const, predictions: [] };
    }

    const members = await ctx.db
      .query("pouleMembers")
      .withIndex("by_poule", (q) => q.eq("pouleId", args.pouleId))
      .take(MAX_PREDICTIONS_PER_FIXTURE);

    const predictions: {
      userId: Id<"users">;
      name: string;
      payload: Doc<"predictions">["payload"] | null;
      points: number | null;
    }[] = [];

    for (const member of members) {
      const memberUser = await ctx.db.get("users", member.userId);

      if (!memberUser) {
        continue;
      }

      const prediction = await ctx.db
        .query("predictions")
        .withIndex("by_user_and_fixture", (q) =>
          q.eq("userId", member.userId).eq("fixtureId", args.fixtureId),
        )
        .unique();

      const score = await ctx.db
        .query("scores")
        .withIndex("by_poule_and_fixture_and_user", (q) =>
          q
            .eq("pouleId", args.pouleId)
            .eq("fixtureId", args.fixtureId)
            .eq("userId", member.userId),
        )
        .unique();

      predictions.push({
        userId: memberUser._id,
        name: memberUser.name,
        payload: prediction?.payload ?? null,
        points: score?.points ?? null,
      });
    }

    return { revealed: true as const, predictions };
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

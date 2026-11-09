import { ConvexError, v } from "convex/values";

import { assertResultFits, getModule } from "../modules/registry";
import {
  fixturePayloadValidator,
  fixtureResultValidator,
  fixtureTypeKeyValidator,
} from "../modules/validators";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireEventManager } from "./lib/access";
import { assertAthletesInPool } from "./lib/athletes";
import { requireAdmin } from "./lib/auth";
import { uniqueSlug } from "./lib/slug";

const MAX_FIXTURES = 500;

/**
 * Beheerfuncties voor platformbeheerders (users.isAdmin). In fase 0 worden
 * evenementen en uitslagen hiermee handmatig ingevoerd; importers komen later.
 */

export const listEvents = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const events = await ctx.db.query("events").order("desc").take(100);

    return events.map((event) => ({
      _id: event._id,
      name: event.name,
      moduleKey: event.moduleKey,
      status: event.status,
      visibility: event.visibility,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
    }));
  },
});

export const createEvent = mutation({
  args: {
    moduleKey: v.string(),
    name: v.string(),
    shortName: v.optional(v.string()),
    startsAt: v.number(),
    endsAt: v.number(),
  },
  returns: v.id("events"),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    getModule(args.moduleKey);

    return await ctx.db.insert("events", {
      moduleKey: args.moduleKey,
      name: args.name.trim(),
      slug: await uniqueSlug(ctx, args.name),
      startsAt: args.startsAt,
      endsAt: args.endsAt,
      status: "draft",
      visibility: "public",
      createdBy: admin._id,
      meta: { shortName: args.shortName },
    });
  },
});

export const setEventStatus = mutation({
  args: {
    eventId: v.id("events"),
    status: v.union(
      v.literal("draft"),
      v.literal("upcoming"),
      v.literal("live"),
      v.literal("finished"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("events", args.eventId, { status: args.status });
    return null;
  },
});

export const addStage = mutation({
  args: {
    eventId: v.id("events"),
    key: v.string(),
    name: v.string(),
    order: v.number(),
    kind: v.string(),
  },
  returns: v.id("stages"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const event = await ctx.db.get("events", args.eventId);

    if (!event) {
      throw new ConvexError("Evenement niet gevonden.");
    }

    const module = getModule(event.moduleKey);

    if (!module.stageKinds.includes(args.kind)) {
      throw new ConvexError(`${module.name} kent geen fase van het soort "${args.kind}".`);
    }

    return await ctx.db.insert("stages", args);
  },
});

export const addParticipant = mutation({
  args: {
    eventId: v.id("events"),
    name: v.string(),
    shortName: v.optional(v.string()),
    code: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    groupKey: v.optional(v.string()),
  },
  returns: v.id("participants"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("participants", args);
  },
});

export const addFixture = mutation({
  args: {
    eventId: v.id("events"),
    stageId: v.id("stages"),
    type: fixtureTypeKeyValidator,
    order: v.number(),
    label: v.optional(v.string()),
    startsAt: v.number(),
    locksAt: v.optional(v.number()),
    payload: fixturePayloadValidator,
  },
  returns: v.id("fixtures"),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.payload.type !== args.type) {
      throw new ConvexError("Het type van de inhoud komt niet overeen met het type van het onderdeel.");
    }

    const stage = await ctx.db.get("stages", args.stageId);

    if (!stage || stage.eventId !== args.eventId) {
      throw new ConvexError("Fase hoort niet bij dit evenement.");
    }

    return await ctx.db.insert("fixtures", {
      eventId: args.eventId,
      stageId: args.stageId,
      type: args.type,
      order: args.order,
      label: args.label,
      startsAt: args.startsAt,
      locksAt: args.locksAt ?? args.startsAt,
      status: "scheduled",
      payload: args.payload,
    });
  },
});

/**
 * Voert een (tussen)uitslag in en start de herberekening van alle poules
 * met dit evenement. Een correctie is simpelweg opnieuw aanroepen. Bij een
 * eigen wedstrijd van een poule mag de poule-eigenaar dit ook.
 */
export const setResult = mutation({
  args: {
    fixtureId: v.id("fixtures"),
    result: fixtureResultValidator,
    status: v.union(v.literal("live"), v.literal("finished")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { fixture, event } = await requireManagedFixture(ctx, args.fixtureId);

    assertResultFits(fixture.payload, args.result);
    await assertAthletesInPool(ctx, fixture.payload, args.result);

    await ctx.db.patch("fixtures", args.fixtureId, {
      result: args.result,
      status: args.status,
    });

    await syncOwnedEventStatus(ctx, event);

    await ctx.scheduler.runAfter(0, internal.scoring.recomputeFixture, {
      fixtureId: args.fixtureId,
    });

    return null;
  },
});

export const setFixtureStatus = mutation({
  args: {
    fixtureId: v.id("fixtures"),
    status: v.union(v.literal("scheduled"), v.literal("cancelled")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { event } = await requireManagedFixture(ctx, args.fixtureId);

    await ctx.db.patch("fixtures", args.fixtureId, {
      status: args.status,
      result: undefined,
    });

    await syncOwnedEventStatus(ctx, event);

    await ctx.scheduler.runAfter(0, internal.scoring.recomputeFixture, {
      fixtureId: args.fixtureId,
    });

    return null;
  },
});

/** Het onderdeel met zijn evenement, mits de gebruiker dat mag beheren. */
async function requireManagedFixture(
  ctx: MutationCtx,
  fixtureId: Id<"fixtures">,
) {
  const fixture = await ctx.db.get("fixtures", fixtureId);

  if (!fixture) {
    throw new ConvexError("Onderdeel niet gevonden.");
  }

  const event = await ctx.db.get("events", fixture.eventId);

  if (!event) {
    throw new ConvexError("Evenement niet gevonden.");
  }

  await requireEventManager(ctx, event);

  return { fixture, event };
}

/**
 * Een eigen wedstrijd van een poule heeft geen beheerder die de status
 * bijhoudt: hij gaat "live" bij de eerste uitslag en "finished" zodra elk
 * onderdeel een uitslag heeft of geannuleerd is.
 */
async function syncOwnedEventStatus(ctx: MutationCtx, event: Doc<"events">) {
  if (!event.ownerPouleId) {
    return;
  }

  const fixtures = await ctx.db
    .query("fixtures")
    .withIndex("by_event_and_order", (q) => q.eq("eventId", event._id))
    .take(MAX_FIXTURES);

  const settled = fixtures.filter(
    (fixture) =>
      fixture.status === "finished" || fixture.status === "cancelled",
  );
  const started = fixtures.some((fixture) => fixture.status !== "scheduled");

  const status = !started
    ? "upcoming"
    : settled.length === fixtures.length
      ? "finished"
      : "live";

  if (status !== event.status) {
    await ctx.db.patch("events", event._id, { status });
  }
}

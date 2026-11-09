import { ConvexError, v } from "convex/values";

import { assertResultFits, getModule } from "../modules/registry";
import {
  fixturePayloadValidator,
  fixtureResultValidator,
  fixtureTypeKeyValidator,
} from "../modules/validators";
import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/auth";

/**
 * Beheerfuncties voor platformbeheerders (users.isAdmin). In fase 0 worden
 * evenementen en uitslagen hiermee handmatig ingevoerd; importers komen later.
 */

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

    const baseSlug = slugify(args.name);
    let slug = baseSlug;

    for (let attempt = 2; attempt < 50; attempt += 1) {
      const existing = await ctx.db
        .query("events")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();

      if (!existing) {
        break;
      }

      slug = `${baseSlug}-${attempt}`;
    }

    return await ctx.db.insert("events", {
      moduleKey: args.moduleKey,
      name: args.name.trim(),
      slug,
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
 * met dit evenement. Een correctie is simpelweg opnieuw aanroepen.
 */
export const setResult = mutation({
  args: {
    fixtureId: v.id("fixtures"),
    result: fixtureResultValidator,
    status: v.union(v.literal("live"), v.literal("finished")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const fixture = await ctx.db.get("fixtures", args.fixtureId);

    if (!fixture) {
      throw new ConvexError("Onderdeel niet gevonden.");
    }

    assertResultFits(fixture.payload, args.result);

    await ctx.db.patch("fixtures", args.fixtureId, {
      result: args.result,
      status: args.status,
    });

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
    await requireAdmin(ctx);

    await ctx.db.patch("fixtures", args.fixtureId, {
      status: args.status,
      result: undefined,
    });

    await ctx.scheduler.runAfter(0, internal.scoring.recomputeFixture, {
      fixtureId: args.fixtureId,
    });

    return null;
  },
});

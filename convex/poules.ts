import { ConvexError, v } from "convex/values";

import { getModule, getPreset } from "../modules/registry";
import type { Doc, Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  getMembership,
  requireMembership,
  requirePouleAdmin,
  requireUser,
} from "./lib/auth";
import {
  generateUniqueInviteCode,
  normalizeInviteCode,
} from "./lib/inviteCode";
import { recomputeStandings } from "./lib/standings";

const MAX_EVENTS_PER_POULE = 20;

async function eventsForPoule(
  ctx: QueryCtx | MutationCtx,
  pouleId: Id<"poules">,
) {
  const links = await ctx.db
    .query("pouleEvents")
    .withIndex("by_poule", (q) => q.eq("pouleId", pouleId))
    .take(MAX_EVENTS_PER_POULE);

  const events: {
    _id: Id<"events">;
    name: string;
    moduleKey: string;
    moduleName: string;
    status: Doc<"events">["status"];
    startsAt: number;
    endsAt: number;
    presetKey: string;
    presetName: string;
  }[] = [];

  for (const link of links) {
    const event = await ctx.db.get("events", link.eventId);

    if (!event) {
      continue;
    }

    const module = getModule(event.moduleKey);
    const preset = getPreset(event.moduleKey, link.presetKey);

    events.push({
      _id: event._id,
      name: event.name,
      moduleKey: event.moduleKey,
      moduleName: module.name,
      status: event.status,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      presetKey: link.presetKey,
      presetName: preset.name,
    });
  }

  return events;
}

export const create = mutation({
  args: {
    name: v.string(),
    emoji: v.optional(v.string()),
    eventIds: v.array(v.id("events")),
    presetKey: v.string(),
  },
  returns: v.object({ pouleId: v.id("poules"), inviteCode: v.string() }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const name = args.name.trim();

    if (name.length < 2) {
      throw new ConvexError("Geef de poule een naam van minimaal 2 tekens.");
    }

    if (args.eventIds.length === 0) {
      throw new ConvexError("Kies minimaal één wedstrijd of toernooi.");
    }

    if (args.eventIds.length > MAX_EVENTS_PER_POULE) {
      throw new ConvexError(
        `Een poule kan maximaal ${MAX_EVENTS_PER_POULE} evenementen bevatten.`,
      );
    }

    // Controleer alle evenementen vóór we iets wegschrijven.
    const events: Doc<"events">[] = [];

    for (const eventId of new Set(args.eventIds)) {
      const event = await ctx.db.get("events", eventId);

      if (!event || event.visibility !== "public" || event.status === "draft") {
        throw new ConvexError(
          "Een van de gekozen evenementen is niet beschikbaar.",
        );
      }

      getPreset(event.moduleKey, args.presetKey);
      events.push(event);
    }

    const inviteCode = await generateUniqueInviteCode(ctx);
    const now = Date.now();

    const pouleId = await ctx.db.insert("poules", {
      name,
      emoji: args.emoji,
      ownerId: user._id,
      inviteCode,
      status: "open",
      settings: { revealPredictions: "afterLock" },
    });

    await ctx.db.insert("pouleMembers", {
      pouleId,
      userId: user._id,
      role: "owner",
      joinedAt: now,
    });

    for (const event of events) {
      await ctx.db.insert("pouleEvents", {
        pouleId,
        eventId: event._id,
        presetKey: args.presetKey,
      });
    }

    await recomputeStandings(ctx, pouleId);

    return { pouleId, inviteCode };
  },
});

export const previewByCode = query({
  args: { inviteCode: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const code = normalizeInviteCode(args.inviteCode);

    const poule = await ctx.db
      .query("poules")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", code))
      .unique();

    if (!poule || poule.status !== "open") {
      return null;
    }

    const membership = await getMembership(ctx, poule._id, user._id);
    const owner = await ctx.db.get("users", poule.ownerId);
    const events = await eventsForPoule(ctx, poule._id);

    return {
      pouleId: poule._id,
      name: poule.name,
      emoji: poule.emoji ?? null,
      ownerName: owner?.name ?? "Onbekend",
      events: events.map((event) => ({
        name: event.name,
        moduleKey: event.moduleKey,
        moduleName: event.moduleName,
      })),
      alreadyMember: membership !== null,
    };
  },
});

export const join = mutation({
  args: { inviteCode: v.string() },
  returns: v.id("poules"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const code = normalizeInviteCode(args.inviteCode);

    const poule = await ctx.db
      .query("poules")
      .withIndex("by_inviteCode", (q) => q.eq("inviteCode", code))
      .unique();

    if (!poule || poule.status !== "open") {
      throw new ConvexError("Deze uitnodigingscode is niet (meer) geldig.");
    }

    const existing = await getMembership(ctx, poule._id, user._id);

    if (existing) {
      return poule._id;
    }

    await ctx.db.insert("pouleMembers", {
      pouleId: poule._id,
      userId: user._id,
      role: "member",
      joinedAt: Date.now(),
    });

    await recomputeStandings(ctx, poule._id);

    return poule._id;
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const memberships = await ctx.db
      .query("pouleMembers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100);

    const result: {
      _id: Id<"poules">;
      name: string;
      emoji: string | null;
      role: Doc<"pouleMembers">["role"];
      points: number;
      rank: number;
      eventNames: string[];
    }[] = [];

    for (const membership of memberships) {
      const poule = await ctx.db.get("poules", membership.pouleId);

      if (!poule || poule.status !== "open") {
        continue;
      }

      const standing = await ctx.db
        .query("standings")
        .withIndex("by_poule_and_user", (q) =>
          q.eq("pouleId", poule._id).eq("userId", user._id),
        )
        .unique();

      const events = await eventsForPoule(ctx, poule._id);

      result.push({
        _id: poule._id,
        name: poule.name,
        emoji: poule.emoji ?? null,
        role: membership.role,
        points: standing?.points ?? 0,
        rank: standing?.rank ?? 0,
        eventNames: events.map((event) => event.name),
      });
    }

    return result;
  },
});

export const get = query({
  args: { pouleId: v.id("poules") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const membership = await requireMembership(ctx, args.pouleId, user._id);
    const poule = await ctx.db.get("poules", args.pouleId);

    if (!poule) {
      throw new ConvexError("Poule niet gevonden.");
    }

    const events = await eventsForPoule(ctx, args.pouleId);

    return {
      _id: poule._id,
      name: poule.name,
      emoji: poule.emoji ?? null,
      inviteCode: poule.inviteCode,
      status: poule.status,
      settings: poule.settings,
      myRole: membership.role,
      events,
    };
  },
});

export const members = query({
  args: { pouleId: v.id("poules") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await requireMembership(ctx, args.pouleId, user._id);

    const memberships = await ctx.db
      .query("pouleMembers")
      .withIndex("by_poule", (q) => q.eq("pouleId", args.pouleId))
      .take(200);

    const result: {
      userId: Id<"users">;
      name: string;
      imageUrl: string | null;
      role: Doc<"pouleMembers">["role"];
      joinedAt: number;
      isMe: boolean;
    }[] = [];

    for (const membership of memberships) {
      const member = await ctx.db.get("users", membership.userId);

      if (!member) {
        continue;
      }

      result.push({
        userId: member._id,
        name: member.name,
        imageUrl: member.imageUrl ?? null,
        role: membership.role,
        joinedAt: membership.joinedAt,
        isMe: member._id === user._id,
      });
    }

    return result;
  },
});

export const standings = query({
  args: { pouleId: v.id("poules") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await requireMembership(ctx, args.pouleId, user._id);

    const rows = await ctx.db
      .query("standings")
      .withIndex("by_poule_and_points", (q) => q.eq("pouleId", args.pouleId))
      .order("desc")
      .take(200);

    const result: {
      userId: Id<"users">;
      name: string;
      imageUrl: string | null;
      points: number;
      rank: number;
      exact: number;
      predicted: number;
      isMe: boolean;
    }[] = [];

    for (const row of rows) {
      const member = await ctx.db.get("users", row.userId);

      if (!member) {
        continue;
      }

      result.push({
        userId: member._id,
        name: member.name,
        imageUrl: member.imageUrl ?? null,
        points: row.points,
        rank: row.rank,
        exact: row.stats.exact,
        predicted: row.stats.predicted,
        isMe: member._id === user._id,
      });
    }

    return result;
  },
});

export const updateSettings = mutation({
  args: {
    pouleId: v.id("poules"),
    name: v.optional(v.string()),
    emoji: v.optional(v.string()),
    revealPredictions: v.optional(
      v.union(v.literal("afterLock"), v.literal("always")),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    await requirePouleAdmin(ctx, args.pouleId, user._id);

    const poule = await ctx.db.get("poules", args.pouleId);

    if (!poule) {
      throw new ConvexError("Poule niet gevonden.");
    }

    await ctx.db.patch("poules", args.pouleId, {
      name: args.name?.trim() || poule.name,
      emoji: args.emoji ?? poule.emoji,
      settings: {
        revealPredictions:
          args.revealPredictions ?? poule.settings.revealPredictions,
      },
    });

    return null;
  },
});

export const leave = mutation({
  args: { pouleId: v.id("poules") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const membership = await requireMembership(ctx, args.pouleId, user._id);

    if (membership.role === "owner") {
      throw new ConvexError(
        "De eigenaar kan de poule niet verlaten. Archiveer de poule in plaats daarvan.",
      );
    }

    await ctx.db.delete("pouleMembers", membership._id);

    const standing = await ctx.db
      .query("standings")
      .withIndex("by_poule_and_user", (q) =>
        q.eq("pouleId", args.pouleId).eq("userId", user._id),
      )
      .unique();

    if (standing) {
      await ctx.db.delete("standings", standing._id);
    }

    await recomputeStandings(ctx, args.pouleId);

    return null;
  },
});

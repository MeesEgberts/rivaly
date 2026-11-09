import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";

/**
 * Beeld voor ontwikkeling: portretten van renners en foto's van koersen.
 * In productie vult een beheerder dit (straks via de webversie); dit is
 * alleen om het ontwerp met echt beeld te kunnen beoordelen.
 *
 * Vullen: `node scripts/fetch-commons-images.mjs` (zoekt per renner en koers
 * een vrij gelicentieerde foto op Wikimedia Commons en roept deze functies aan).
 */

const MAX_ATHLETES = 1000;
const MAX_EVENTS = 200;

export const athleteNames = internalQuery({
  args: { sport: v.string() },
  returns: v.array(v.string()),
  handler: async (ctx, args) => {
    const athletes = await ctx.db
      .query("athletes")
      .withIndex("by_sport_and_name", (q) => q.eq("sport", args.sport))
      .take(MAX_ATHLETES);

    return athletes.map((athlete) => athlete.name);
  },
});

export const publicEvents = internalQuery({
  args: {},
  returns: v.array(v.object({ slug: v.string(), name: v.string() })),
  handler: async (ctx) => {
    const events = await ctx.db.query("events").take(MAX_EVENTS);

    return events
      .filter((event) => event.visibility === "public")
      .map((event) => ({ slug: event.slug, name: event.name }));
  },
});

export const setAthleteImages = internalMutation({
  args: {
    sport: v.string(),
    images: v.array(v.object({ name: v.string(), imageUrl: v.string() })),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let updated = 0;

    for (const image of args.images) {
      const athlete = await ctx.db
        .query("athletes")
        .withIndex("by_sport_and_name", (q) =>
          q.eq("sport", args.sport).eq("name", image.name),
        )
        .unique();

      if (athlete) {
        await ctx.db.patch("athletes", athlete._id, {
          imageUrl: image.imageUrl,
        });
        updated += 1;
      }
    }

    return updated;
  },
});

export const setEventImages = internalMutation({
  args: {
    images: v.array(
      v.object({
        slug: v.string(),
        /** `null` haalt de foto weg. */
        imageUrl: v.optional(v.union(v.string(), v.null())),
        logoUrl: v.optional(v.string()),
      }),
    ),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    let updated = 0;

    for (const image of args.images) {
      const event = await ctx.db
        .query("events")
        .withIndex("by_slug", (q) => q.eq("slug", image.slug))
        .unique();

      if (!event) {
        continue;
      }

      await ctx.db.patch("events", event._id, {
        meta: {
          ...event.meta,
          imageUrl:
            image.imageUrl === null
              ? undefined
              : (image.imageUrl ?? event.meta.imageUrl),
          logoUrl: image.logoUrl ?? event.meta.logoUrl,
        },
      });
      updated += 1;
    }

    return updated;
  },
});

/**
 * Clubwapens (of andere afbeeldingen) op deelnemers, op code. Geldt voor
 * alle evenementen van de sport, want dezelfde club staat in meerdere.
 */
export const setParticipantImages = internalMutation({
  args: {
    moduleKey: v.string(),
    images: v.array(v.object({ code: v.string(), imageUrl: v.string() })),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const byCode = new Map(
      args.images.map((image) => [image.code, image.imageUrl]),
    );
    const events = await ctx.db.query("events").take(MAX_EVENTS);
    let updated = 0;

    for (const event of events) {
      if (event.moduleKey !== args.moduleKey) {
        continue;
      }

      const participants = await ctx.db
        .query("participants")
        .withIndex("by_event", (q) => q.eq("eventId", event._id))
        .take(MAX_ATHLETES);

      for (const participant of participants) {
        const imageUrl = participant.code
          ? byCode.get(participant.code)
          : undefined;

        if (imageUrl) {
          await ctx.db.patch("participants", participant._id, { imageUrl });
          updated += 1;
        }
      }
    }

    return updated;
  },
});

import { v } from "convex/values";

import { getPreset, resolveRules, scorePrediction } from "../modules/registry";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";
import { recomputeStandings } from "./lib/standings";

const MAX_POULES_PER_EVENT = 1000;
const MAX_MEMBERS = 500;

/**
 * Stap 1 na een nieuwe uitslag: zoek alle poules met dit evenement en plan
 * per poule een eigen herberekening. Zo blijft elke transactie klein.
 */
export const recomputeFixture = internalMutation({
  args: { fixtureId: v.id("fixtures") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const fixture = await ctx.db.get("fixtures", args.fixtureId);

    if (!fixture) {
      return null;
    }

    const links = await ctx.db
      .query("pouleEvents")
      .withIndex("by_event", (q) => q.eq("eventId", fixture.eventId))
      .take(MAX_POULES_PER_EVENT);

    for (const link of links) {
      await ctx.scheduler.runAfter(0, internal.scoring.recomputePouleFixture, {
        pouleId: link.pouleId,
        fixtureId: args.fixtureId,
      });
    }

    return null;
  },
});

/**
 * Stap 2: rekent voor één poule de punten van één onderdeel uit voor alle
 * leden en werkt daarna de stand bij. Idempotent: opnieuw draaien met
 * dezelfde uitslag geeft dezelfde scores.
 */
export const recomputePouleFixture = internalMutation({
  args: { pouleId: v.id("poules"), fixtureId: v.id("fixtures") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const fixture = await ctx.db.get("fixtures", args.fixtureId);

    if (!fixture) {
      return null;
    }

    const link = await ctx.db
      .query("pouleEvents")
      .withIndex("by_poule_and_event", (q) =>
        q.eq("pouleId", args.pouleId).eq("eventId", fixture.eventId),
      )
      .unique();

    const event = await ctx.db.get("events", fixture.eventId);

    if (!link || !event) {
      return null;
    }

    const preset = getPreset(event.moduleKey, link.presetKey);
    const rules = resolveRules(preset, link.rules);

    const members = await ctx.db
      .query("pouleMembers")
      .withIndex("by_poule", (q) => q.eq("pouleId", args.pouleId))
      .take(MAX_MEMBERS);

    for (const member of members) {
      const existing = await ctx.db
        .query("scores")
        .withIndex("by_poule_and_fixture_and_user", (q) =>
          q
            .eq("pouleId", args.pouleId)
            .eq("fixtureId", args.fixtureId)
            .eq("userId", member.userId),
        )
        .unique();

      const prediction = await ctx.db
        .query("predictions")
        .withIndex("by_user_and_fixture", (q) =>
          q.eq("userId", member.userId).eq("fixtureId", args.fixtureId),
        )
        .unique();

      // Geen uitslag (meer) of geen voorspelling: geen score-document.
      if (!fixture.result || !prediction || fixture.status === "cancelled") {
        if (existing) {
          await ctx.db.delete("scores", existing._id);
        }

        continue;
      }

      const outcome = scorePrediction({
        prediction: prediction.payload,
        result: fixture.result,
        rules,
        payload: fixture.payload,
      });

      const row = {
        pouleId: args.pouleId,
        userId: member.userId,
        fixtureId: args.fixtureId,
        points: outcome.points,
        breakdown: outcome.breakdown,
      };

      if (existing) {
        await ctx.db.replace("scores", existing._id, row);
      } else {
        await ctx.db.insert("scores", row);
      }
    }

    await recomputeStandings(ctx, args.pouleId);

    return null;
  },
});

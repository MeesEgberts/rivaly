import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

/**
 * Verwijdert een eigen koers of wedstrijd van een poule met alles wat erbij
 * hoort: onderdelen, deelnemers, wedstrijden en voorspellingen.
 */
async function deleteCustomEvent(ctx: MutationCtx, eventId: Id<"events">) {
  for await (const fixture of ctx.db
    .query("fixtures")
    .withIndex("by_event_and_order", (q) => q.eq("eventId", eventId))) {
    for await (const prediction of ctx.db
      .query("predictions")
      .withIndex("by_fixture", (q) => q.eq("fixtureId", fixture._id))) {
      await ctx.db.delete("predictions", prediction._id);
    }

    await ctx.db.delete("fixtures", fixture._id);
  }

  for await (const stage of ctx.db
    .query("stages")
    .withIndex("by_event_and_order", (q) => q.eq("eventId", eventId))) {
    await ctx.db.delete("stages", stage._id);
  }

  for await (const participant of ctx.db
    .query("participants")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))) {
    await ctx.db.delete("participants", participant._id);
  }

  await ctx.db.delete("events", eventId);
}

/**
 * Verwijdert een poule met leden, koppelingen, punten, stand en de eigen
 * evenementen van de poule. Catalogus-evenementen en voorspellingen daarop
 * blijven staan; die horen bij de gebruiker, niet bij de poule.
 */
export async function deletePoule(ctx: MutationCtx, pouleId: Id<"poules">) {
  for await (const link of ctx.db
    .query("pouleEvents")
    .withIndex("by_poule", (q) => q.eq("pouleId", pouleId))) {
    await ctx.db.delete("pouleEvents", link._id);

    const event = await ctx.db.get("events", link.eventId);

    if (event?.ownerPouleId === pouleId) {
      await deleteCustomEvent(ctx, event._id);
    }
  }

  for await (const score of ctx.db
    .query("scores")
    .withIndex("by_poule_and_user", (q) => q.eq("pouleId", pouleId))) {
    await ctx.db.delete("scores", score._id);
  }

  for await (const standing of ctx.db
    .query("standings")
    .withIndex("by_poule_and_user", (q) => q.eq("pouleId", pouleId))) {
    await ctx.db.delete("standings", standing._id);
  }

  for await (const member of ctx.db
    .query("pouleMembers")
    .withIndex("by_poule", (q) => q.eq("pouleId", pouleId))) {
    await ctx.db.delete("pouleMembers", member._id);
  }

  await ctx.db.delete("poules", pouleId);
}

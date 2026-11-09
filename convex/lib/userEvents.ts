import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const MAX_POULES = 50;
const MAX_EVENTS_PER_POULE = 20;

/** Alle evenementen uit alle poules waar de gebruiker lid van is. */
export async function eventIdsForUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
): Promise<Set<Id<"events">>> {
  const memberships = await ctx.db
    .query("pouleMembers")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .take(MAX_POULES);

  const eventIds = new Set<Id<"events">>();

  for (const membership of memberships) {
    const links = await ctx.db
      .query("pouleEvents")
      .withIndex("by_poule", (q) => q.eq("pouleId", membership.pouleId))
      .take(MAX_EVENTS_PER_POULE);

    for (const link of links) {
      eventIds.add(link.eventId);
    }
  }

  return eventIds;
}

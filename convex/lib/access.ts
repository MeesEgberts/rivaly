import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getMembership } from "./auth";

type Ctx = QueryCtx | MutationCtx;

const MAX_POULES_CHECKED = 200;

/**
 * Mag deze gebruiker dit evenement zien? Publieke evenementen altijd;
 * privé-evenementen alleen als lid van de poule die het bezit.
 */
export async function assertCanViewEvent(
  ctx: Ctx,
  event: Doc<"events">,
  userId: Id<"users">,
) {
  if (event.visibility === "public") {
    return;
  }

  if (event.ownerPouleId) {
    const membership = await getMembership(ctx, event.ownerPouleId, userId);

    if (membership) {
      return;
    }
  }

  throw new ConvexError("Je hebt geen toegang tot dit evenement.");
}

/** Zit de gebruiker in minstens één poule met dit evenement? */
export async function isInPouleWithEvent(
  ctx: Ctx,
  eventId: Id<"events">,
  userId: Id<"users">,
): Promise<boolean> {
  const links = await ctx.db
    .query("pouleEvents")
    .withIndex("by_event", (q) => q.eq("eventId", eventId))
    .take(MAX_POULES_CHECKED);

  for (const link of links) {
    const membership = await getMembership(ctx, link.pouleId, userId);

    if (membership) {
      return true;
    }
  }

  return false;
}

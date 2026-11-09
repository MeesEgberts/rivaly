import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getMembership, requireUser } from "./auth";

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

/**
 * Wie mag de uitslag van dit onderdeel invoeren? Platformbeheerders altijd;
 * bij een eigen wedstrijd van een poule ook de eigenaar en beheerders van
 * die poule.
 */
export async function canManageEvent(
  ctx: Ctx,
  event: Doc<"events">,
  user: Doc<"users">,
): Promise<boolean> {
  if (user.isAdmin) {
    return true;
  }

  if (!event.ownerPouleId) {
    return false;
  }

  const membership = await getMembership(ctx, event.ownerPouleId, user._id);

  return membership !== null && membership.role !== "member";
}

export async function requireEventManager(
  ctx: Ctx,
  event: Doc<"events">,
): Promise<Doc<"users">> {
  const user = await requireUser(ctx);

  if (!(await canManageEvent(ctx, event, user))) {
    throw new ConvexError(
      "Alleen een beheerder mag uitslagen van dit evenement invoeren.",
    );
  }

  return user;
}

import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function getUserOrNull(ctx: Ctx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
}

export async function requireUser(ctx: Ctx): Promise<Doc<"users">> {
  const user = await getUserOrNull(ctx);

  if (!user) {
    throw new ConvexError("Je bent niet ingelogd.");
  }

  return user;
}

export async function requireAdmin(ctx: Ctx): Promise<Doc<"users">> {
  const user = await requireUser(ctx);

  if (!user.isAdmin) {
    throw new ConvexError("Alleen beheerders mogen dit doen.");
  }

  return user;
}

export async function getMembership(
  ctx: Ctx,
  pouleId: Id<"poules">,
  userId: Id<"users">,
): Promise<Doc<"pouleMembers"> | null> {
  return await ctx.db
    .query("pouleMembers")
    .withIndex("by_poule_and_user", (q) =>
      q.eq("pouleId", pouleId).eq("userId", userId),
    )
    .unique();
}

export async function requireMembership(
  ctx: Ctx,
  pouleId: Id<"poules">,
  userId: Id<"users">,
): Promise<Doc<"pouleMembers">> {
  const membership = await getMembership(ctx, pouleId, userId);

  if (!membership) {
    throw new ConvexError("Je bent geen lid van deze poule.");
  }

  return membership;
}

export async function requirePouleAdmin(
  ctx: Ctx,
  pouleId: Id<"poules">,
  userId: Id<"users">,
): Promise<Doc<"pouleMembers">> {
  const membership = await requireMembership(ctx, pouleId, userId);

  if (membership.role === "member") {
    throw new ConvexError("Alleen de eigenaar of een beheerder van de poule mag dit doen.");
  }

  return membership;
}

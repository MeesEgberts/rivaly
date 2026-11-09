import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getUserOrNull } from "./lib/auth";

/**
 * Wordt bij elke app-start door een ingelogde gebruiker aangeroepen en
 * maakt het users-document aan of werkt het bij. Identiteit en e-mail komen
 * altijd uit het JWT; naam en foto komen uit het JWT en vallen terug op wat
 * de Clerk-client meestuurt.
 */
export const store = mutation({
  args: {
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  returns: v.id("users"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Je bent niet ingelogd.");
    }

    const name =
      identity.name ?? identity.nickname ?? args.name?.trim() ?? "Speler";
    const imageUrl = identity.pictureUrl ?? args.imageUrl;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_token", (q) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique();

    if (existing) {
      await ctx.db.patch("users", existing._id, {
        name,
        email: identity.email ?? existing.email,
        imageUrl: imageUrl ?? existing.imageUrl,
      });

      return existing._id;
    }

    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      name,
      email: identity.email,
      imageUrl,
    });
  },
});

export const me = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUserOrNull(ctx);

    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      name: user.name,
      email: user.email ?? null,
      imageUrl: user.imageUrl ?? null,
      isAdmin: user.isAdmin ?? false,
    };
  },
});

import { v } from "convex/values";

import { normalizeSearch } from "../modules/search";
import { query } from "./_generated/server";
import { requireUser } from "./lib/auth";

const MAX_RESULTS = 30;

/**
 * Zoekt atleten van één sport op naam of land. Een lege zoekterm geeft
 * niets terug; de app toont dan de favorieten van het onderdeel.
 */
export const search = query({
  args: {
    sport: v.string(),
    /** Alleen atleten uit dit land, als de vraag dat vraagt. */
    nation: v.optional(v.string()),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    await requireUser(ctx);
    const term = normalizeSearch(args.query);

    if (term.length === 0) {
      return [];
    }

    const athletes = await ctx.db
      .query("athletes")
      .withSearchIndex("search_text", (q) => {
        const bySport = q.search("searchText", term).eq("sport", args.sport);
        return args.nation ? bySport.eq("nation", args.nation) : bySport;
      })
      .take(MAX_RESULTS);

    return athletes.map((athlete) => ({
      _id: athlete._id,
      name: athlete.name,
      shortName: athlete.shortName,
      nation: athlete.nation,
    }));
  },
});

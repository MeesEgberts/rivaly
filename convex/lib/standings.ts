import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";

const MAX_MEMBERS = 500;
const MAX_SCORES_PER_MEMBER = 2000;

/**
 * Herberekent de stand van één poule uit de scores-tabel en schrijft die
 * gedenormaliseerd weg in `standings`. Gelijke punten delen dezelfde rang.
 *
 * Draait in dezelfde transactie als de aanroeper (join, leave, nieuwe
 * uitslag). Bij honderden leden en duizenden onderdelen verhuist dit naar
 * `@convex-dev/aggregate`; voor fase 0 volstaat een directe som.
 */
export async function recomputeStandings(ctx: MutationCtx, pouleId: Id<"poules">) {
  const members = await ctx.db
    .query("pouleMembers")
    .withIndex("by_poule", (q) => q.eq("pouleId", pouleId))
    .take(MAX_MEMBERS);

  const totals: {
    userId: Id<"users">;
    points: number;
    predicted: number;
    exact: number;
  }[] = [];

  for (const member of members) {
    const scores = await ctx.db
      .query("scores")
      .withIndex("by_poule_and_user", (q) =>
        q.eq("pouleId", pouleId).eq("userId", member.userId),
      )
      .take(MAX_SCORES_PER_MEMBER);

    let points = 0;
    let exact = 0;

    for (const score of scores) {
      points += score.points;

      if ((score.breakdown.exact ?? 0) > 0) {
        exact += 1;
      }
    }

    totals.push({ userId: member.userId, points, predicted: scores.length, exact });
  }

  totals.sort((a, b) => b.points - a.points || b.exact - a.exact);

  let rank = 0;
  let previousPoints: number | null = null;

  for (let index = 0; index < totals.length; index += 1) {
    const total = totals[index];

    if (total.points !== previousPoints) {
      rank = index + 1;
      previousPoints = total.points;
    }

    const existing = await ctx.db
      .query("standings")
      .withIndex("by_poule_and_user", (q) =>
        q.eq("pouleId", pouleId).eq("userId", total.userId),
      )
      .unique();

    const row = {
      pouleId,
      userId: total.userId,
      points: total.points,
      rank,
      stats: { predicted: total.predicted, exact: total.exact },
    };

    if (existing) {
      await ctx.db.replace("standings", existing._id, row);
    } else {
      await ctx.db.insert("standings", row);
    }
  }
}

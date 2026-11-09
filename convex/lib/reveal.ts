import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

const MAX_MEMBERS = 500;

/**
 * Mogen poulegenoten deze voorspelling al zien? Standaard pas na sluiting
 * van het onderdeel; een poule kan kiezen voor "altijd".
 */
export function isRevealed(
  poule: Doc<"poules">,
  fixture: Pick<Doc<"fixtures">, "locksAt">,
  now: number,
): boolean {
  return (
    poule.settings.revealPredictions === "always" || now >= fixture.locksAt
  );
}

export interface MemberPrediction {
  userId: Id<"users">;
  name: string;
  imageUrl: string | null;
  payload: Doc<"predictions">["payload"] | null;
  points: number | null;
  isMe: boolean;
}

/** Alle leden van een poule met hun voorspelling en punten op één onderdeel. */
export async function memberPredictionsForFixture(
  ctx: QueryCtx,
  pouleId: Id<"poules">,
  fixtureId: Id<"fixtures">,
  meId: Id<"users">,
): Promise<MemberPrediction[]> {
  const members = await ctx.db
    .query("pouleMembers")
    .withIndex("by_poule", (q) => q.eq("pouleId", pouleId))
    .take(MAX_MEMBERS);

  const predictions: MemberPrediction[] = [];

  for (const member of members) {
    const memberUser = await ctx.db.get("users", member.userId);

    if (!memberUser) {
      continue;
    }

    const prediction = await ctx.db
      .query("predictions")
      .withIndex("by_user_and_fixture", (q) =>
        q.eq("userId", member.userId).eq("fixtureId", fixtureId),
      )
      .unique();

    const score = await ctx.db
      .query("scores")
      .withIndex("by_poule_and_fixture_and_user", (q) =>
        q
          .eq("pouleId", pouleId)
          .eq("fixtureId", fixtureId)
          .eq("userId", member.userId),
      )
      .unique();

    predictions.push({
      userId: memberUser._id,
      name: memberUser.name,
      imageUrl: memberUser.imageUrl ?? null,
      payload: prediction?.payload ?? null,
      points: score?.points ?? null,
      isMe: memberUser._id === meId,
    });
  }

  // Punten eerst, dan wie wél iets invulde, dan op naam.
  return predictions.sort(
    (a, b) =>
      (b.points ?? -1) - (a.points ?? -1) ||
      Number(b.payload !== null) - Number(a.payload !== null) ||
      a.name.localeCompare(b.name, "nl"),
  );
}

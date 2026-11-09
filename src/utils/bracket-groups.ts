import type {
  BracketGroupOrder,
  BracketPayload,
} from "@modules/fixture-types/bracket";
import {
  computeGroupTable,
  type GroupMatch,
} from "@modules/football/group-table";

import type { EventFixture } from "@/hooks/use-event-data";

/**
 * Groepsvolgorde zoals die volgt uit jouw voorspelde uitslagen. Zonder
 * voorspellingen blijft de volgorde van het schema staan.
 */
export function defaultGroupOrders(
  payload: BracketPayload,
  fixtures: EventFixture[],
): BracketGroupOrder[] {
  return payload.groups.map((group) => {
    const teams = new Set(group.teamIds);
    const scored: GroupMatch[] = [];

    for (const fixture of fixtures) {
      if (
        fixture.payload.type !== "score" ||
        fixture.myPrediction?.type !== "score"
      ) {
        continue;
      }

      const { homeId, awayId } = fixture.payload;

      if (!teams.has(homeId) || !teams.has(awayId)) {
        continue;
      }

      scored.push({
        homeId,
        awayId,
        home: fixture.myPrediction.home,
        away: fixture.myPrediction.away,
      });
    }

    const table = computeGroupTable(group.teamIds, scored);

    return { group: group.key, order: table.map((row) => row.teamId) };
  });
}

export function sameOrder(a: string[] | null, b: string[] | null): boolean {
  if (a === null || b === null) {
    return false;
  }

  return a.length === b.length && a.every((id, index) => b[index] === id);
}

/** Hoeveel teams per groep in het schema doorgaan (hoogste gebruikte positie). */
export function groupQualifiers(payload: BracketPayload): Map<string, number> {
  const counts = new Map<string, number>();

  for (const round of payload.rounds) {
    for (const match of round.matches) {
      for (const source of [match.home, match.away]) {
        if (source.kind !== "group") {
          continue;
        }

        const current = counts.get(source.group) ?? 0;
        counts.set(source.group, Math.max(current, source.position));
      }
    }
  }

  return counts;
}

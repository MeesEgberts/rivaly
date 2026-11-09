import {
  computeGroupTable,
  type GroupMatch,
} from "@modules/football/group-table";

import type { ScoreDraft } from "@/types/score-entry";
import type { MatchRowData } from "@/utils/match-rows";
import {
  UNKNOWN_PARTICIPANT,
  type ParticipantInfo,
} from "@/utils/participants";

/** Teams in de volgorde waarin ze voor het eerst in het programma staan. */
export function teamsOf(matches: MatchRowData[]): string[] {
  const teamIds: string[] = [];

  for (const match of matches) {
    for (const teamId of [match.homeId, match.awayId]) {
      if (!teamIds.includes(teamId)) {
        teamIds.push(teamId);
      }
    }
  }

  return teamIds;
}

/**
 * Stand op basis van jouw voorspellingen: bewaarde scores voor gesloten
 * wedstrijden, en wat je nu intikt voor open wedstrijden.
 */
export function predictedGroupTable(
  matches: MatchRowData[],
  valueOf: (fixtureId: string) => ScoreDraft,
) {
  const scored: GroupMatch[] = [];
  const infoById = new Map<string, ParticipantInfo>();

  for (const match of matches) {
    infoById.set(match.homeId, match.home);
    infoById.set(match.awayId, match.away);

    const value = match.isLocked ? match.prediction : valueOf(match.fixtureId);

    if (value === null || value.home === null || value.away === null) {
      continue;
    }

    scored.push({
      homeId: match.homeId,
      awayId: match.awayId,
      home: value.home,
      away: value.away,
    });
  }

  const rows = computeGroupTable(teamsOf(matches), scored);

  const info = (teamId: string): ParticipantInfo =>
    infoById.get(teamId) ?? UNKNOWN_PARTICIPANT;

  return { rows, info };
}

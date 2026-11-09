import type { EditableMatch, ScoreCell, ScoreDraft } from "@/types/score-entry";

/** Alle invoervakken in leesvolgorde: thuis, uit, volgende wedstrijd. */
export function cellsOf(matches: EditableMatch[]): ScoreCell[] {
  return matches.flatMap((match) => [
    { fixtureId: match.fixtureId, side: "home" as const },
    { fixtureId: match.fixtureId, side: "away" as const },
  ]);
}

export function sameCell(a: ScoreCell | null, b: ScoreCell | null): boolean {
  if (a === null || b === null) {
    return false;
  }

  return a.fixtureId === b.fixtureId && a.side === b.side;
}

export function cellIndex(cells: ScoreCell[], cell: ScoreCell | null): number {
  return cells.findIndex((candidate) => sameCell(candidate, cell));
}

export function isComplete(
  draft: ScoreDraft,
): draft is { home: number; away: number } {
  return draft.home !== null && draft.away !== null;
}

export function differsFromSaved(
  draft: { home: number; away: number },
  saved: EditableMatch["saved"],
): boolean {
  if (saved === null) {
    return true;
  }

  return draft.home !== saved.home || draft.away !== saved.away;
}

/**
 * Groepsstand uit (voorspelde) uitslagen. Pure functie, gedeeld door de
 * groepsweergave en de bracket-builder (die er de groepsvolgorde mee vult).
 */

export interface GroupMatch {
  homeId: string;
  awayId: string;
  home: number;
  away: number;
}

export interface GroupTableRow {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

function emptyRow(teamId: string): GroupTableRow {
  return {
    teamId,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0,
  };
}

function addResult(row: GroupTableRow, scored: number, conceded: number) {
  row.played += 1;
  row.goalsFor += scored;
  row.goalsAgainst += conceded;

  if (scored > conceded) {
    row.won += 1;
    row.points += 3;
    return;
  }

  if (scored === conceded) {
    row.drawn += 1;
    row.points += 1;
    return;
  }

  row.lost += 1;
}

export function goalDifference(row: GroupTableRow): number {
  return row.goalsFor - row.goalsAgainst;
}

/**
 * Sorteert op punten, doelsaldo, gemaakte goals en daarna de oorspronkelijke
 * volgorde van `teamIds`, zodat de stand altijd stabiel is.
 */
export function computeGroupTable(
  teamIds: string[],
  matches: GroupMatch[],
): GroupTableRow[] {
  const rows = new Map(teamIds.map((teamId) => [teamId, emptyRow(teamId)]));

  for (const match of matches) {
    const home = rows.get(match.homeId);
    const away = rows.get(match.awayId);

    if (!home || !away) {
      continue;
    }

    addResult(home, match.home, match.away);
    addResult(away, match.away, match.home);
  }

  const seedOrder = new Map(teamIds.map((teamId, index) => [teamId, index]));

  return [...rows.values()].sort(
    (a, b) =>
      b.points - a.points ||
      goalDifference(b) - goalDifference(a) ||
      b.goalsFor - a.goalsFor ||
      (seedOrder.get(a.teamId) ?? 0) - (seedOrder.get(b.teamId) ?? 0),
  );
}

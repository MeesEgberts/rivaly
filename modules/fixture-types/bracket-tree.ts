import type {
  BracketGroupOrder,
  BracketPayload,
  BracketSlotSource,
  BracketValue,
} from "./bracket";

/**
 * Pure logica om een (voorspelde of echte) bracket "op te lossen": welke
 * teams staan in welke wedstrijd, en wie wint. Gedeeld door server
 * (validatie en scoring) en app (de bracket-builder).
 */

export interface ResolvedMatch {
  id: string;
  home: string | null;
  away: string | null;
  homeSource: BracketSlotSource;
  awaySource: BracketSlotSource;
  /** Alleen gezet als de gekozen winnaar ook echt in deze wedstrijd staat. */
  winner: string | null;
}

export interface ResolvedRound {
  key: string;
  name: string;
  matches: ResolvedMatch[];
}

export const emptyBracketValue: BracketValue = {
  type: "bracket",
  groups: [],
  winners: [],
};

export function groupOrderOf(
  value: BracketValue,
  groupKey: string,
): string[] | null {
  const entry = value.groups.find((group) => group.group === groupKey);

  return entry ? entry.order : null;
}

function resolveSource(
  source: BracketSlotSource,
  value: BracketValue,
  winnersByMatch: Map<string, string | null>,
): string | null {
  if (source.kind === "group") {
    const order = groupOrderOf(value, source.group);

    return order?.[source.position - 1] ?? null;
  }

  return winnersByMatch.get(source.matchId) ?? null;
}

/** Loopt de rondes in volgorde af en vult per wedstrijd de teams en winnaar in. */
export function resolveBracket(
  payload: BracketPayload,
  value: BracketValue,
): ResolvedRound[] {
  const pickedWinners = new Map(
    value.winners.map((pick) => [pick.matchId, pick.winnerId]),
  );
  const winnersByMatch = new Map<string, string | null>();

  return payload.rounds.map((round) => {
    const matches = round.matches.map((match) => {
      const home = resolveSource(match.home, value, winnersByMatch);
      const away = resolveSource(match.away, value, winnersByMatch);
      const picked = pickedWinners.get(match.id) ?? null;
      const isValidPick =
        picked !== null && (picked === home || picked === away);
      const winner = isValidPick ? picked : null;

      winnersByMatch.set(match.id, winner);

      return {
        id: match.id,
        home,
        away,
        homeSource: match.home,
        awaySource: match.away,
        winner,
      };
    });

    return { key: round.key, name: round.name, matches };
  });
}

/**
 * Haalt winnaars weg die niet meer kloppen, bijvoorbeeld nadat een
 * groepsvolgorde of een eerdere winnaar is aangepast.
 */
export function pruneBracket(
  payload: BracketPayload,
  value: BracketValue,
): BracketValue {
  const resolved = resolveBracket(payload, value);
  const winners: BracketValue["winners"] = [];

  for (const round of resolved) {
    for (const match of round.matches) {
      if (match.winner !== null) {
        winners.push({ matchId: match.id, winnerId: match.winner });
      }
    }
  }

  return { ...value, winners };
}

/** Zet de winnaar van één wedstrijd en ruimt daarna alles op wat niet meer klopt. */
export function pickWinner(
  payload: BracketPayload,
  value: BracketValue,
  matchId: string,
  winnerId: string,
): BracketValue {
  const otherWinners = value.winners.filter((pick) => pick.matchId !== matchId);
  const next = {
    ...value,
    winners: [...otherWinners, { matchId, winnerId }],
  };

  return pruneBracket(payload, next);
}

/** Vervangt de volgorde van één groep en ruimt de bracket daarna op. */
export function setGroupOrder(
  payload: BracketPayload,
  value: BracketValue,
  groupKey: string,
  order: string[],
): BracketValue {
  const otherGroups = value.groups.filter((group) => group.group !== groupKey);
  const groups: BracketGroupOrder[] = [
    ...otherGroups,
    { group: groupKey, order },
  ];

  return pruneBracket(payload, { ...value, groups });
}

/** Alle teams die in ronde `roundIndex` spelen. */
export function teamsInRound(
  resolved: ResolvedRound[],
  roundIndex: number,
): Set<string> {
  const teams = new Set<string>();
  const round = resolved[roundIndex];

  if (!round) {
    return teams;
  }

  for (const match of round.matches) {
    if (match.home !== null) {
      teams.add(match.home);
    }

    if (match.away !== null) {
      teams.add(match.away);
    }
  }

  return teams;
}

/** De winnaar van de laatste wedstrijd van de laatste ronde. */
export function championOf(resolved: ResolvedRound[]): string | null {
  const finalRound = resolved[resolved.length - 1];
  const final = finalRound?.matches[finalRound.matches.length - 1];

  return final?.winner ?? null;
}

export function countBracketMatches(payload: BracketPayload): number {
  let count = 0;

  for (const round of payload.rounds) {
    count += round.matches.length;
  }

  return count;
}

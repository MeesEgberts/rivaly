import type { ResolvedRound } from "@modules/fixture-types/bracket-tree";

/** Index van de eerste ronde waarin nog een winnaar gekozen moet worden. */
export function firstOpenRound(resolved: ResolvedRound[]): number {
  const index = resolved.findIndex((round) =>
    round.matches.some((match) => match.winner === null),
  );

  return index === -1 ? resolved.length : index;
}

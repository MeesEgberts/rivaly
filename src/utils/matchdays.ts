import { formatDayHeading } from "./format";
import type { MatchRowData } from "./match-rows";

export interface MatchDay {
  key: string;
  title: string;
  matches: MatchRowData[];
}

/** De eerste speelronde met een open wedstrijd, anders de laatste. */
export function defaultMatchdayIndex(
  rounds: { matches: MatchRowData[] }[],
): number {
  const openIndex = rounds.findIndex((round) =>
    round.matches.some((match) => !match.isLocked),
  );

  if (openIndex !== -1) {
    return openIndex;
  }

  return Math.max(rounds.length - 1, 0);
}

/** Groepeert wedstrijden per speeldag, zoals een programmaboekje. */
export function matchesByDay(matches: MatchRowData[]): MatchDay[] {
  const days: MatchDay[] = [];

  for (const match of matches) {
    const date = new Date(match.startsAt);
    const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const existing = days.find((day) => day.key === key);

    if (existing) {
      existing.matches.push(match);
      continue;
    }

    days.push({
      key,
      title: formatDayHeading(match.startsAt),
      matches: [match],
    });
  }

  return days;
}

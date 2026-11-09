import type { MatchRowData } from "@/utils/match-rows";

export type RoundStatus = "todo" | "done" | "closed";

export interface MatchdayRound {
  stageId: string;
  name: string;
  /** Rondenummer voor de strip, bijv. "12". */
  shortName: string;
  matches: MatchRowData[];
}

/**
 * todo: er staat nog iets open dat je niet hebt voorspeld · done: alles wat
 * open is, is ingevuld · closed: niets meer open.
 */
export function roundStatus(round: MatchdayRound): RoundStatus {
  const open = round.matches.filter((match) => !match.isLocked);

  if (open.length === 0) {
    return "closed";
  }

  const isComplete = open.every((match) => match.prediction !== null);

  return isComplete ? "done" : "todo";
}

/** "Speelronde 12" → "12". */
export function shortRoundName(name: string): string {
  const number = name.match(/\d+/);

  return number ? number[0] : name;
}

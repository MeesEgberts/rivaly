export type ScoreSide = "home" | "away";

export interface ScoreDraft {
  home: number | null;
  away: number | null;
}

export interface ScoreCell {
  fixtureId: string;
  side: ScoreSide;
}

/** Een wedstrijd die (nog) ingevuld kan worden, met wat er al bewaard is. */
export interface EditableMatch {
  fixtureId: string;
  /** Korte omschrijving voor boven het cijferblok, bijv. "NED – GER". */
  label: string;
  saved: { home: number; away: number } | null;
}

export const EMPTY_DRAFT: ScoreDraft = { home: null, away: null };

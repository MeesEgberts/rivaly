import type {
  FixturePayload,
  FixturePrediction,
  FixtureResult,
} from "@modules/validators";

import type { EditableMatch } from "@/types/score-entry";

import {
  participantInfo,
  UNKNOWN_PARTICIPANT,
  type ParticipantInfo,
  type ParticipantMap,
} from "./participants";

interface FixtureLike {
  _id: string;
  startsAt: number;
  locksAt: number;
  status: "scheduled" | "live" | "finished" | "cancelled";
  payload: FixturePayload;
  result: FixtureResult | null;
  myPrediction: FixturePrediction | null;
}

export interface MatchRowData {
  fixtureId: string;
  home: ParticipantInfo;
  away: ParticipantInfo;
  homeId: string;
  awayId: string;
  startsAt: number;
  status: FixtureLike["status"];
  isLocked: boolean;
  result: { home: number; away: number } | null;
  prediction: { home: number; away: number } | null;
}

export function isFixtureOpen(
  fixture: Pick<FixtureLike, "status" | "locksAt">,
  now: number,
) {
  return fixture.status === "scheduled" && now < fixture.locksAt;
}

/** Zet een score-onderdeel om naar wat een wedstrijdrij nodig heeft; `null` voor andere types. */
export function toMatchRow(
  fixture: FixtureLike,
  participants: ParticipantMap,
  now: number,
): MatchRowData | null {
  if (fixture.payload.type !== "score") {
    return null;
  }

  const result = fixture.result?.type === "score" ? fixture.result : null;
  const prediction =
    fixture.myPrediction?.type === "score" ? fixture.myPrediction : null;

  return {
    fixtureId: fixture._id,
    home:
      participantInfo(participants, fixture.payload.homeId) ??
      UNKNOWN_PARTICIPANT,
    away:
      participantInfo(participants, fixture.payload.awayId) ??
      UNKNOWN_PARTICIPANT,
    homeId: fixture.payload.homeId,
    awayId: fixture.payload.awayId,
    startsAt: fixture.startsAt,
    status: fixture.status,
    isLocked: !isFixtureOpen(fixture, now),
    result: result ? { home: result.home, away: result.away } : null,
    prediction: prediction
      ? { home: prediction.home, away: prediction.away }
      : null,
  };
}

export function toMatchRows(
  fixtures: FixtureLike[],
  participants: ParticipantMap,
  now: number,
): MatchRowData[] {
  const rows: MatchRowData[] = [];

  for (const fixture of fixtures) {
    const row = toMatchRow(fixture, participants, now);

    if (row) {
      rows.push(row);
    }
  }

  return rows;
}

/** De open wedstrijden, klaar voor het cijferblok. */
export function toEditableMatches(rows: MatchRowData[]): EditableMatch[] {
  return rows
    .filter((row) => !row.isLocked)
    .map((row) => ({
      fixtureId: row.fixtureId,
      label: `${row.home.name} – ${row.away.name}`,
      saved: row.prediction,
    }));
}

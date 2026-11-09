import type { FunctionReturnType } from "convex/server";

import type { api } from "@convex/_generated/api";

import { describeFixture, describeValue } from "./fixture-text";
import { formatMoment } from "./prediction-cards";
import type { ParticipantMap } from "./participants";

export type MemberPredictions = FunctionReturnType<
  typeof api.predictions.forMemberInPoule
>;
export type MemberEvent = MemberPredictions["events"][number];
export type MemberFixture = MemberEvent["fixtures"][number];

/** Titel van een rij: de wedstrijd ("Ajax – PSV") of de vraag ("Podium"). */
export function memberFixtureTitle(
  fixture: MemberFixture,
  participants: ParticipantMap,
): string {
  return describeFixture(fixture.payload, fixture.label, participants);
}

/**
 * Wat het lid invulde, of waarom je dat (nog) niet ziet. Een gesloten
 * onderdeel zonder voorspelling heet "Niet ingevuld".
 */
export function memberAnswer(
  fixture: MemberFixture,
  participants: ParticipantMap,
): { text: string; isHidden: boolean } {
  if (!fixture.revealed) {
    return {
      text: `Zichtbaar vanaf ${formatMoment(fixture.locksAt)}`,
      isHidden: true,
    };
  }

  if (!fixture.prediction) {
    return { text: "Niet ingevuld", isHidden: false };
  }

  return {
    text: describeValue(fixture.prediction, fixture.payload, participants),
    isHidden: false,
  };
}

/** "5 pt" voor een gescoord onderdeel, anders niets. */
export function pointsLabel(points: number | null): string | null {
  return points === null ? null : `${points} pt`;
}

/** Evenementen waar iets te zien is: met onderdelen. */
export function eventsWithFixtures(events: MemberEvent[]): MemberEvent[] {
  return events.filter((event) => event.fixtures.length > 0);
}

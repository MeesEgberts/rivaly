import type { FixturePayload } from "@modules/validators";

import type { FixtureDetail } from "@/types/fixture-detail";

import type { ParticipantInfo, ParticipantMap } from "./participants";

type RankingPayload = Extract<FixturePayload, { type: "ranking" }>;

/**
 * Begint met je bewaarde volgorde. Zonder voorspelling, en als je alle
 * opties moet ordenen (bijv. 4 uit 4), staan ze er alvast in en sleep je alleen.
 */
export function initialRanking(fixture: FixtureDetail): string[] {
  if (fixture.myPrediction?.type === "ranking") {
    return fixture.myPrediction.order;
  }

  if (fixture.payload.type !== "ranking") {
    return [];
  }

  if (fixture.payload.options.length === fixture.payload.size) {
    return fixture.payload.options.map((option) => option.id);
  }

  return [];
}

/** Naam en code van een optie; een speler zonder deelnemer krijgt een code uit zijn naam. */
export function rankingOptionTeam(
  payload: RankingPayload,
  participants: ParticipantMap,
  optionId: string,
): ParticipantInfo {
  const participant = participants.get(optionId);

  if (participant) {
    return participant;
  }

  const label =
    payload.options.find((option) => option.id === optionId)?.label ?? optionId;

  return { name: label, code: label.slice(0, 3).toUpperCase() };
}

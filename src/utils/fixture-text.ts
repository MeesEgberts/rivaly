import {
  championOf,
  resolveBracket,
} from "@modules/fixture-types/bracket-tree";
import type {
  FixturePayload,
  FixturePrediction,
  FixtureResult,
} from "@modules/validators";

import type { FixtureDetail } from "@/types/fixture-detail";

import { participantName, type ParticipantMap } from "./participants";

/** Korte omschrijving van het onderdeel zelf, bijv. "Nederland – België". */
export function describeFixture(
  payload: FixturePayload,
  label: string | null,
  participants: ParticipantMap,
): string {
  if (payload.type === "score") {
    const home = participantName(participants, payload.homeId);
    const away = participantName(participants, payload.awayId);

    return `${home} – ${away}`;
  }

  return label ?? "Onderdeel";
}

/** "Rivaly Test Cup · Bonusvragen" */
export function describeContext(fixture: FixtureDetail): string {
  return [fixture.eventName, fixture.stageName].filter(Boolean).join(" · ");
}

/** Een voorspelling of uitslag als tekst, bijv. "2 – 1" of "Nederland". */
export function describeValue(
  value: FixturePrediction | FixtureResult | null,
  payload: FixturePayload,
  participants: ParticipantMap,
): string {
  if (!value) {
    return "—";
  }

  switch (value.type) {
    case "score":
      return `${value.home} – ${value.away}`;

    case "pick":
      return optionLabel(payload, value.optionId, participants);

    case "ranking":
      return value.order
        .map(
          (id, index) =>
            `${index + 1}. ${optionLabel(payload, id, participants)}`,
        )
        .join("  ");

    case "numeric": {
      const unit =
        payload.type === "numeric" && payload.unit ? ` ${payload.unit}` : "";

      return `${value.value}${unit}`;
    }

    case "bracket": {
      if (payload.type !== "bracket") {
        return `${value.winners.length} winnaars`;
      }

      const champion = championOf(resolveBracket(payload, value));

      if (champion === null) {
        return `${value.winners.length} winnaars gekozen`;
      }

      return `Kampioen: ${participantName(participants, champion)}`;
    }
  }
}

/** Label van een keuze- of volgorde-optie; valt terug op de deelnemersnaam. */
function optionLabel(
  payload: FixturePayload,
  optionId: string,
  participants: ParticipantMap,
): string {
  if (payload.type === "pick" || payload.type === "ranking") {
    const option = payload.options.find(
      (candidate) => candidate.id === optionId,
    );

    if (option) {
      return option.label;
    }
  }

  return participantName(participants, optionId);
}

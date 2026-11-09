import {
  championOf,
  resolveBracket,
} from "@modules/fixture-types/bracket-tree";
import { STAGE_PROFILES } from "@modules/cycling/stage-profile";
import type {
  FixtureDetails,
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

/** "Rivaly Test Cup · Bonusvragen", met het parcours erachter als dat er is. */
export function describeContext(fixture: FixtureDetail): string {
  return [
    fixture.eventName,
    fixture.stageName,
    describeDetails(fixture.details),
  ]
    .filter(Boolean)
    .join(" · ");
}

/** Parcours van een etappe of koers: "Rotterdam – Den Haag · 172 km · Vlak". */
export function describeDetails(details: FixtureDetails | null): string | null {
  if (!details) {
    return null;
  }

  const profile = details.profile
    ? STAGE_PROFILES[details.profile].label
    : null;

  return [describeRoute(details), profile].filter(Boolean).join(" · ") || null;
}

/** Alleen route en afstand: "Rotterdam – Den Haag · 172 km". */
export function describeRoute(details: FixtureDetails | null): string | null {
  if (!details) {
    return null;
  }

  const distance =
    details.distanceKm !== undefined ? `${details.distanceKm} km` : null;

  return [details.route, distance].filter(Boolean).join(" · ") || null;
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

/** "Milaan-Sanremo 2027 · Koers": waar de vraag bij hoort, zonder parcours. */
export function describeOrigin(fixture: FixtureDetail): string {
  return [fixture.eventName, fixture.stageName].filter(Boolean).join(" · ");
}

export interface DetailChip {
  icon: "map" | "ruler" | "chart.xyaxis.line";
  text: string;
}

/** Parcours als losse labels: route, afstand en soort rit. */
export function detailChips(details: FixtureDetails | null): DetailChip[] {
  if (!details) {
    return [];
  }

  const chips: DetailChip[] = [];
  const [start, finish] = details.route?.split(" – ") ?? [];

  if (start && finish) {
    chips.push({ icon: "map", text: `${start} → ${finish}` });
  }

  if (details.distanceKm !== undefined) {
    chips.push({ icon: "ruler", text: `${details.distanceKm} km` });
  }

  if (details.profile) {
    chips.push({
      icon: "chart.xyaxis.line",
      text: STAGE_PROFILES[details.profile].label,
    });
  }

  return chips;
}

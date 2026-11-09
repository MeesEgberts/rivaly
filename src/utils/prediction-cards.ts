import type { SFSymbol } from "sf-symbols-typescript";

import type {
  FixturePayload,
  FixturePrediction,
  FixtureResult,
} from "@modules/validators";

import type { EventData, EventFixture } from "@/hooks/use-event-data";

import { isFixtureOpen } from "./match-rows";
import type { ParticipantMap } from "./participants";

/**
 * Gedeelde logica voor voorspelkaarten (wielrennen, voetbal, ...): status,
 * aftellen en een kort antwoord om op een kaart te tonen.
 */

export interface OptionInfo {
  id: string;
  name: string;
  code: string | null;
}

/** Waar een onderdeel staat, voor de strip en de statuslabel op een kaart. */
export type FixtureCardStatus = "todo" | "done" | "locked" | "finished";

export function fixtureCardStatus(
  fixture: EventFixture,
  now: number,
): FixtureCardStatus {
  if (fixture.result) {
    return "finished";
  }

  if (!isFixtureOpen(fixture, now)) {
    return "locked";
  }

  return fixture.myPrediction ? "done" : "todo";
}

/** Onderdelen van één soort fase, in volgorde van het programma. */
export function fixturesOfKind(
  stages: EventData["stages"],
  fixtures: EventFixture[],
  stageKind: string,
): EventFixture[] {
  const stageIds = new Set(
    stages
      .filter((stage) => stage.kind === stageKind)
      .map((stage) => stage._id),
  );

  return fixtures
    .filter((fixture) => stageIds.has(fixture.stageId))
    .sort((a, b) => a.order - b.order);
}

/** "nog 5 min", "nog 3 u 20 min", "nog 2 dagen", "nog 3 weken" of "nog 4 maanden". */
export function formatTimeLeft(locksAt: number, now: number): string {
  const minutes = Math.max(0, Math.floor((locksAt - now) / 60_000));

  if (minutes < 60) {
    return `nog ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    const rest = minutes % 60;
    return rest > 0 ? `nog ${hours} u ${rest} min` : `nog ${hours} u`;
  }

  const days = Math.floor(hours / 24);

  if (days < 14) {
    return days === 1 ? "nog 1 dag" : `nog ${days} dagen`;
  }

  if (days < 60) {
    return `nog ${Math.floor(days / 7)} weken`;
  }

  return `nog ${Math.floor(days / 30)} maanden`;
}

/** "do 12 nov · 15:40" */
export function formatMoment(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = date.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${day} · ${time}`;
}

export function optionInfo(
  id: string,
  payload: FixturePayload,
  participants: ParticipantMap,
): OptionInfo {
  const participant = participants.get(id);

  if (participant) {
    return { id, name: participant.shortName, code: participant.code };
  }

  const label =
    payload.type === "pick" || payload.type === "ranking"
      ? payload.options.find((option) => option.id === id)?.label
      : undefined;

  return { id, name: label ?? "Onbekend", code: null };
}

/** Korte weergave van een antwoord voor op een kaart: renner, getal of keuze. */
export function shortAnswer(
  value: FixturePrediction | FixtureResult | null,
  payload: FixturePayload,
  participants: ParticipantMap,
): { text: string; code: string | null } | null {
  if (!value) {
    return null;
  }

  switch (value.type) {
    case "pick": {
      const rider = optionInfo(value.optionId, payload, participants);
      return { text: rider.name, code: rider.code };
    }

    case "ranking": {
      const [first, ...rest] = value.order;
      const leader = optionInfo(first, payload, participants);
      const more = rest.length > 0 ? ` +${rest.length}` : "";
      return { text: `1. ${leader.name}${more}`, code: leader.code };
    }

    case "numeric":
      return { text: String(value.value), code: null };

    default:
      return null;
  }
}

/** Icoon voor een vraag: het eigen icoon uit de data, anders op basis van het type. */
export function questionIcon(
  fixture: EventFixture,
  participants: ParticipantMap,
): SFSymbol {
  if (fixture.details?.icon) {
    return fixture.details.icon as SFSymbol;
  }

  switch (fixture.payload.type) {
    case "numeric":
      return "number";
    case "ranking":
      return "list.number";
    case "pick": {
      const first = fixture.payload.options[0];
      return first && participants.has(first.id)
        ? "person.fill"
        : "person.3.fill";
    }
    default:
      return "list.number";
  }
}

/** "Top 5" bij een volgorde, anders niets. */
export function questionSize(fixture: EventFixture): string | null {
  return fixture.payload.type === "ranking"
    ? `Top ${fixture.payload.size}`
    : null;
}

/** Hoeveel van deze vragen je al hebt ingevuld. */
export function answeredCount(fixtures: EventFixture[]): number {
  return fixtures.filter((fixture) => fixture.myPrediction !== null).length;
}

/** Goud voor een trofee, anders de standaard accentkleur (`undefined`). */
export function iconTint(
  icon: SFSymbol,
  trophyColor: string,
): string | undefined {
  return icon.startsWith("trophy") ? trophyColor : undefined;
}

import { OTHER_OPTION_ID } from "@modules/fixture-types/pick";
import { modules } from "@modules/registry";
import type {
  FixturePayload,
  FixturePrediction,
  FixtureResult,
} from "@modules/validators";

import type { AthleteInfo } from "@/types/athlete";

import type { ParticipantMap } from "./participants";

type ChoicePayload = Extract<FixturePayload, { type: "pick" | "ranking" }>;

/** Keuze- of volgordevraag waarbij je uit alle atleten van een sport kiest. */
export function isAthletePool(
  payload: FixturePayload,
): payload is ChoicePayload & { pool: { sport: string } } {
  return (
    (payload.type === "pick" || payload.type === "ranking") &&
    payload.pool !== undefined
  );
}

/** Aantal plekken: 1 bij een keuzevraag, N bij een volgorde. */
export function slotCount(payload: ChoicePayload): number {
  return payload.type === "ranking" ? payload.size : 1;
}

/** De gekozen ids uit een opgeslagen voorspelling of uitslag. */
export function savedOrder(
  value: FixturePrediction | FixtureResult | null,
): string[] {
  if (value?.type === "pick") {
    return [value.optionId];
  }

  if (value?.type === "ranking") {
    return value.order;
  }

  return [];
}

/** Zet de keuze om naar een voorspelling of uitslag van het juiste type. */
export function orderToValue(
  payload: ChoicePayload,
  order: string[],
): FixturePrediction & FixtureResult {
  if (payload.type === "pick") {
    return { type: "pick", optionId: order[0] };
  }

  return { type: "ranking", order };
}

/**
 * Voegt een atleet toe. Bij één plek vervangt hij de vorige keuze; anders
 * komt hij achteraan zolang er plek is. Dubbel kan alleen met `allowRepeat`.
 */
export function addToOrder(
  order: string[],
  id: string,
  size: number,
  allowRepeat: boolean,
): string[] {
  if (size === 1) {
    return [id];
  }

  if (order.length >= size || (!allowRepeat && order.includes(id))) {
    return order;
  }

  return [...order, id];
}

export function moveUp(order: string[], index: number): string[] {
  if (index <= 0 || index >= order.length) {
    return order;
  }

  const next = [...order];
  [next[index - 1], next[index]] = [next[index], next[index - 1]];
  return next;
}

/**
 * Favorieten die je mag kiezen. "Andere renner" alleen in een uitslag of bij
 * een keuzevraag; in een voorspelde volgorde levert hij nooit punten op.
 */
export function selectableFavourites(
  payload: ChoicePayload,
  mode: "prediction" | "result",
) {
  if (mode === "prediction" && payload.type === "ranking") {
    return payload.options.filter((option) => option.id !== OTHER_OPTION_ID);
  }

  return payload.options;
}

/** Naam en landcode van een gekozen id: eerst uit deze sessie, dan van de server. */
export function athleteInfo(
  id: string,
  known: Map<string, AthleteInfo>,
  participants: ParticipantMap,
  payload: ChoicePayload,
): AthleteInfo {
  const fromSession = known.get(id);

  if (fromSession) {
    return fromSession;
  }

  const participant = participants.get(id);

  if (participant) {
    return {
      id,
      name: participant.name,
      shortName: participant.shortName,
      code: participant.code,
    };
  }

  const label =
    payload.options.find((option) => option.id === id)?.label ?? "Onbekend";

  return { id, name: label, shortName: label, code: null };
}

export function isOther(id: string): boolean {
  return id === OTHER_OPTION_ID;
}

/** "renner"/"renners" voor wielrennen; "atleet"/"atleten" als de sport niets zegt. */
export function athleteNoun(sport: string): {
  singular: string;
  plural: string;
} {
  return (
    modules[sport]?.athleteNoun ?? { singular: "atleet", plural: "atleten" }
  );
}

/** Bijvoeglijke naamwoorden voor landen die in vragen voorkomen. */
const NATION_ADJECTIVES: Record<string, string> = {
  NED: "Nederlandse",
  BEL: "Belgische",
};

/** "renners" of "Nederlandse renners", afhankelijk van de pool. */
export function poolNoun(pool: { sport: string; nation?: string }): {
  singular: string;
  plural: string;
} {
  const noun = athleteNoun(pool.sport);
  const adjective = pool.nation ? NATION_ADJECTIVES[pool.nation] : undefined;

  if (!adjective) {
    return noun;
  }

  return {
    singular: `${adjective} ${noun.singular}`,
    plural: `${adjective} ${noun.plural}`,
  };
}

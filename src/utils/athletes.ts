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

/**
 * Wat er rechts bij een atleet in de lijst staat: zijn plek als hij gekozen
 * is, anders de plek waar hij terechtkomt (of niets als alles vol is).
 */
export function placeLabel(
  id: string,
  order: string[],
  size: number,
): { text: string; isChosen: boolean } | null {
  const index = order.indexOf(id);

  if (index >= 0) {
    return { text: size > 1 ? `Plek ${index + 1}` : "Gekozen", isChosen: true };
  }

  if (size === 1) {
    return { text: "Kies", isChosen: false };
  }

  if (order.length >= size) {
    return null;
  }

  return { text: `Plek ${order.length + 1}`, isChosen: false };
}

/** Uitleg onder de top N, afhankelijk van hoe ver je bent. */
export function topNHint(filled: number, size: number, noun: string): string {
  if (size === 1) {
    return filled === 0
      ? `Tik een ${noun} hieronder aan of zoek in de hele lijst.`
      : `Tik een andere ${noun} aan om te wisselen.`;
  }

  if (filled === 0) {
    return `Tik een ${noun} hieronder aan: hij komt op plek 1.`;
  }

  const drag = `Sleep aan ≡ om de volgorde te wijzigen.`;

  if (filled === 1) {
    return `Volgende ${noun} komt op plek 2.`;
  }

  if (filled < size) {
    return `Volgende ${noun} komt op plek ${filled + 1}. ${drag}`;
  }

  return drag;
}

/** Maten van de native plekkenlijst op iOS, gemeten in de simulator. */
export const SLOT_LIST = {
  rowHeight: 58,
  /** Ruimte die SwiftUI boven een sectie zonder kop houdt. */
  topInset: 34,
  bottomInset: 16,
  /** Hoe ver de inset-grouped lijst inspringt ten opzichte van onze kaarten. */
  sideInset: 17,
} as const;

export function slotListHeight(slots: number): number {
  return (
    SLOT_LIST.topInset + slots * SLOT_LIST.rowHeight + SLOT_LIST.bottomInset
  );
}

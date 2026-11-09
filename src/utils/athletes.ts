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
      imageUrl: participant.imageUrl,
    };
  }

  const label =
    payload.options.find((option) => option.id === id)?.label ?? "Onbekend";

  return { id, name: label, shortName: label, code: null, imageUrl: null };
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

/** Plekken op het podium; `null` is een lege plek. */
export type Slots = (string | null)[];

/** Vaste plekken, gevuld met wat er al gekozen was. */
export function slotsFrom(order: string[], size: number): Slots {
  return Array.from({ length: size }, (_, index) => order[index] ?? null);
}

export function isComplete(slots: Slots): slots is string[] {
  return slots.every((id) => id !== null);
}

/** De eerste lege plek, of `null` als alles gevuld is. */
export function firstEmpty(slots: Slots): number | null {
  const index = slots.indexOf(null);
  return index >= 0 ? index : null;
}

/** Zet een atleet op een plek. Stond hij al ergens anders, dan wisselen ze. */
export function placeAt(slots: Slots, index: number, id: string): Slots {
  const next = [...slots];
  const current = next.indexOf(id);

  if (current >= 0) {
    next[current] = next[index];
  }

  next[index] = id;
  return next;
}

export function swapSlots(slots: Slots, from: number, to: number): Slots {
  const next = [...slots];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

/**
 * Volgorde waarin de treden naast elkaar staan, als posities (0 = plek 1):
 * de winnaar in het midden, daarna afwisselend links en rechts (2–1–3,
 * 4–2–1–3–5).
 */
export function podiumLayout(size: number): number[] {
  const layout = [0];

  for (let position = 1; position < size; position += 1) {
    if (position % 2 === 1) {
      layout.unshift(position);
    } else {
      layout.push(position);
    }
  }

  return layout;
}

/** Hoogte van het blok van een trede: plek 1 het hoogst. */
export function stepHeight(position: number, size: number): number {
  const max = 64;
  const min = 30;
  return size <= 1 ? max : max - ((max - min) * position) / (size - 1);
}

/** Uitleg onder het podium, afhankelijk van hoe ver je bent. */
export function podiumHint(filled: number, size: number): string {
  if (size === 1) {
    return filled === 0
      ? "Tik om een renner te kiezen."
      : "Tik om een andere renner te kiezen.";
  }

  if (filled === 0) {
    return "Tik een plek om een renner te kiezen.";
  }

  if (filled < size) {
    return "Tik een plek om een renner te kiezen.";
  }

  return "Tik om te vervangen, houd vast om te verslepen.";
}

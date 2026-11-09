import type { StageProfile } from "@modules/cycling/stage-profile";
import { OTHER_OPTION_ID } from "@modules/fixture-types/pick";
import type {
  FixturePayload,
  FixturePrediction,
  FixtureResult,
} from "@modules/validators";

import type { EventFixture } from "@/hooks/use-event-data";

import type { ParticipantMap } from "./participants";
import {
  fixtureCardStatus,
  optionInfo,
  type FixtureCardStatus,
  type OptionInfo,
} from "./prediction-cards";

export interface CyclingStage {
  fixture: EventFixture;
  number: number;
  status: FixtureCardStatus;
  profile: StageProfile | null;
}

export function toCyclingStages(
  fixtures: EventFixture[],
  now: number,
): CyclingStage[] {
  return fixtures.map((fixture, index) => ({
    fixture,
    number: index + 1,
    status: fixtureCardStatus(fixture, now),
    profile: fixture.details?.profile ?? null,
  }));
}

/** De eerste etappe die nog open is; anders de laatste. */
export function defaultStageIndex(stages: CyclingStage[]): number {
  const open = stages.findIndex(
    (stage) => stage.status === "todo" || stage.status === "done",
  );

  return open >= 0 ? open : Math.max(0, stages.length - 1);
}

/** "za 3" voor een smalle chip in de etappestrip. */
export function formatStripDay(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
  });
}

/** Hoe een gekozen renner het deed ten opzichte van de uitslag. */
export type PodiumHit = "exact" | "inTop" | "miss" | null;

export interface PodiumSlot {
  position: number;
  rider: OptionInfo | null;
  hit: PodiumHit;
}

/**
 * De plekken van een volgorde, met per renner naam, landcode en (als er een
 * uitslag is) of hij goed zat. "Andere renner" toont als "Andere renner".
 */
export function podiumSlots(args: {
  order: string[] | null;
  size: number;
  payload: FixturePayload;
  participants: ParticipantMap;
  result: FixtureResult | null;
}): PodiumSlot[] {
  const { order, size, payload, participants, result } = args;
  const resultOrder = result?.type === "ranking" ? result.order : null;

  return Array.from({ length: size }, (_, index) => {
    const id = order?.[index] ?? null;

    return {
      position: index + 1,
      rider: id ? optionInfo(id, payload, participants) : null,
      hit: id && resultOrder ? rankingHit(id, index, resultOrder) : null,
    };
  });
}

function rankingHit(
  id: string,
  index: number,
  resultOrder: string[],
): PodiumHit {
  if (id === OTHER_OPTION_ID) {
    return "miss";
  }

  if (resultOrder[index] === id) {
    return "exact";
  }

  return resultOrder.includes(id) ? "inTop" : "miss";
}

/** Podiumvolgorde zoals op een echt podium: 2 – 1 – 3. */
export function podiumDisplayOrder<T extends { position: number }>(
  slots: T[],
): T[] {
  if (slots.length !== 3) {
    return slots;
  }

  return [slots[1], slots[0], slots[2]];
}

/** Volgorde uit een voorspelling of uitslag, of `null` als het geen volgorde is. */
export function rankingOrder(
  value: FixturePrediction | FixtureResult | null,
): string[] | null {
  return value?.type === "ranking" ? value.order : null;
}

/** Verdeelt een hoogteprofiel lineair over `count` punten, voor een vloeiend silhouet. */
export function resampleElevation(values: number[], count: number): number[] {
  if (values.length < 2) {
    return values;
  }

  return Array.from({ length: count }, (_, index) => {
    const position = (index / (count - 1)) * (values.length - 1);
    const left = Math.floor(position);
    const right = Math.min(values.length - 1, left + 1);
    const fraction = position - left;

    return values[left] + (values[right] - values[left]) * fraction;
  });
}

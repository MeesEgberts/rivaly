import type { FunctionReturnType } from "convex/server";

import type { api } from "@convex/_generated/api";

import { formatTimeLeft } from "./prediction-cards";

export type OpenItem = FunctionReturnType<typeof api.predictions.open>[number];
export type OverviewEvent = FunctionReturnType<
  typeof api.predictions.overview
>[number];

/** Waar je een onderdeel invult: een schema op het toernooischerm, de rest in het voorspelscherm. */
export function openItemHref(item: OpenItem) {
  if (item.type === "bracket") {
    return {
      pathname: "/events/[eventId]" as const,
      params: { eventId: item.eventId, tab: "bracket" },
    };
  }

  return {
    pathname: "/predict/[fixtureId]" as const,
    params: { fixtureId: item.fixtureId },
  };
}

/** De onderdelen die je nog niet hebt ingevuld, eerstvolgende eerst. */
export function todoItems(items: OpenItem[]): OpenItem[] {
  return items.filter((item) => !item.hasPrediction);
}

/** "3 nog in te vullen · sluit nog 2 u" of "Alles ingevuld". */
export function eventProgressText(event: OverviewEvent, now: number): string {
  if (event.open === 0) {
    return "Niets meer open";
  }

  const remaining = event.open - event.predicted;

  if (remaining === 0 || event.nextLockAt === null) {
    return "Alles ingevuld, aanpassen kan nog";
  }

  return `${remaining} nog in te vullen · sluit ${formatTimeLeft(event.nextLockAt, now)}`;
}

const SOON_MS = 6 * 60 * 60 * 1000;

/** Sluit binnen zes uur: dan krijgt het aftellabel de accentkleur. */
export function isSoon(locksAt: number, now: number): boolean {
  return locksAt - now < SOON_MS;
}

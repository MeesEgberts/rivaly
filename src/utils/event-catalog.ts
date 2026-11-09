import type { FunctionReturnType } from "convex/server";
import type { SFSymbol } from "sf-symbols-typescript";

import type { api } from "@convex/_generated/api";
import { formatDate } from "@/utils/format";

export type CatalogEvent = FunctionReturnType<
  typeof api.events.catalog
>[number];

export interface CatalogSport {
  key: string;
  name: string;
  icon: SFSymbol;
}

/** Het SF Symbol van de sportmodule, bijv. "soccerball". */
export function sportIcon(event: CatalogEvent): SFSymbol {
  return event.moduleIcon as SFSymbol;
}

/** "Voetbal · 9 november 2026" */
export function catalogSubtitle(event: CatalogEvent): string {
  return `${event.moduleName} · ${formatDate(event.startsAt)}`;
}

/** De sporten die in de catalogus voorkomen, in volgorde van eerste voorkomen. */
export function catalogSports(events: CatalogEvent[]): CatalogSport[] {
  const sports = new Map<string, CatalogSport>();

  for (const event of events) {
    if (!sports.has(event.moduleKey)) {
      sports.set(event.moduleKey, {
        key: event.moduleKey,
        name: event.moduleName,
        icon: sportIcon(event),
      });
    }
  }

  return [...sports.values()];
}

/**
 * Filtert op sport (`null` = alle sporten) en op een zoekterm die in de
 * naam, korte naam of sport mag voorkomen.
 */
export function filterCatalog(
  events: CatalogEvent[],
  search: string,
  sportKey: string | null,
): CatalogEvent[] {
  const term = search.trim().toLocaleLowerCase("nl");

  return events.filter((event) => {
    if (sportKey !== null && event.moduleKey !== sportKey) {
      return false;
    }

    if (term.length === 0) {
      return true;
    }

    const haystack = [event.name, event.shortName ?? "", event.moduleName]
      .join(" ")
      .toLocaleLowerCase("nl");

    return haystack.includes(term);
  });
}

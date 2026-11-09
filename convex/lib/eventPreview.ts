import { getModule } from "../../modules/registry";
import type { Doc } from "../_generated/dataModel";

/**
 * Wat de kop van een evenement nodig heeft: naam, soort, datum en beeld.
 * Lijsten geven dit mee, zodat het evenementscherm zijn kop al tijdens de
 * overgang kan tonen, nog voordat de rest geladen is.
 */
export function eventPreview(event: Doc<"events">) {
  const module = getModule(event.moduleKey);

  return {
    name: event.name,
    moduleKey: event.moduleKey,
    moduleName: module.name,
    // Reeksen in de volgorde van de module, dus de belangrijkste eerst.
    seriesNames: (module.series ?? [])
      .filter((series) => event.meta.series?.includes(series.key))
      .map((series) => series.memberName),
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    imageUrl: event.meta.imageUrl ?? null,
    logoUrl: event.meta.logoUrl ?? null,
    color: event.meta.color ?? null,
  };
}

export type EventPreview = ReturnType<typeof eventPreview>;

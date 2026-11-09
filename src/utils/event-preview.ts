import type { EventPreview } from "@convex/lib/eventPreview";

import type { EventTabKey } from "./event-tabs";

export type { EventPreview };

/**
 * Link naar een evenement, met de gegevens voor de kop erbij. Zo staat de kop
 * er al tijdens de overgang, in plaats van een leeg scherm met een spinner.
 */
export function eventHref(
  eventId: string,
  preview: EventPreview | null,
  tab?: EventTabKey,
) {
  return {
    pathname: "/events/[eventId]" as const,
    params: {
      eventId,
      ...(preview ? { preview: JSON.stringify(preview) } : {}),
      ...(tab ? { tab } : {}),
    },
  };
}

/** De kop-gegevens uit de link terug; `null` als ze er niet (goed) in staan. */
export function parsePreview(value: string | undefined): EventPreview | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as EventPreview;
  } catch {
    return null;
  }
}

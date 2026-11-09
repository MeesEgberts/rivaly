import { useQuery } from "convex/react";
import { useMemo } from "react";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { buildParticipantMap } from "@/utils/participants";

/**
 * Evenement, onderdelen (met mijn voorspelling) en deelnemers. Meerdere
 * secties mogen dit los aanroepen: Convex deelt de onderliggende
 * subscriptions.
 */
export function useEventData(eventId: Id<"events">) {
  const event = useQuery(api.events.get, { eventId });
  const fixtures = useQuery(api.events.fixtures, { eventId });

  const participants = useMemo(
    () => buildParticipantMap(event?.participants ?? []),
    [event?.participants],
  );

  const isLoading = event === undefined || fixtures === undefined;

  return { event, fixtures, participants, isLoading };
}

export type EventData = NonNullable<ReturnType<typeof useEventData>["event"]>;
export type EventFixture = NonNullable<
  ReturnType<typeof useEventData>["fixtures"]
>[number];

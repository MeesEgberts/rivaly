import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import type { Id } from "@convex/_generated/dataModel";
import {
  AddEventDraftContext,
  type AddEventDestination,
} from "@/hooks/use-add-event-draft";
import type { AthleteInfo } from "@/types/athlete";

interface Props {
  children: ReactNode;
}

/** Houdt de keuzes vast zolang de "Wedstrijd toevoegen"-modal open is. */
export function AddEventDraftProvider({ children }: Props) {
  const [destination, setDestination] = useState<AddEventDestination>({
    pouleId: null,
    publish: false,
  });
  const [selectedEventIds, setSelectedEventIds] = useState<Set<Id<"events">>>(
    new Set(),
  );
  const [favourites, setFavourites] = useState<AthleteInfo[]>([]);

  const toggleEvent = useCallback((eventId: Id<"events">) => {
    setSelectedEventIds((current) => {
      const next = new Set(current);

      if (next.has(eventId)) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }

      return next;
    });
  }, []);

  const toggleEvents = useCallback((eventIds: Id<"events">[]) => {
    setSelectedEventIds((current) => {
      const next = new Set(current);
      const allSelected = eventIds.every((eventId) => current.has(eventId));

      for (const eventId of eventIds) {
        if (allSelected) {
          next.delete(eventId);
        } else {
          next.add(eventId);
        }
      }

      return next;
    });
  }, []);

  const addFavourite = useCallback((athlete: AthleteInfo) => {
    setFavourites((current) =>
      current.some((item) => item.id === athlete.id)
        ? current
        : [...current, athlete],
    );
  }, []);

  const removeFavourite = useCallback((id: string) => {
    setFavourites((current) => current.filter((item) => item.id !== id));
  }, []);

  const draft = useMemo(
    () => ({
      destination,
      setDestination,
      selectedEventIds,
      toggleEvent,
      toggleEvents,
      favourites,
      addFavourite,
      removeFavourite,
    }),
    [
      destination,
      selectedEventIds,
      toggleEvent,
      toggleEvents,
      favourites,
      addFavourite,
      removeFavourite,
    ],
  );

  return (
    <AddEventDraftContext.Provider value={draft}>
      {children}
    </AddEventDraftContext.Provider>
  );
}

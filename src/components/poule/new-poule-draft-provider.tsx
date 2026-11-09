import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import type { Id } from "@convex/_generated/dataModel";
import { NewPouleDraftContext } from "@/hooks/use-new-poule-draft";

interface Props {
  children: ReactNode;
}

/** Houdt de evenementkeuze vast zolang de "Nieuwe poule"-modal open is. */
export function NewPouleDraftProvider({ children }: Props) {
  const [selectedEventIds, setSelectedEventIds] = useState<Set<Id<"events">>>(
    new Set(),
  );

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

  const draft = useMemo(
    () => ({ selectedEventIds, toggleEvent, toggleEvents }),
    [selectedEventIds, toggleEvent, toggleEvents],
  );

  return (
    <NewPouleDraftContext.Provider value={draft}>
      {children}
    </NewPouleDraftContext.Provider>
  );
}

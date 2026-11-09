import { createContext, useContext } from "react";

import type { Id } from "@convex/_generated/dataModel";

export interface NewPouleDraft {
  selectedEventIds: Set<Id<"events">>;
  toggleEvent: (eventId: Id<"events">) => void;
}

export const NewPouleDraftContext = createContext<NewPouleDraft | null>(null);

/**
 * De gekozen evenementen van de poule in aanmaak. Gedeeld tussen het
 * formulier en het zoekscherm, die allebei in de modal-stack van
 * `poules/new` zitten.
 */
export function useNewPouleDraft(): NewPouleDraft {
  const draft = useContext(NewPouleDraftContext);

  if (!draft) {
    throw new Error(
      "useNewPouleDraft werkt alleen binnen NewPouleDraftProvider.",
    );
  }

  return draft;
}

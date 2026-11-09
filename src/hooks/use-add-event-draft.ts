import { createContext, useContext } from "react";

import type { Id } from "@convex/_generated/dataModel";
import type { AthleteInfo } from "@/types/athlete";

/** Waar de nieuwe wedstrijd heen gaat: een poule, of (beheerder) de catalogus. */
export interface AddEventDestination {
  pouleId: Id<"poules"> | null;
  publish: boolean;
}

export interface AddEventDraft {
  destination: AddEventDestination;
  setDestination: (destination: AddEventDestination) => void;
  /** Catalogus-evenementen die aan de poule worden toegevoegd. */
  selectedEventIds: Set<Id<"events">>;
  toggleEvent: (eventId: Id<"events">) => void;
  toggleEvents: (eventIds: Id<"events">[]) => void;
  /** Favorieten voor een eigen koers. */
  favourites: AthleteInfo[];
  addFavourite: (athlete: AthleteInfo) => void;
  removeFavourite: (id: string) => void;
}

export const AddEventDraftContext = createContext<AddEventDraft | null>(null);

/** De keuzes in de "Wedstrijd toevoegen"-modal, gedeeld tussen haar schermen. */
export function useAddEventDraft(): AddEventDraft {
  const draft = useContext(AddEventDraftContext);

  if (!draft) {
    throw new Error(
      "useAddEventDraft werkt alleen binnen AddEventDraftProvider.",
    );
  }

  return draft;
}

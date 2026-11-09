import { createContext, useContext } from "react";

import type { AthleteInfo } from "@/types/athlete";
import type { Slots } from "@/utils/athletes";

export interface AthleteDraft {
  /** Vaste plekken; `null` is nog leeg. Bij een keuzevraag is er één plek. */
  slots: Slots;
  /** Atleten die in deze sessie zijn gekozen, zodat hun naam meteen bekend is. */
  known: Map<string, AthleteInfo>;
  isStarted: boolean;
  /** Eenmalig vullen met de opgeslagen voorspelling of uitslag. */
  start: (order: string[], size: number) => void;
  clear: (index: number) => void;
  /** Zet een atleet op een plek; staat hij elders, dan wisselen ze. */
  replaceAt: (position: number, athlete: AthleteInfo) => void;
  swap: (from: number, to: number) => void;
}

export const AthleteDraftContext = createContext<AthleteDraft | null>(null);

/** De podiumkeuze in een voorspel- of uitslagmodal. */
export function useAthleteDraft(): AthleteDraft {
  const draft = useContext(AthleteDraftContext);

  if (!draft) {
    throw new Error(
      "useAthleteDraft werkt alleen binnen AthleteDraftProvider.",
    );
  }

  return draft;
}

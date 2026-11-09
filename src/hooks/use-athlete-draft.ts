import { createContext, useContext } from "react";

import type { AthleteInfo } from "@/types/athlete";

export interface AthleteDraft {
  /** Gekozen ids in volgorde; bij een keuzevraag hooguit één. */
  order: string[];
  /** Hoeveel plekken er zijn (1 bij een keuzevraag). */
  size: number;
  /** Atleten die in deze sessie zijn gekozen, zodat hun naam meteen bekend is. */
  known: Map<string, AthleteInfo>;
  isStarted: boolean;
  /** Eenmalig vullen met de opgeslagen voorspelling of uitslag. */
  start: (order: string[], size: number) => void;
  /** Voegt toe (of vervangt bij één plek). `allowRepeat` voor "Andere renner" in een uitslag. */
  add: (athlete: AthleteInfo, allowRepeat?: boolean) => void;
  remove: (index: number) => void;
  /** Nieuwe volgorde na slepen. */
  reorder: (order: string[]) => void;
  /** Haalt een atleet weg als hij gekozen is, anders voegt hij hem toe. */
  toggle: (athlete: AthleteInfo, allowRepeat?: boolean) => void;
}

export const AthleteDraftContext = createContext<AthleteDraft | null>(null);

/**
 * De keuze uit atleten in een voorspel- of uitslagmodal, gedeeld tussen het
 * overzicht en het zoekscherm in dezelfde modal-stack.
 */
export function useAthleteDraft(): AthleteDraft {
  const draft = useContext(AthleteDraftContext);

  if (!draft) {
    throw new Error(
      "useAthleteDraft werkt alleen binnen AthleteDraftProvider.",
    );
  }

  return draft;
}

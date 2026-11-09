import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { AthleteDraftContext } from "@/hooks/use-athlete-draft";
import type { AthleteInfo } from "@/types/athlete";
import { placeAt, slotsFrom, swapSlots, type Slots } from "@/utils/athletes";

interface Props {
  children: ReactNode;
}

/** Houdt de podiumkeuze vast zolang de voorspel- of uitslagmodal open is. */
export function AthleteDraftProvider({ children }: Props) {
  const [slots, setSlots] = useState<Slots>([null]);
  const [known, setKnown] = useState<Map<string, AthleteInfo>>(new Map());
  const [isStarted, setIsStarted] = useState(false);

  const start = useCallback((order: string[], size: number) => {
    setSlots(slotsFrom(order, size));
    setIsStarted(true);
  }, []);

  const replaceAt = useCallback((position: number, athlete: AthleteInfo) => {
    setKnown((current) => new Map(current).set(athlete.id, athlete));
    setSlots((current) => placeAt(current, position, athlete.id));
  }, []);

  const clear = useCallback((index: number) => {
    setSlots((current) => current.map((id, i) => (i === index ? null : id)));
  }, []);

  const swap = useCallback((from: number, to: number) => {
    setSlots((current) => swapSlots(current, from, to));
  }, []);

  const draft = useMemo(
    () => ({ slots, known, isStarted, start, replaceAt, clear, swap }),
    [slots, known, isStarted, start, replaceAt, clear, swap],
  );

  return (
    <AthleteDraftContext.Provider value={draft}>
      {children}
    </AthleteDraftContext.Provider>
  );
}

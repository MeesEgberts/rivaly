import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { AthleteDraftContext } from "@/hooks/use-athlete-draft";
import type { AthleteInfo } from "@/types/athlete";
import {
  firstEmpty,
  placeAt,
  slotsFrom,
  swapSlots,
  type Slots,
} from "@/utils/athletes";

interface Props {
  children: ReactNode;
}

/** Houdt de podiumkeuze vast zolang de voorspel- of uitslagmodal open is. */
export function AthleteDraftProvider({ children }: Props) {
  const [slots, setSlots] = useState<Slots>([null]);
  const [active, setActive] = useState<number | null>(0);
  const [known, setKnown] = useState<Map<string, AthleteInfo>>(new Map());
  const [isStarted, setIsStarted] = useState(false);

  const start = useCallback((order: string[], size: number) => {
    const initial = slotsFrom(order, size);
    setSlots(initial);
    setActive(firstEmpty(initial));
    setIsStarted(true);
  }, []);

  const place = useCallback(
    (athlete: AthleteInfo) => {
      setKnown((current) => new Map(current).set(athlete.id, athlete));

      const target = active ?? firstEmpty(slots);

      if (target === null) {
        return;
      }

      const next = placeAt(slots, target, athlete.id);
      setSlots(next);
      setActive(firstEmpty(next));
    },
    [active, slots],
  );

  const select = useCallback((index: number) => {
    setActive((current) => (current === index ? null : index));
  }, []);

  const clear = useCallback((index: number) => {
    setSlots((current) => current.map((id, i) => (i === index ? null : id)));
    setActive(index);
  }, []);

  const replaceAt = useCallback(
    (position: number, athlete: AthleteInfo) => {
      setKnown((current) => new Map(current).set(athlete.id, athlete));
      const next = placeAt(slots, position, athlete.id);
      setSlots(next);
      setActive(firstEmpty(next));
    },
    [slots],
  );

  const swap = useCallback(
    (from: number, to: number) => {
      const next = swapSlots(slots, from, to);
      setSlots(next);
      setActive(firstEmpty(next));
    },
    [slots],
  );

  const draft = useMemo(
    () => ({
      slots,
      active,
      known,
      isStarted,
      start,
      place,
      select,
      clear,
      replaceAt,
      swap,
    }),
    [
      slots,
      active,
      known,
      isStarted,
      start,
      place,
      select,
      clear,
      replaceAt,
      swap,
    ],
  );

  return (
    <AthleteDraftContext.Provider value={draft}>
      {children}
    </AthleteDraftContext.Provider>
  );
}

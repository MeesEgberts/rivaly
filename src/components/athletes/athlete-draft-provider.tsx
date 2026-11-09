import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";

import { AthleteDraftContext } from "@/hooks/use-athlete-draft";
import type { AthleteInfo } from "@/types/athlete";
import { addToOrder } from "@/utils/athletes";

interface Props {
  children: ReactNode;
}

/** Houdt de gekozen atleten vast zolang de voorspel- of uitslagmodal open is. */
export function AthleteDraftProvider({ children }: Props) {
  const [order, setOrder] = useState<string[]>([]);
  const [size, setSize] = useState(1);
  const [known, setKnown] = useState<Map<string, AthleteInfo>>(new Map());
  const [isStarted, setIsStarted] = useState(false);

  const start = useCallback((initial: string[], slots: number) => {
    setOrder(initial);
    setSize(slots);
    setIsStarted(true);
  }, []);

  const add = useCallback(
    (athlete: AthleteInfo, allowRepeat = false) => {
      setKnown((current) => new Map(current).set(athlete.id, athlete));
      setOrder((current) => addToOrder(current, athlete.id, size, allowRepeat));
    },
    [size],
  );

  const remove = useCallback((index: number) => {
    setOrder((current) => current.filter((_, position) => position !== index));
  }, []);

  const reorder = useCallback((next: string[]) => {
    setOrder(next);
  }, []);

  const toggle = useCallback(
    (athlete: AthleteInfo, allowRepeat = false) => {
      if (!allowRepeat && order.includes(athlete.id)) {
        setOrder((current) => current.filter((id) => id !== athlete.id));
        return;
      }

      add(athlete, allowRepeat);
    },
    [order, add],
  );

  const draft = useMemo(
    () => ({
      order,
      size,
      known,
      isStarted,
      start,
      add,
      remove,
      reorder,
      toggle,
    }),
    [order, size, known, isStarted, start, add, remove, reorder, toggle],
  );

  return (
    <AthleteDraftContext.Provider value={draft}>
      {children}
    </AthleteDraftContext.Provider>
  );
}

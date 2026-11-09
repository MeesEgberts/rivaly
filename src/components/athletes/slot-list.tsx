import type { AthleteInfo } from "@/types/athlete";

export interface SlotListProps {
  /** Gekozen ids in volgorde. */
  order: string[];
  size: number;
  noun: string;
  infoOf: (id: string) => AthleteInfo;
  onRemove: (index: number) => void;
  onReorder: (order: string[]) => void;
  /** Tik op een lege plek: naar het zoekscherm. */
  onPickSlot: () => void;
}

/** Platformvarianten in `slot-list.ios.tsx` en `slot-list.android.tsx`. */
export function SlotList(_props: SlotListProps) {
  return null;
}

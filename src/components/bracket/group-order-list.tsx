import type { ParticipantMap } from "@/utils/participants";

export interface GroupOrderListProps {
  name: string;
  order: string[];
  qualifiers: number;
  participants: ParticipantMap;
  /** Zonder `onReorder` is de volgorde alleen-lezen. */
  onReorder?: (order: string[]) => void;
  /** Optionele knop onder de kaart, bijv. "Volg weer mijn voorspelde uitslagen". */
  footerAction?: { label: string; onPress: () => void };
}

/** Platformvarianten in `group-order-list.ios.tsx` en `.android.tsx`. */
export function GroupOrderList(_props: GroupOrderListProps) {
  return null;
}

import type { ParticipantInfo } from "@/utils/participants";

export interface BracketGroupListRowProps {
  position: number;
  team: ParticipantInfo | null;
  isQualified: boolean;
}

/** Alleen iOS (`bracket-group-list-row.ios.tsx`); Android gebruikt de eigen sleeplijst. */
export function BracketGroupListRow(_props: BracketGroupListRowProps) {
  return null;
}

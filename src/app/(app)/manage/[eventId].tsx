import { useLocalSearchParams } from "expo-router";

import type { Id } from "@convex/_generated/dataModel";
import { EventManageScreen } from "@/components/admin/event-manage-screen";

/** Uitslagen invoeren voor een eigen wedstrijd van een poule (eigenaar of beheerder). */
export default function ManageEventRoute() {
  const { eventId } = useLocalSearchParams<{ eventId: Id<"events"> }>();

  return <EventManageScreen eventId={eventId} />;
}

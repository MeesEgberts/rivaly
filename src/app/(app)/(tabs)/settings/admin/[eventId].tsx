import { useLocalSearchParams } from "expo-router";

import type { Id } from "@convex/_generated/dataModel";
import { EventManageScreen } from "@/components/admin/event-manage-screen";

/** Beheer: status en uitslagen van een evenement uit de catalogus. */
export default function AdminEventScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: Id<"events"> }>();

  return <EventManageScreen eventId={eventId} />;
}

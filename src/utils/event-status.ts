import type { Doc } from "@convex/_generated/dataModel";

type EventStatus = Doc<"events">["status"];

const EVENT_STATUS_ORDER: EventStatus[] = [
  "draft",
  "upcoming",
  "live",
  "finished",
];

/** De volgende stap in de levensloop van een evenement, of `null` na "finished". */
export function nextEventStatus(status: EventStatus): EventStatus | null {
  return EVENT_STATUS_ORDER[EVENT_STATUS_ORDER.indexOf(status) + 1] ?? null;
}

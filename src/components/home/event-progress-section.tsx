import { useQuery } from "convex/react";
import { router } from "expo-router";

import { api } from "@convex/_generated/api";
import { NavRow } from "@/components/ui/nav-row";
import { Section } from "@/components/ui/screen";
import { useNow } from "@/hooks/use-now";

import { eventProgressSubtitle } from "@/utils/event-progress";

/** "Jouw toernooien": per evenement hoeveel er nog openstaat. Tik om in te vullen. */
export function EventProgressSection() {
  const now = useNow();
  const events = useQuery(api.predictions.overview, { now });

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <Section title="Jouw toernooien">
      {events.map((event) => {
        const isDone = event.open > 0 && event.predicted === event.open;

        return (
          <NavRow
            key={event.eventId}
            icon={isDone ? "checkmark.circle.fill" : "trophy"}
            title={event.name}
            subtitle={eventProgressSubtitle(event)}
            value={
              event.open > 0 ? `${event.predicted}/${event.open}` : undefined
            }
            onPress={() => router.push(`/events/${event.eventId}`)}
          />
        );
      })}
    </Section>
  );
}

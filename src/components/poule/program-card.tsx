import { router } from "expo-router";

import { Card } from "@/components/cards/card";
import { CardRow } from "@/components/cards/card-row";
import { Chip } from "@/components/cards/chip";
import { EventMark } from "@/components/event/event-mark";
import { eventHref } from "@/utils/event-preview";
import type { PouleDetail } from "@/utils/poules";

interface Props {
  events: PouleDetail["events"];
}

/** Evenementen van de poule, met logo of sporticoon en puntentelling. */
export function ProgramCard({ events }: Props) {
  return (
    <Card isFlush>
      {events.map((event, index) => (
        <CardRow
          key={event._id}
          leading={
            <EventMark
              logoUrl={event.logoUrl}
              imageUrl={event.preview.imageUrl}
              moduleKey={event.moduleKey}
              size={36}
            />
          }
          title={event.name}
          subtitle={`${event.moduleName} · ${event.presetName}`}
          trailing={event.isCustom ? <Chip text="Eigen" /> : undefined}
          onPress={() => router.push(eventHref(event._id, event.preview))}
          isLast={index === events.length - 1}
        />
      ))}
    </Card>
  );
}

import { router } from "expo-router";

import { Card } from "@/components/cards/card";
import { CardRow } from "@/components/cards/card-row";
import { SymbolBadge } from "@/components/cards/symbol-badge";
import type { PouleDetail } from "@/utils/poules";
import { moduleIcon } from "@/utils/sport-icon";

interface Props {
  events: PouleDetail["events"];
}

/** Evenementen van de poule, met sporticoon en puntentelling. */
export function ProgramCard({ events }: Props) {
  return (
    <Card isFlush>
      {events.map((event, index) => (
        <CardRow
          key={event._id}
          leading={<SymbolBadge name={moduleIcon(event.moduleKey)} size={36} />}
          title={event.name}
          subtitle={`${event.moduleName} · ${event.presetName}`}
          onPress={() => router.push(`/events/${event._id}`)}
          isLast={index === events.length - 1}
        />
      ))}
    </Card>
  );
}

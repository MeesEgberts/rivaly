import { useQuery } from "convex/react";
import { router } from "expo-router";

import { api } from "@convex/_generated/api";
import { getModule } from "@modules/registry";
import { LoadingScreen } from "@/components/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section } from "@/components/ui/screen";
import { formatDate } from "@/utils/format";
import { moduleIcon } from "@/utils/sport-icon";

/**
 * Beheer: overzicht van alle evenementen. Evenementen zelf aanmaken gaat in
 * fase 0 via het seed-script of het Convex-dashboard; uitslagen via de app.
 */
export default function AdminScreen() {
  const events = useQuery(api.admin.listEvents);

  if (events === undefined) {
    return <LoadingScreen />;
  }

  return (
    <Screen>
      {events.length === 0 ? (
        <Section>
          <EmptyState
            icon="calendar.badge.plus"
            title="Nog geen evenementen"
            description="Draai npx convex run seed:testCup voor een testtoernooi."
          />
        </Section>
      ) : (
        <Section title="Evenementen">
          {events.map((event) => (
            <NavRow
              key={event._id}
              icon={moduleIcon(event.moduleKey)}
              title={event.name}
              subtitle={`${getModule(event.moduleKey).name} · ${formatDate(event.startsAt)}`}
              value={event.status}
              onPress={() => router.push(`/settings/admin/${event._id}`)}
            />
          ))}
        </Section>
      )}
    </Screen>
  );
}

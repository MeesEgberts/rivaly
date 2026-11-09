import { useQuery } from "convex/react";

import { api } from "@convex/_generated/api";
import { ClosingSoonSection } from "@/components/home/closing-soon-section";
import { EventProgressSection } from "@/components/home/event-progress-section";
import { LoadingScreen } from "@/components/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { Screen, Section } from "@/components/ui/screen";
import { useNow } from "@/hooks/use-now";

export default function HomeScreen() {
  const now = useNow();
  const events = useQuery(api.predictions.overview, { now });

  if (events === undefined) {
    return <LoadingScreen />;
  }

  if (events.length === 0) {
    return (
      <Screen>
        <Section>
          <EmptyState
            icon="sportscourt"
            title="Niets te voorspellen"
            description="Maak een poule of doe mee met een code via het tabblad Poules."
          />
        </Section>
      </Screen>
    );
  }

  return (
    <Screen>
      <EventProgressSection />
      <ClosingSoonSection />
    </Screen>
  );
}

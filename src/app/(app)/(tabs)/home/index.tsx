import { useQuery } from "convex/react";
import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { api } from "@convex/_generated/api";
import { SectionTitle } from "@/components/cards/section-title";
import { AllDoneCard } from "@/components/home/all-done-card";
import { ClosingSoonSection } from "@/components/home/closing-soon-section";
import { EventProgressCard } from "@/components/home/event-progress-card";
import { NextDeadlineCard } from "@/components/home/next-deadline-card";
import { LoadingScreen } from "@/components/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { Screen, Section } from "@/components/ui/screen";
import { useAppColors } from "@/hooks/use-app-colors";
import { useNow } from "@/hooks/use-now";
import { todoItems } from "@/utils/home";

const MAX_UPCOMING = 5;

/**
 * Wat je nu moet doen: de eerstvolgende deadline groot bovenaan, daarna je
 * evenementen met voortgang en wat er verder binnenkort sluit.
 */
export default function HomeScreen() {
  const colors = useAppColors();
  const now = useNow();
  const events = useQuery(api.predictions.overview, { now });
  const items = useQuery(api.predictions.open, { now });

  const todo = useMemo(() => todoItems(items ?? []), [items]);

  if (events === undefined || items === undefined) {
    return <LoadingScreen />;
  }

  if (events.length === 0) {
    return (
      <Screen>
        <Section>
          <EmptyState
            icon="target"
            title="Niets te voorspellen"
            description="Maak een poule of doe mee met een code via het tabblad Poules."
          />
        </Section>
      </Screen>
    );
  }

  const [next, ...rest] = todo;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      {next ? <NextDeadlineCard item={next} now={now} /> : <AllDoneCard />}

      <ClosingSoonSection items={rest.slice(0, MAX_UPCOMING)} now={now} />

      <SectionTitle>Jouw evenementen</SectionTitle>
      {events.map((event) => (
        <EventProgressCard key={event.eventId} event={event} now={now} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 120 },
});

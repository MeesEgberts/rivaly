import { useQuery } from "convex/react";
import { Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { EmptyCard } from "@/components/cards/empty-card";
import { SectionTitle } from "@/components/cards/section-title";
import { MemberSkeleton } from "@/components/skeleton/member-skeleton";
import { SkeletonScreen } from "@/components/skeleton/skeleton-screen";
import { MemberEventCard } from "@/components/poule/member-event-card";
import { MemberHeroCard } from "@/components/poule/member-hero-card";
import { useAppColors } from "@/hooks/use-app-colors";
import { useNow } from "@/hooks/use-now";
import { eventsWithFixtures } from "@/utils/member-predictions";
import { firstName } from "@/utils/poules";

/** Wat een poulegenoot heeft ingevuld, per evenement, met de punten erbij. */
export default function MemberScreen() {
  const { pouleId, userId, title } = useLocalSearchParams<{
    pouleId: Id<"poules">;
    userId: Id<"users">;
    title?: string;
  }>();
  const colors = useAppColors();
  const now = useNow();
  const poule = useQuery(api.poules.get, { pouleId });
  const data = useQuery(api.predictions.forMemberInPoule, {
    pouleId,
    userId,
    now,
  });

  // De titel staat er vanaf het begin, zodat hij niet na de overgang inspringt.
  const header = (
    <Stack.Screen
      options={{ title: data ? firstName(data.member.name) : (title ?? "") }}
    />
  );

  if (poule === undefined || data === undefined) {
    return (
      <>
        {header}
        <SkeletonScreen>
          <MemberSkeleton />
        </SkeletonScreen>
      </>
    );
  }

  const events = eventsWithFixtures(data.events);

  return (
    <>
      {header}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
      >
        <MemberHeroCard member={data.member} pouleName={poule.name} />

        <SectionTitle>Voorspellingen</SectionTitle>
        {events.length === 0 ? (
          <EmptyCard
            icon="list.bullet.rectangle"
            title="Nog niets te zien"
            description="Deze poule heeft nog geen onderdelen om te voorspellen."
          />
        ) : (
          events.map((event) => (
            <MemberEventCard key={event.eventId} event={event} />
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 120 },
});

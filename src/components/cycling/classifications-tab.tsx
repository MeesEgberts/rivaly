import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import type { Id } from "@convex/_generated/dataModel";
import { cyclingStageKinds } from "@modules/cycling/module";
import { LoadingScreen } from "@/components/loading-screen";
import { useAppColors } from "@/hooks/use-app-colors";
import { useEventData } from "@/hooks/use-event-data";
import { useNow } from "@/hooks/use-now";
import {
  answeredCount,
  fixturesOfKind,
  questionIcon,
} from "@/utils/prediction-cards";
import { isFixtureOpen } from "@/utils/match-rows";

import { DeadlineCard } from "@/components/cards/deadline-card";
import { JerseyCard } from "./jersey-card";
import { QuestionCard } from "@/components/cards/question-card";
import { SectionTitle } from "@/components/cards/section-title";

interface Props {
  eventId: Id<"events">;
}

/** Klassementen vóór de start: truien als kaarten, daaronder de extra vragen. */
export function ClassificationsTab({ eventId }: Props) {
  const colors = useAppColors();
  const now = useNow();
  const { event, fixtures, participants, isLoading } = useEventData(eventId);

  const questions = useMemo(() => {
    if (!event || !fixtures) {
      return [];
    }

    return fixturesOfKind(
      event.stages,
      fixtures,
      cyclingStageKinds.classification,
    );
  }, [event, fixtures]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (questions.length === 0) {
    return null;
  }

  const jerseys = questions.filter((fixture) => fixture.details?.jersey);
  const others = questions.filter((fixture) => !fixture.details?.jersey);
  const locksAt = Math.min(...questions.map((fixture) => fixture.locksAt));

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <DeadlineCard
        locksAt={locksAt}
        now={now}
        answered={answeredCount(questions)}
        total={questions.length}
      />

      {jerseys.length > 0 ? (
        <>
          <SectionTitle>Truien</SectionTitle>
          <View style={styles.grid}>
            {jerseys.map((fixture) => (
              <JerseyCard
                key={fixture._id}
                fixture={fixture}
                jersey={fixture.details!.jersey!}
                participants={participants}
                isOpen={isFixtureOpen(fixture, now)}
              />
            ))}
          </View>
        </>
      ) : null}

      {others.length > 0 ? (
        <>
          <SectionTitle>Extra vragen</SectionTitle>
          {others.map((fixture) => (
            <QuestionCard
              key={fixture._id}
              fixture={fixture}
              icon={questionIcon(fixture, participants)}
              participants={participants}
              isOpen={isFixtureOpen(fixture, now)}
            />
          ))}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 120 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
});

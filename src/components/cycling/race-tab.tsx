import { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";

import type { Id } from "@convex/_generated/dataModel";
import { cyclingStageKinds } from "@modules/cycling/module";
import { LoadingScreen } from "@/components/loading-screen";
import { useAppColors } from "@/hooks/use-app-colors";
import { useEventData } from "@/hooks/use-event-data";
import { useNow } from "@/hooks/use-now";
import {
  fixtureCardStatus,
  fixturesOfKind,
  questionIcon,
} from "@/utils/prediction-cards";
import { isFixtureOpen } from "@/utils/match-rows";

import { CourseCard } from "./course-card";
import { QuestionCard } from "@/components/cards/question-card";
import { RankingPodium } from "./ranking-podium";
import { SectionTitle } from "@/components/cards/section-title";

interface Props {
  eventId: Id<"events">;
}

/** Eendagskoers: parcours, jouw podium en de extra vragen op één pagina. */
export function RaceTab({ eventId }: Props) {
  const colors = useAppColors();
  const now = useNow();
  const { event, fixtures, participants, isLoading } = useEventData(eventId);

  const questions = useMemo(() => {
    if (!event || !fixtures) {
      return [];
    }

    return fixturesOfKind(event.stages, fixtures, cyclingStageKinds.race);
  }, [event, fixtures]);

  if (isLoading || !event) {
    return <LoadingScreen />;
  }

  const podium = questions.find(
    (fixture) => fixture.payload.type === "ranking",
  );
  const others = questions.filter((fixture) => fixture !== podium);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      {podium ? (
        <>
          <CourseCard
            caption={event.seriesNames[0] ?? "Eendagskoers"}
            fallbackTitle={event.name}
            details={podium.details}
            startsAt={podium.startsAt}
            locksAt={podium.locksAt}
            status={fixtureCardStatus(podium, now)}
            now={now}
          />
          <RankingPodium
            fixture={podium}
            status={fixtureCardStatus(podium, now)}
            participants={participants}
          />
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
  content: { padding: 16, gap: 16, paddingBottom: 120 },
});

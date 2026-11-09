import { useMemo } from "react";
import { Animated, StyleSheet, View } from "react-native";

import type { Id } from "@convex/_generated/dataModel";
import { footballStageKinds } from "@modules/football/module";
import { DeadlineCard } from "@/components/cards/deadline-card";
import { PredictionTile } from "@/components/cards/prediction-tile";
import { QuestionCard } from "@/components/cards/question-card";
import { SectionTitle } from "@/components/cards/section-title";
import { SymbolBadge } from "@/components/cards/symbol-badge";
import { LoadingScreen } from "@/components/loading-screen";
import { TROPHY_COLOR } from "@/constants/result-colors";
import { useAppColors } from "@/hooks/use-app-colors";
import { useEventData } from "@/hooks/use-event-data";
import { useEventScroll } from "@/hooks/use-event-scroll";
import { useNow } from "@/hooks/use-now";
import { isFixtureOpen } from "@/utils/match-rows";
import {
  answeredCount,
  fixturesOfKind,
  iconTint,
  questionIcon,
  questionSize,
} from "@/utils/prediction-cards";

interface Props {
  eventId: Id<"events">;
}

/**
 * Bonusvragen als kaarten: keuzes en volgordes als tegels (kampioen met een
 * gouden trofee), getallen als brede kaart eronder.
 */
export function BonusTab({ eventId }: Props) {
  const colors = useAppColors();
  const now = useNow();
  const { event, fixtures, participants, isLoading } = useEventData(eventId);
  const { header, scrollRef, scrollProps } = useEventScroll();

  const questions = useMemo(() => {
    if (!event || !fixtures) {
      return [];
    }

    return fixturesOfKind(event.stages, fixtures, footballStageKinds.bonus);
  }, [event, fixtures]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (questions.length === 0) {
    return null;
  }

  const tiles = questions.filter(
    (fixture) =>
      fixture.payload.type === "pick" || fixture.payload.type === "ranking",
  );
  const others = questions.filter((fixture) => !tiles.includes(fixture));
  const locksAt = Math.min(...questions.map((fixture) => fixture.locksAt));

  return (
    <Animated.ScrollView
      ref={scrollRef}
      {...scrollProps}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
    >
      {header}
      <View style={styles.content}>
        <DeadlineCard
          locksAt={locksAt}
          now={now}
          answered={answeredCount(questions)}
          total={questions.length}
        />

        {tiles.length > 0 ? (
          <>
            <SectionTitle>Bonusvragen</SectionTitle>
            <View style={styles.grid}>
              {tiles.map((fixture) => {
                const icon = questionIcon(fixture, participants);

                return (
                  <PredictionTile
                    key={fixture._id}
                    fixture={fixture}
                    visual={
                      <SymbolBadge
                        name={icon}
                        tint={iconTint(icon, TROPHY_COLOR)}
                      />
                    }
                    title={fixture.label ?? "Vraag"}
                    subtitle={questionSize(fixture) ?? undefined}
                    participants={participants}
                    isOpen={isFixtureOpen(fixture, now)}
                  />
                );
              })}
            </View>
          </>
        ) : null}

        {others.length > 0 ? (
          <>
            <SectionTitle>Aantallen</SectionTitle>
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
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120 },
  content: { padding: 16, gap: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
});

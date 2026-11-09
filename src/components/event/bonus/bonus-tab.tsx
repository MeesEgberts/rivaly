import { router } from "expo-router";
import { useMemo } from "react";

import type { Id } from "@convex/_generated/dataModel";
import { footballStageKinds } from "@modules/football/module";
import { LoadingScreen } from "@/components/loading-screen";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section } from "@/components/ui/screen";
import { useEventData } from "@/hooks/use-event-data";
import { useNow } from "@/hooks/use-now";
import { describeValue } from "@/utils/fixture-text";
import { formatDateTime } from "@/utils/format";
import { isFixtureOpen } from "@/utils/match-rows";

interface Props {
  eventId: Id<"events">;
}

/** Bonus- en seizoensvragen: kampioen, topscorer, aantallen. */
export function BonusTab({ eventId }: Props) {
  const now = useNow();
  const { event, fixtures, participants, isLoading } = useEventData(eventId);

  const sections = useMemo(() => {
    if (!event || !fixtures) {
      return [];
    }

    return event.stages
      .filter((stage) => stage.kind === footballStageKinds.bonus)
      .map((stage) => ({
        stageId: stage._id,
        name: stage.name,
        fixtures: fixtures.filter((fixture) => fixture.stageId === stage._id),
      }))
      .filter((section) => section.fixtures.length > 0);
  }, [event, fixtures]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Screen>
      {sections.map((section) => (
        <Section key={section.stageId} title={section.name}>
          {section.fixtures.map((fixture) => {
            const isOpen = isFixtureOpen(fixture, now);
            const answer = fixture.myPrediction
              ? describeValue(
                  fixture.myPrediction,
                  fixture.payload,
                  participants,
                )
              : null;
            const subtitle = isOpen
              ? `Sluit ${formatDateTime(fixture.locksAt)}`
              : "Gesloten";

            return (
              <NavRow
                key={fixture._id}
                icon={answer ? "checkmark.circle.fill" : "questionmark.circle"}
                title={fixture.label ?? "Bonusvraag"}
                subtitle={answer ? `${answer} · ${subtitle}` : subtitle}
                value={answer || !isOpen ? undefined : "Invullen"}
                onPress={() => router.push(`/predict/${fixture._id}`)}
              />
            );
          })}
        </Section>
      ))}
    </Screen>
  );
}

import { useMemo } from "react";

import type { Id } from "@convex/_generated/dataModel";
import { footballStageKinds } from "@modules/football/module";
import { LoadingScreen } from "@/components/loading-screen";
import { MatchdayDayCard } from "@/components/event/matchdays/matchday-day-card";
import { ScoreEntryScrollView } from "@/components/score-entry/score-entry-scroll-view";
import { useEventData } from "@/hooks/use-event-data";
import { useNow } from "@/hooks/use-now";
import {
  knockoutRoundIcon,
  toEditableMatches,
  toMatchRows,
} from "@/utils/match-rows";

interface Props {
  eventId: Id<"events">;
}

/**
 * De echte knock-outwedstrijden, zodra de teams bekend zijn. Los van je
 * vooraf ingevulde schema voorspel je hier de uitslag per wedstrijd.
 */
export function KnockoutMatchesTab({ eventId }: Props) {
  const now = useNow();
  const { event, fixtures, participants, isLoading } = useEventData(eventId);

  const stages = useMemo(() => {
    if (!event || !fixtures) {
      return [];
    }

    return event.stages
      .filter((stage) => stage.kind === footballStageKinds.knockout)
      .map((stage) => ({
        stageId: stage._id,
        name: stage.name,
        matches: toMatchRows(
          fixtures.filter((fixture) => fixture.stageId === stage._id),
          participants,
          now,
        ),
      }))
      .filter((stage) => stage.matches.length > 0);
  }, [event, fixtures, participants, now]);

  const editable = useMemo(
    () => toEditableMatches(stages.flatMap((stage) => stage.matches)),
    [stages],
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScoreEntryScrollView matches={editable}>
      {stages.map((stage) => (
        <MatchdayDayCard
          key={stage.stageId}
          title={stage.name}
          matches={stage.matches}
          icon={knockoutRoundIcon(stage.name)}
        />
      ))}
    </ScoreEntryScrollView>
  );
}

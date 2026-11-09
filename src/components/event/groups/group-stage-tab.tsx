import { useMemo } from "react";

import type { Id } from "@convex/_generated/dataModel";
import { LoadingScreen } from "@/components/loading-screen";
import { ScoreEntryScrollView } from "@/components/score-entry/score-entry-scroll-view";
import { useEventData } from "@/hooks/use-event-data";
import { useNow } from "@/hooks/use-now";
import { toEditableMatches, toMatchRows } from "@/utils/match-rows";

import { GroupCard } from "./group-card";
import { groupSections } from "@/utils/group-sections";
import { GroupStageIntro } from "./group-stage-intro";

interface Props {
  eventId: Id<"events">;
}

/** Alle groepen onder elkaar; één cijferblok loopt door alle wedstrijden. */
export function GroupStageTab({ eventId }: Props) {
  const now = useNow();
  const { event, fixtures, participants, isLoading } = useEventData(eventId);

  const sections = useMemo(() => {
    if (!event || !fixtures) {
      return [];
    }

    return groupSections(event.stages, fixtures, participants, now);
  }, [event, fixtures, participants, now]);

  const editable = useMemo(
    () => toEditableMatches(sections.flatMap((section) => section.matches)),
    [sections],
  );

  const allRows = useMemo(() => {
    if (!fixtures) {
      return [];
    }

    return toMatchRows(fixtures, participants, now);
  }, [fixtures, participants, now]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScoreEntryScrollView matches={editable}>
      <GroupStageIntro
        open={editable.length}
        predicted={editable.filter((match) => match.saved !== null).length}
        hasLockedRows={allRows.some((row) => row.isLocked)}
      />
      {sections.map((section) => (
        <GroupCard
          key={section.stageId}
          name={section.name}
          matches={section.matches}
          qualifiers={section.qualifiers}
        />
      ))}
    </ScoreEntryScrollView>
  );
}

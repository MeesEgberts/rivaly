import { useMemo } from "react";
import { View } from "react-native";

import { ScoreEntryScrollView } from "@/components/score-entry/score-entry-scroll-view";
import { toEditableMatches } from "@/utils/match-rows";

import { MatchdayDayCard } from "./matchday-day-card";
import { MatchdaySummary } from "./matchday-summary";
import { matchesByDay } from "@/utils/matchdays";
import type { MatchdayRound } from "@/utils/matchday-rounds";

interface Props {
  round: MatchdayRound;
  width: number;
}

/** Eén speelronde als pagina in de swipebare lijst, met eigen cijferblok. */
export function MatchdayPage({ round, width }: Props) {
  const editable = useMemo(() => toEditableMatches(round.matches), [round]);
  const days = useMemo(() => matchesByDay(round.matches), [round]);

  return (
    <View style={{ width, flex: 1 }}>
      <ScoreEntryScrollView matches={editable}>
        <MatchdaySummary round={round} />
        {days.map((day) => (
          <MatchdayDayCard
            key={day.key}
            title={day.title}
            matches={day.matches}
          />
        ))}
      </ScoreEntryScrollView>
    </View>
  );
}

import { useMemo } from "react";
import { View } from "react-native";

import { MatchdayDayCard } from "./matchday-day-card";
import { MatchdaySummary } from "./matchday-summary";
import { matchesByDay } from "@/utils/matchdays";
import type { MatchdayRound } from "@/utils/matchday-rounds";

interface Props {
  round: MatchdayRound;
  width: number;
}

/**
 * Eén speelronde als pagina in de swipebare rij. Scrollt niet zelf: de tab
 * is één lijst met het cijferblok voor de ronde die in beeld is.
 */
export function MatchdayPage({ round, width }: Props) {
  const days = useMemo(() => matchesByDay(round.matches), [round]);

  return (
    <View style={{ width }}>
      <MatchdaySummary round={round} />
      {days.map((day) => (
        <MatchdayDayCard
          key={day.key}
          title={day.title}
          matches={day.matches}
        />
      ))}
    </View>
  );
}

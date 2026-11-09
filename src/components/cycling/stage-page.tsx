import { StyleSheet, View } from "react-native";

import type { CyclingStage } from "@/utils/cycling";
import type { ParticipantMap } from "@/utils/participants";

import { CourseCard } from "./course-card";
import { RankingPodium } from "./ranking-podium";

interface Props {
  stage: CyclingStage;
  width: number;
  participants: ParticipantMap;
  now: number;
}

/**
 * Eén etappe als pagina in de swipebare rij: parcours, jouw podium en de
 * uitslag. Scrollt niet zelf; de hele tab is één verticale lijst.
 */
export function StagePage({ stage, width, participants, now }: Props) {
  const { fixture } = stage;

  return (
    <View style={[styles.content, { width }]}>
      <CourseCard
        caption={`Etappe ${stage.number}`}
        fallbackTitle={`Etappe ${stage.number}`}
        details={fixture.details}
        startsAt={fixture.startsAt}
        locksAt={fixture.locksAt}
        status={stage.status}
        now={now}
      />
      <RankingPodium
        fixture={fixture}
        status={stage.status}
        participants={participants}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
});

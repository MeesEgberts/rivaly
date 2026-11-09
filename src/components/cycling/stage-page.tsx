import { ScrollView, StyleSheet } from "react-native";

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

/** Eén etappe: parcours bovenaan, daaronder jouw podium en de uitslag. */
export function StagePage({ stage, width, participants, now }: Props) {
  const { fixture } = stage;

  return (
    <ScrollView
      style={{ width }}
      contentInsetAdjustmentBehavior="never"
      contentContainerStyle={styles.content}
    >
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 120 },
});

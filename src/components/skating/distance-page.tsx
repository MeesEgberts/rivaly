import { StyleSheet, View } from "react-native";

import { RankingPodium } from "@/components/cycling/ranking-podium";
import type { ParticipantMap } from "@/utils/participants";
import type { SkatingDistance } from "@/utils/skating";

import { DistanceCard } from "./distance-card";

interface Props {
  distance: SkatingDistance;
  width: number;
  participants: ParticipantMap;
  now: number;
}

/** Eén afstand als pagina in de swipebare rij: kop, jouw podium en de uitslag. */
export function DistancePage({ distance, width, participants, now }: Props) {
  return (
    <View style={[styles.content, { width }]}>
      <DistanceCard distance={distance} now={now} />
      <RankingPodium
        fixture={distance.fixture}
        status={distance.status}
        participants={participants}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16 },
});

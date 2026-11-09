import { StyleSheet, Text, View } from "react-native";

import { TeamBadge } from "@/components/match/team-badge";
import { useAppColors } from "@/hooks/use-app-colors";
import { participantInfo, type ParticipantMap } from "@/utils/participants";

import {
  MATCH_HEIGHT,
  ROUND_HEADER_HEIGHT,
  matchCenter,
} from "@/utils/bracket-layout";

interface Props {
  champion: string | null;
  participants: ParticipantMap;
  /** Het aantal rondes; de kampioen staat in de "ronde" erna. */
  roundIndex: number;
  width: number;
  height: number;
}

/** Laatste kolom: de beker met jouw kampioen. */
export function BracketChampionColumn({
  champion,
  participants,
  roundIndex,
  width,
  height,
}: Props) {
  const colors = useAppColors();
  const team = participantInfo(participants, champion);
  const top = matchCenter(roundIndex - 1, 0) - MATCH_HEIGHT / 2;

  return (
    <View style={{ width }}>
      <Text style={[styles.title, { color: colors.secondaryLabel }]}>
        Kampioen
      </Text>
      <View style={{ height }}>
        <View
          style={[
            styles.card,
            {
              top,
              backgroundColor: team ? colors.accent : colors.card,
              borderColor: team ? colors.accent : colors.separator,
            },
          ]}
        >
          <Text style={styles.trophy}>🏆</Text>
          {team ? (
            <View style={styles.team}>
              <TeamBadge code={team.code} isOnAccent />
              <Text
                numberOfLines={1}
                style={[styles.name, { color: colors.onAccent }]}
              >
                {team.name}
              </Text>
            </View>
          ) : (
            <Text style={[styles.empty, { color: colors.tertiaryLabel }]}>
              Kies de winnaar van de finale
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    height: ROUND_HEADER_HEIGHT,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    height: MATCH_HEIGHT,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 12,
  },
  trophy: { fontSize: 26 },
  team: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 16, fontWeight: "700", flexShrink: 1 },
  empty: { fontSize: 13, textAlign: "center" },
});

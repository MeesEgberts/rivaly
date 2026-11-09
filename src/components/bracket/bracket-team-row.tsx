import { Pressable, StyleSheet, Text, View } from "react-native";

import { TeamBadge } from "@/components/match/team-badge";
import { useAppColors } from "@/hooks/use-app-colors";
import type { ParticipantInfo } from "@/utils/participants";

import { TEAM_ROW_HEIGHT } from "@/utils/bracket-layout";
import { teamNameColor } from "@/utils/bracket-colors";

export type TeamResultMark = "correct" | "wrong" | null;

interface Props {
  team: ParticipantInfo | null;
  /** Tekst voor een lege plek, bijv. "1e groep A". */
  placeholder: string;
  isWinner: boolean;
  /** De andere ploeg is gekozen; deze wordt gedimd. */
  isLoser: boolean;
  resultMark: TeamResultMark;
  onPress?: () => void;
}

/** Eén ploeg in een bracketwedstrijd. Tik om hem door te laten. */
export function BracketTeamRow({
  team,
  placeholder,
  isWinner,
  isLoser,
  resultMark,
  onPress,
}: Props) {
  const colors = useAppColors();

  if (!team) {
    return (
      <View style={styles.row}>
        <View style={[styles.emptyBadge, { borderColor: colors.separator }]} />
        <Text
          numberOfLines={1}
          style={[styles.placeholder, { color: colors.tertiaryLabel }]}
        >
          {placeholder}
        </Text>
      </View>
    );
  }

  const nameColor = teamNameColor(colors, isWinner, isLoser);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isWinner }}
      accessibilityLabel={`${team.name}${isWinner ? ", gekozen als winnaar" : ""}`}
      style={({ pressed }) => [
        styles.row,
        isWinner && { backgroundColor: colors.accent },
        pressed && !isWinner && { backgroundColor: colors.fill },
      ]}
    >
      <TeamBadge
        code={team.code}
        imageUrl={team.imageUrl}
        isOnAccent={isWinner}
      />
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          { color: nameColor },
          isWinner && styles.winnerName,
          resultMark === "wrong" && styles.wrong,
        ]}
      >
        {team.name}
      </Text>
      {resultMark === "correct" ? (
        <Text
          style={[
            styles.mark,
            { color: isWinner ? colors.onAccent : colors.success },
          ]}
        >
          ✓
        </Text>
      ) : null}
      {isWinner && resultMark === null ? (
        <Text style={[styles.mark, { color: colors.onAccent }]}>›</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    height: TEAM_ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  emptyBadge: {
    width: 34,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  placeholder: { flex: 1, fontSize: 13, fontStyle: "italic" },
  name: { flex: 1, fontSize: 15 },
  winnerName: { fontWeight: "600" },
  wrong: { textDecorationLine: "line-through" },
  mark: { fontSize: 16, fontWeight: "600" },
});

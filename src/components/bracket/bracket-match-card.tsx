import { StyleSheet, View } from "react-native";

import type { ResolvedMatch } from "@modules/fixture-types/bracket-tree";
import { useAppColors } from "@/hooks/use-app-colors";
import { participantInfo, type ParticipantMap } from "@/utils/participants";

import { MATCH_HEIGHT } from "@/utils/bracket-layout";
import { slotPlaceholder } from "@/utils/bracket-labels";
import { BracketTeamRow, type TeamResultMark } from "./bracket-team-row";

interface Props {
  match: ResolvedMatch;
  participants: ParticipantMap;
  labels: Map<string, string>;
  /** Welke teams echt in deze ronde staan; `null` zolang de uitslag onbekend is. */
  actualTeams: Set<string> | null;
  top: number;
  width: number;
  onPick?: (teamId: string) => void;
}

function markFor(
  teamId: string | null,
  actualTeams: Set<string> | null,
): TeamResultMark {
  if (teamId === null || actualTeams === null || actualTeams.size === 0) {
    return null;
  }

  return actualTeams.has(teamId) ? "correct" : "wrong";
}

/** Eén wedstrijd in de bracket: twee ploegen onder elkaar. */
export function BracketMatchCard({
  match,
  participants,
  labels,
  actualTeams,
  top,
  width,
  onPick,
}: Props) {
  const colors = useAppColors();
  const hasWinner = match.winner !== null;

  const slots = [
    { teamId: match.home, source: match.homeSource },
    { teamId: match.away, source: match.awaySource },
  ];

  return (
    <View
      style={[
        styles.card,
        {
          top,
          width,
          backgroundColor: colors.card,
          borderColor: hasWinner ? colors.accent : colors.separator,
        },
      ]}
    >
      {slots.map(({ teamId, source }, index) => (
        <View key={index}>
          {index === 1 ? (
            <View
              style={[styles.divider, { backgroundColor: colors.separator }]}
            />
          ) : null}
          <BracketTeamRow
            team={participantInfo(participants, teamId)}
            placeholder={slotPlaceholder(source, labels)}
            isWinner={hasWinner && match.winner === teamId}
            isLoser={hasWinner && match.winner !== teamId}
            resultMark={markFor(teamId, actualTeams)}
            onPress={
              teamId !== null && onPick ? () => onPick(teamId) : undefined
            }
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    left: 0,
    height: MATCH_HEIGHT,
    borderRadius: 10,
    borderWidth: 1,
    overflow: "hidden",
  },
  divider: { height: StyleSheet.hairlineWidth },
});

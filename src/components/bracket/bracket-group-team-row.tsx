import { StyleSheet, Text, View } from "react-native";

import { TeamBadge } from "@/components/match/team-badge";
import { useAppColors } from "@/hooks/use-app-colors";
import type { ParticipantInfo } from "@/utils/participants";

interface Props {
  team: ParticipantInfo | null;
  isDraggable: boolean;
}

/** Team in de groepskaart, met sleepgreep rechts. */
export function BracketGroupTeamRow({ team, isDraggable }: Props) {
  const colors = useAppColors();

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.card, borderTopColor: colors.separator },
      ]}
      accessibilityLabel={
        isDraggable
          ? `${team?.name ?? "Team"}, vasthouden om te verslepen`
          : team?.name
      }
    >
      <TeamBadge code={team?.code ?? "?"} imageUrl={team?.imageUrl} />
      <Text numberOfLines={1} style={[styles.name, { color: colors.label }]}>
        {team?.name ?? "Onbekend"}
      </Text>
      {isDraggable ? (
        <Text style={[styles.handle, { color: colors.tertiaryLabel }]}>≡</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  name: { flex: 1, fontSize: 15 },
  handle: { fontSize: 22, lineHeight: 24 },
});

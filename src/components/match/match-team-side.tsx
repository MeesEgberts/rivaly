import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import type { ParticipantInfo } from "@/utils/participants";

import { TeamBadge } from "./team-badge";

interface Props {
  team: ParticipantInfo;
  isActive: boolean;
}

/** Eén kant van het scorebord: landcode met de naam eronder. */
export function MatchTeamSide({ team, isActive }: Props) {
  const colors = useAppColors();

  return (
    <View style={styles.side}>
      <TeamBadge code={team.code} />
      <Text
        numberOfLines={1}
        style={[
          styles.name,
          { color: colors.label },
          isActive && styles.active,
        ]}
      >
        {team.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  side: { flex: 1, alignItems: "center", gap: 4 },
  name: { fontSize: 14, textAlign: "center" },
  active: { fontWeight: "700" },
});

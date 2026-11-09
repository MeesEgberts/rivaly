import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import type { ParticipantInfo } from "@/utils/participants";

import { TeamBadge } from "./team-badge";

interface Props {
  team: ParticipantInfo;
  value: number | null;
  /** Zonder handlers alleen-lezen. */
  onIncrement?: () => void;
  onDecrement?: () => void;
}

/** Eén kant van de wedstrijdkaart: badge, naam en grote score met − en +. */
export function ScoreStepperColumn({
  team,
  value,
  onIncrement,
  onDecrement,
}: Props) {
  const colors = useAppColors();
  const isEditable = onIncrement !== undefined && onDecrement !== undefined;

  return (
    <View style={styles.column}>
      <TeamBadge code={team.code} imageUrl={team.imageUrl} size="large" />
      <Text numberOfLines={2} style={[styles.name, { color: colors.label }]}>
        {team.name}
      </Text>

      <View style={styles.stepper}>
        {isEditable ? (
          <Pressable
            onPress={onDecrement}
            hitSlop={8}
            accessibilityLabel={`Eén doelpunt minder voor ${team.name}`}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? colors.accentSoft : colors.fill },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.accent }]}>−</Text>
          </Pressable>
        ) : null}

        <Text
          accessibilityLabel={`${team.name}: ${value ?? "nog niet ingevuld"}`}
          style={[
            styles.value,
            { color: value === null ? colors.tertiaryLabel : colors.label },
          ]}
        >
          {value ?? "–"}
        </Text>

        {isEditable ? (
          <Pressable
            onPress={onIncrement}
            hitSlop={8}
            accessibilityLabel={`Eén doelpunt meer voor ${team.name}`}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? colors.accentSoft : colors.fill },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.accent }]}>+</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, alignItems: "center", gap: 8 },
  name: { fontSize: 16, fontWeight: "600", textAlign: "center", minHeight: 22 },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 24, fontWeight: "500", lineHeight: 28 },
  value: {
    fontSize: 48,
    fontWeight: "700",
    minWidth: 40,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
});

import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import {
  formatTimeLeft,
  type FixtureCardStatus,
} from "@/utils/prediction-cards";

interface Props {
  status: FixtureCardStatus;
  locksAt: number;
  now: number;
}

/** "Sluit nog 3 u", "Ingevuld", "Gesloten" of "Uitslag bekend". */
export function StatusPill({ status, locksAt, now }: Props) {
  const colors = useAppColors();

  const text = {
    todo: `Sluit ${formatTimeLeft(locksAt, now)}`,
    done: `Ingevuld · ${formatTimeLeft(locksAt, now)}`,
    locked: "Gesloten",
    finished: "Uitslag bekend",
  }[status];

  const tint =
    status === "todo"
      ? colors.accent
      : status === "locked"
        ? colors.secondaryLabel
        : colors.success;

  return (
    <View style={[styles.pill, { backgroundColor: colors.fill }]}>
      <View style={[styles.dot, { backgroundColor: tint }]} />
      <Text style={[styles.text, { color: tint }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 13, fontWeight: "600" },
});

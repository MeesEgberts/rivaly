import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import type { FixtureCardStatus } from "@/utils/prediction-cards";

export const STAGE_CHIP_WIDTH = 52;

interface Props {
  number: number;
  day: string;
  status: FixtureCardStatus;
  isSelected: boolean;
  onPress: () => void;
}

/** Eén etappe in de strip: nummer, dag en een stip (in te vullen) of vinkje. */
export function StageStripChip({
  number,
  day,
  status,
  isSelected,
  onPress,
}: Props) {
  const colors = useAppColors();
  const foreground = isSelected ? colors.onAccent : colors.label;
  const muted = isSelected ? colors.onAccent : colors.secondaryLabel;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Etappe ${number}, ${day}`}
      style={[
        styles.chip,
        { backgroundColor: isSelected ? colors.accent : colors.card },
      ]}
    >
      <Text style={[styles.number, { color: foreground }]}>{number}</Text>
      <Text style={[styles.day, { color: muted }]}>{day}</Text>
      <View style={styles.marker}>
        {status === "todo" ? (
          <View
            style={[
              styles.dot,
              { backgroundColor: isSelected ? colors.onAccent : colors.accent },
            ]}
          />
        ) : null}
        {status === "done" || status === "finished" ? (
          <Text
            style={[
              styles.check,
              { color: isSelected ? colors.onAccent : colors.success },
            ]}
          >
            ✓
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: STAGE_CHIP_WIDTH,
    height: 62,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  number: { fontSize: 18, fontWeight: "700", fontVariant: ["tabular-nums"] },
  day: { fontSize: 10, fontWeight: "500" },
  marker: { height: 10, alignItems: "center", justifyContent: "center" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  check: { fontSize: 9, fontWeight: "800", lineHeight: 10 },
});

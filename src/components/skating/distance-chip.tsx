import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import type { SkatingDistance } from "@/utils/skating";

export const DISTANCE_CHIP_WIDTH = 60;

interface Props {
  distance: SkatingDistance;
  isSelected: boolean;
  onPress: () => void;
}

/** Eén afstand in de strip: meters, mannen/vrouwen en een stip of vinkje. */
export function DistanceChip({ distance, isSelected, onPress }: Props) {
  const colors = useAppColors();
  const foreground = isSelected ? colors.onAccent : colors.label;
  const muted = isSelected ? colors.onAccent : colors.secondaryLabel;
  const { status } = distance;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`${distance.title} ${distance.categoryLabel}`}
      style={[
        styles.chip,
        { backgroundColor: isSelected ? colors.accent : colors.card },
      ]}
    >
      <Text style={[styles.short, { color: foreground }]}>
        {distance.short}
      </Text>
      <Text style={[styles.symbol, { color: muted }]}>{distance.symbol}</Text>
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
    width: DISTANCE_CHIP_WIDTH,
    height: 62,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  short: { fontSize: 16, fontWeight: "700", fontVariant: ["tabular-nums"] },
  symbol: { fontSize: 12, fontWeight: "600" },
  marker: { height: 10, alignItems: "center", justifyContent: "center" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  check: { fontSize: 9, fontWeight: "800", lineHeight: 10 },
});

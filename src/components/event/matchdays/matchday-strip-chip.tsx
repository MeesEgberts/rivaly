import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

import type { RoundStatus } from "@/utils/matchday-rounds";
import { stripChipLabelColor } from "@/utils/matchday-colors";

export const STRIP_CHIP_WIDTH = 44;

interface Props {
  label: string;
  status: RoundStatus;
  isSelected: boolean;
  onPress: () => void;
}

/** Eén ronde in de strip: nummer, met eronder een stip of vinkje. */
export function MatchdayStripChip({
  label,
  status,
  isSelected,
  onPress,
}: Props) {
  const colors = useAppColors();

  const labelColor = stripChipLabelColor(colors, status, isSelected);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={`Speelronde ${label}`}
      style={[
        styles.chip,
        { backgroundColor: isSelected ? colors.accent : colors.card },
      ]}
    >
      <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      <View style={styles.marker}>
        {status === "todo" ? (
          <View
            style={[
              styles.dot,
              { backgroundColor: isSelected ? colors.onAccent : colors.accent },
            ]}
          />
        ) : null}
        {status === "done" ? (
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
    width: STRIP_CHIP_WIDTH,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 17, fontWeight: "600", fontVariant: ["tabular-nums"] },
  marker: { height: 10, alignItems: "center", justifyContent: "center" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  check: { fontSize: 9, fontWeight: "800", lineHeight: 10 },
});

import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

import { QUICK_SCORES } from "@/constants/quick-scores";

interface Props {
  home: number | null;
  away: number | null;
  onSelect: (home: number, away: number) => void;
}

/** Veelvoorkomende uitslagen als tikbare chips. */
export function QuickScoreChips({ home, away, onSelect }: Props) {
  const colors = useAppColors();

  return (
    <View style={styles.wrap}>
      {QUICK_SCORES.map(([chipHome, chipAway]) => {
        const isSelected = chipHome === home && chipAway === away;

        return (
          <Pressable
            key={`${chipHome}-${chipAway}`}
            onPress={() => onSelect(chipHome, chipAway)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? colors.accent : colors.card,
                borderColor: isSelected ? colors.accent : colors.separator,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? colors.onAccent : colors.label },
              ]}
            >
              {chipHome} – {chipAway}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 15, fontWeight: "500", fontVariant: ["tabular-nums"] },
});

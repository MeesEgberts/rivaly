import type { ColorValue } from "react-native";
import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  text: string;
  /** Kleur van tekst en stip; zonder kleur gewone secundaire tekst zonder stip. */
  tint?: ColorValue;
}

/** Klein label in een capsule, bijv. "Uitslag 2–1" of "● Exact goed". */
export function Chip({ text, tint }: Props) {
  const colors = useAppColors();

  return (
    <View style={[styles.chip, { backgroundColor: colors.fill }]}>
      {tint ? <View style={[styles.dot, { backgroundColor: tint }]} /> : null}
      <Text
        numberOfLines={1}
        style={[styles.text, { color: tint ?? colors.secondaryLabel }]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: "600", fontVariant: ["tabular-nums"] },
});

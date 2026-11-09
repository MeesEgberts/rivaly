import { Pressable, StyleSheet, Text } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}

export function ScoreKeypadKey({ label, accessibilityLabel, onPress }: Props) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.key,
        { backgroundColor: pressed ? colors.fill : colors.key },
      ]}
    >
      <Text style={[styles.label, { color: colors.label }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  key: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 24, fontWeight: "500", fontVariant: ["tabular-nums"] },
});

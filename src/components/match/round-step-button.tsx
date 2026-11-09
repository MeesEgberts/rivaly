import { Pressable, StyleSheet, Text } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  symbol: "−" | "+";
  label: string;
  onPress: () => void;
}

/** Ronde − of + knop, zoals op de wedstrijdkaart. */
export function RoundStepButton({ symbol, label, onPress }: Props) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? colors.accentSoft : colors.fill },
      ]}
    >
      <Text style={[styles.symbol, { color: colors.accent }]}>{symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  symbol: { fontSize: 26, fontWeight: "500", lineHeight: 30 },
});

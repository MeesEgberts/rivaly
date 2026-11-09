import { Pressable, StyleSheet, Text } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  value: number | null;
  isActive: boolean;
  /** Zonder `onPress` is het vak alleen-lezen (gesloten wedstrijd). */
  onPress?: () => void;
  accessibilityLabel: string;
}

/** Eén scorevak. Actief vak krijgt een accentrand, leeg vak een streepje. */
export function ScoreBox({
  value,
  isActive,
  onPress,
  accessibilityLabel,
}: Props) {
  const colors = useAppColors();
  const isReadOnly = onPress === undefined;

  const borderColor = isActive ? colors.accent : "transparent";
  const backgroundColor = isActive ? colors.accentSoft : colors.fill;
  const textColor = value === null ? colors.tertiaryLabel : colors.label;

  return (
    <Pressable
      onPress={onPress}
      disabled={isReadOnly}
      accessibilityRole={isReadOnly ? "text" : "button"}
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ text: value === null ? "leeg" : String(value) }}
      hitSlop={4}
      style={[
        styles.box,
        isReadOnly && styles.readOnly,
        {
          borderColor,
          backgroundColor: isReadOnly ? "transparent" : backgroundColor,
        },
      ]}
    >
      <Text style={[styles.value, { color: textColor }]}>
        {value === null ? "–" : value}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 42,
    height: 44,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  readOnly: { width: 28 },
  value: { fontSize: 20, fontWeight: "600", fontVariant: ["tabular-nums"] },
});

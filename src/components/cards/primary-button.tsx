import { Pressable, StyleSheet, Text } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "destructive";
  disabled?: boolean;
}

/** Volle-breedte knop voor eigen kaartschermen. */
export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
}: Props) {
  const colors = useAppColors();
  const isPrimary = variant === "primary";
  const textColor = isPrimary
    ? colors.onAccent
    : variant === "destructive"
      ? colors.danger
      : colors.accent;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary ? colors.accent : colors.card,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 17, fontWeight: "600" },
});

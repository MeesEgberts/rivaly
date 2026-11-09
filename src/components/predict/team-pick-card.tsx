import { Pressable, StyleSheet, Text } from "react-native";

import { TeamBadge } from "@/components/match/team-badge";
import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  label: string;
  /** Landcode voor de badge; zonder code (bijv. een speler) alleen de naam. */
  code: string | null;
  isSelected: boolean;
  onPress?: () => void;
}

/** Eén keuze als kaart, zoals een team in de bracket. */
export function TeamPickCard({ label, code, isSelected, onPress }: Props) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isSelected ? colors.accent : colors.card,
          borderColor: isSelected ? colors.accent : colors.separator,
          opacity: pressed && !isSelected ? 0.7 : 1,
        },
      ]}
    >
      {code ? <TeamBadge code={code} isOnAccent={isSelected} /> : null}
      <Text
        numberOfLines={1}
        style={[
          styles.label,
          { color: isSelected ? colors.onAccent : colors.label },
          isSelected && styles.selectedLabel,
        ]}
      >
        {label}
      </Text>
      {isSelected ? (
        <Text style={[styles.check, { color: colors.onAccent }]}>✓</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "48%",
    flexGrow: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  label: { flex: 1, fontSize: 15 },
  selectedLabel: { fontWeight: "600" },
  check: { fontSize: 16, fontWeight: "700" },
});

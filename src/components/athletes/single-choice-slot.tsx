import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TeamBadge } from "@/components/match/team-badge";
import { useAppColors } from "@/hooks/use-app-colors";
import type { AthleteInfo } from "@/types/athlete";

interface Props {
  athlete: AthleteInfo | null;
  isActive: boolean;
  onPress: () => void;
  noun: string;
}

/** Eén keuze (trui, beste Nederlander): de gekozen renner groot, of een leeg vak. */
export function SingleChoiceSlot({ athlete, isActive, onPress, noun }: Props) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.slot,
        {
          borderColor: isActive ? colors.accent : colors.separator,
          borderStyle: athlete ? "solid" : "dashed",
          backgroundColor:
            isActive && !athlete ? colors.accentSoft : "transparent",
        },
      ]}
    >
      {athlete ? (
        <View style={styles.row}>
          {athlete.code ? <TeamBadge code={athlete.code} size="large" /> : null}
          <Text
            numberOfLines={1}
            style={[styles.name, { color: colors.label }]}
          >
            {athlete.name}
          </Text>
        </View>
      ) : (
        <View style={styles.row}>
          <SymbolView
            name="plus"
            size={18}
            tintColor={colors.accent as string}
          />
          <Text style={[styles.empty, { color: colors.accent }]}>
            Kies je {noun}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    minHeight: 72,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  name: { flex: 1, fontSize: 20, fontWeight: "700" },
  empty: { fontSize: 17, fontWeight: "600" },
});

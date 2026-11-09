import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";
import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  icon: SFSymbol;
  text: string;
}

/** Klein gegeven met icoon, bijv. route, afstand of soort rit. */
export function InfoChip({ icon, text }: Props) {
  const colors = useAppColors();

  return (
    <View style={[styles.chip, { backgroundColor: colors.fill }]}>
      <SymbolView
        name={icon}
        size={13}
        tintColor={colors.secondaryLabel as string}
      />
      <Text style={[styles.text, { color: colors.label }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: "100%",
  },
  text: { fontSize: 14, fontWeight: "500", flexShrink: 1 },
});

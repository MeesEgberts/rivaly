import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  value: string;
  label: string;
}

/** Groot getal met een label eronder, voor een rij statistieken. */
export function StatColumn({ value, label }: Props) {
  const colors = useAppColors();

  return (
    <View style={styles.column}>
      <Text style={[styles.value, { color: colors.label }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.secondaryLabel }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, alignItems: "center", gap: 2 },
  value: { fontSize: 24, fontWeight: "800", fontVariant: ["tabular-nums"] },
  label: { fontSize: 12, fontWeight: "500" },
});

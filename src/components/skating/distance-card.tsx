import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { StatusPill } from "@/components/cards/status-pill";
import { useAppColors } from "@/hooks/use-app-colors";
import { formatMoment } from "@/utils/prediction-cards";
import type { SkatingDistance } from "@/utils/skating";

interface Props {
  distance: SkatingDistance;
  now: number;
}

/** Kop van een afstand: "500 m" groot, vrouwen of mannen, tijd en status. */
export function DistanceCard({ distance, now }: Props) {
  const colors = useAppColors();
  const { fixture } = distance;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.row}>
        <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
          <SymbolView
            name="figure.ice.skating"
            size={24}
            tintColor={colors.accent as string}
          />
        </View>
        <View style={styles.text}>
          <Text style={[styles.caption, { color: colors.secondaryLabel }]}>
            {distance.categoryLabel.toUpperCase()} ·{" "}
            {formatMoment(fixture.startsAt)}
          </Text>
          <Text style={[styles.title, { color: colors.label }]}>
            {distance.title}
          </Text>
        </View>
      </View>
      <StatusPill
        status={distance.status}
        locksAt={fixture.locksAt}
        now={now}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { flex: 1, gap: 2 },
  caption: { fontSize: 12, fontWeight: "600", letterSpacing: 0.4 },
  title: { fontSize: 26, fontWeight: "700" },
});

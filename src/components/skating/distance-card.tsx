import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";
import { StyleSheet, Text, View } from "react-native";

import { StatusPill } from "@/components/cards/status-pill";
import { useAppColors } from "@/hooks/use-app-colors";
import { formatMoment } from "@/utils/prediction-cards";
import type { SkatingDistance } from "@/utils/skating";

import { TrackOval } from "./track-oval";

interface Props {
  distance: SkatingDistance;
  sport: string;
  now: number;
}

/**
 * Kaart van een afstand, zoals de parcourskaart bij wielrennen: tijd en
 * afstand, de baan met het aantal ronden en voor wie de afstand gunstig is.
 */
export function DistanceCard({ distance, sport, now }: Props) {
  const colors = useAppColors();
  const { fixture, kind } = distance;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.caption, { color: colors.secondaryLabel }]}>
          {formatMoment(fixture.startsAt).toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: colors.label }]}>
          {distance.title}
        </Text>
        <View style={styles.category}>
          <SymbolView
            name={distance.figure}
            size={15}
            tintColor={colors.secondaryLabel as string}
          />
          <Text style={[styles.categoryText, { color: colors.secondaryLabel }]}>
            {distance.categoryLabel}
          </Text>
        </View>
        <StatusPill
          status={distance.status}
          locksAt={fixture.locksAt}
          now={now}
        />
      </View>

      <View style={[styles.trackBox, { backgroundColor: colors.background }]}>
        <TrackOval
          sport={sport}
          laps={distance.laps}
          lapCount={distance.lapCount}
        />
      </View>

      <View style={styles.kind}>
        <View style={[styles.kindIcon, { backgroundColor: colors.accentSoft }]}>
          <SymbolView
            name={kind.icon as SFSymbol}
            size={18}
            tintColor={colors.accent as string}
          />
        </View>
        <View style={styles.kindText}>
          <Text style={[styles.kindLabel, { color: colors.label }]}>
            {kind.label}
          </Text>
          <Text style={[styles.favours, { color: colors.secondaryLabel }]}>
            {kind.favours}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, gap: 16 },
  header: { gap: 6 },
  caption: { fontSize: 12, fontWeight: "600", letterSpacing: 0.4 },
  title: { fontSize: 28, fontWeight: "700" },
  category: { flexDirection: "row", alignItems: "center", gap: 6 },
  categoryText: { fontSize: 15, fontWeight: "500" },
  trackBox: { borderRadius: 14, paddingVertical: 16 },
  kind: { flexDirection: "row", alignItems: "center", gap: 12 },
  kindIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  kindText: { flex: 1, gap: 1 },
  kindLabel: { fontSize: 15, fontWeight: "600" },
  favours: { fontSize: 13, lineHeight: 18 },
});

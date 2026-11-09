import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import type { FixtureDetails } from "@modules/validators";
import { useAppColors } from "@/hooks/use-app-colors";
import { formatMoment, type FixtureCardStatus } from "@/utils/prediction-cards";

import { ProfileBadge } from "./profile-badge";
import { ProfileSilhouette } from "./profile-silhouette";
import { StatusPill } from "@/components/cards/status-pill";

interface Props {
  /** Kleine kop, bijv. "Etappe 4" of "Monument". */
  caption: string;
  details: FixtureDetails | null;
  /** Titel als er geen route bekend is. */
  fallbackTitle: string;
  startsAt: number;
  locksAt: number;
  status: FixtureCardStatus;
  now: number;
}

/**
 * Het parcours van een etappe of koers: route, hoogteprofiel, afstand en
 * wat voor rit het is, met uitleg voor wie hij gunstig is.
 */
export function CourseCard({
  caption,
  details,
  fallbackTitle,
  startsAt,
  locksAt,
  status,
  now,
}: Props) {
  const colors = useAppColors();
  const [start, finish] = details?.route?.split(" – ") ?? [];
  const title = start && finish ? `${start} → ${finish}` : fallbackTitle;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.caption, { color: colors.secondaryLabel }]}>
          {caption.toUpperCase()} · {formatMoment(startsAt)}
        </Text>
        <Text style={[styles.title, { color: colors.label }]}>{title}</Text>
        <StatusPill status={status} locksAt={locksAt} now={now} />
      </View>

      {details?.profile ? (
        <>
          <View
            style={[styles.profileBox, { backgroundColor: colors.background }]}
          >
            <ProfileSilhouette profile={details.profile} />
            <View style={styles.axis}>
              <Text style={[styles.axisLabel, { color: colors.tertiaryLabel }]}>
                Start
              </Text>
              {details.distanceKm !== undefined ? (
                <Text
                  style={[styles.distance, { color: colors.secondaryLabel }]}
                >
                  {details.distanceKm} km
                </Text>
              ) : null}
              <View style={styles.finish}>
                <SymbolView
                  name="flag.pattern.checkered"
                  size={11}
                  tintColor={colors.tertiaryLabel as string}
                />
                <Text
                  style={[styles.axisLabel, { color: colors.tertiaryLabel }]}
                >
                  Finish
                </Text>
              </View>
            </View>
          </View>
          <ProfileBadge profile={details.profile} />
        </>
      ) : (
        <View style={styles.unknown}>
          <SymbolView
            name="map"
            size={16}
            tintColor={colors.secondaryLabel as string}
          />
          <Text style={[styles.unknownText, { color: colors.secondaryLabel }]}>
            Het parcours is nog niet bekend.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, gap: 16 },
  header: { gap: 6 },
  caption: { fontSize: 12, fontWeight: "600", letterSpacing: 0.4 },
  title: { fontSize: 24, fontWeight: "700", lineHeight: 29 },
  profileBox: { borderRadius: 14, padding: 12, paddingBottom: 8, gap: 6 },
  axis: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  axisLabel: { fontSize: 11, fontWeight: "500" },
  distance: { fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
  finish: { flexDirection: "row", alignItems: "center", gap: 3 },
  unknown: { flexDirection: "row", alignItems: "center", gap: 8 },
  unknownText: { fontSize: 15 },
});

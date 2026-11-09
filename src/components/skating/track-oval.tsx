import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  sport: string;
  /** "1¼", "12½" of "16"; `null` bij een klassement. */
  laps: string | null;
  /** Getal achter de ronden, voor enkelvoud of meervoud. */
  lapCount: number | null;
}

const HEIGHT = 112;

/**
 * De ijsbaan als ovaal met het aantal ronden erin: een brede 400 m-baan met
 * twee banen, of het kleine shorttrackovaal met de blokjes in de bocht.
 */
export function TrackOval({ sport, laps, lapCount }: Props) {
  const colors = useAppColors();
  const isShorttrack = sport === "shorttrack";
  const width = isShorttrack ? HEIGHT * 1.9 : HEIGHT * 2.6;
  const lane = isShorttrack ? 10 : 14;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.outer,
          {
            width,
            height: HEIGHT,
            borderRadius: HEIGHT / 2,
            borderColor: colors.accent,
            backgroundColor: colors.accentSoft,
          },
        ]}
      >
        {/* Binnenrand van de baan; bij langebaan een tweede baan. */}
        <View
          style={[
            styles.inner,
            {
              top: lane,
              bottom: lane,
              left: lane,
              right: lane,
              borderRadius: (HEIGHT - lane * 2) / 2,
              borderColor: colors.accent,
              borderStyle: isShorttrack ? "dashed" : "solid",
              backgroundColor: colors.card,
            },
          ]}
        >
          {laps ? (
            <>
              <Text style={[styles.laps, { color: colors.label }]}>{laps}</Text>
              <Text style={[styles.unit, { color: colors.secondaryLabel }]}>
                {lapCount !== null && lapCount <= 1.25 ? "ronde" : "ronden"}
              </Text>
            </>
          ) : (
            <Text style={[styles.unit, { color: colors.secondaryLabel }]}>
              Vier afstanden
            </Text>
          )}
        </View>
      </View>
      <Text style={[styles.caption, { color: colors.tertiaryLabel }]}>
        {isShorttrack ? "Shorttrackbaan · 111 m" : "Langebaan · 400 m"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: "center", gap: 8 },
  outer: { borderWidth: 2 },
  inner: {
    position: "absolute",
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  laps: { fontSize: 30, fontWeight: "800", fontVariant: ["tabular-nums"] },
  unit: { fontSize: 12, fontWeight: "600", marginTop: -2 },
  caption: { fontSize: 11, fontWeight: "500" },
});

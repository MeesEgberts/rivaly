import { StyleSheet, Text, View } from "react-native";

import { ProgressBar } from "@/components/ui/progress-bar";
import { useAppColors } from "@/hooks/use-app-colors";
import { formatDateRange } from "@/utils/format";

import type { MatchdayRound } from "@/utils/matchday-rounds";

interface Props {
  round: MatchdayRound;
}

/** Bovenaan een ronde: naam, datums en hoeveel je al hebt ingevuld. */
export function MatchdaySummary({ round }: Props) {
  const colors = useAppColors();

  const open = round.matches.filter((match) => !match.isLocked);
  const predicted = open.filter((match) => match.prediction !== null).length;
  const first = round.matches[0]?.startsAt ?? null;
  const last = round.matches[round.matches.length - 1]?.startsAt ?? null;
  const dates =
    first !== null && last !== null ? formatDateRange(first, last) : "";
  const progress =
    open.length === 0 ? "Gesloten" : `${predicted} van ${open.length} ingevuld`;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.name, { color: colors.label }]}>{round.name}</Text>
        <Text style={[styles.progress, { color: colors.secondaryLabel }]}>
          {progress}
        </Text>
      </View>
      <Text style={[styles.dates, { color: colors.secondaryLabel }]}>
        {dates}
      </Text>
      {open.length > 0 ? <ProgressBar value={predicted / open.length} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 20, marginTop: 12, gap: 6 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  name: { fontSize: 22, fontWeight: "700" },
  progress: { fontSize: 13 },
  dates: { fontSize: 13 },
});

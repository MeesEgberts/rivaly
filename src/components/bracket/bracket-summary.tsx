import { StyleSheet, Text, View } from "react-native";

import { ProgressBar } from "@/components/ui/progress-bar";
import { useAppColors } from "@/hooks/use-app-colors";
import { formatDateTime } from "@/utils/format";

import { SAVE_STATUS_LABEL } from "@/constants/save-status-labels";
import type { SaveStatus } from "@/hooks/use-bracket-draft";

interface Props {
  picked: number;
  total: number;
  championName: string | null;
  locksAt: number;
  isLocked: boolean;
  status: SaveStatus;
}

/** Bovenaan het schema: voortgang, kampioen en of alles bewaard is. */
export function BracketSummary({
  picked,
  total,
  championName,
  locksAt,
  isLocked,
  status,
}: Props) {
  const colors = useAppColors();

  const deadline = isLocked ? "Gesloten" : `Sluit ${formatDateTime(locksAt)}`;
  const statusText = isLocked ? "" : SAVE_STATUS_LABEL[status];

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={styles.trophy}>🏆</Text>
        <View style={styles.headerText}>
          <Text style={[styles.caption, { color: colors.secondaryLabel }]}>
            Jouw kampioen
          </Text>
          <Text
            numberOfLines={1}
            style={[
              styles.champion,
              { color: championName ? colors.label : colors.tertiaryLabel },
            ]}
          >
            {championName ?? "Nog niet gekozen"}
          </Text>
        </View>
      </View>

      <ProgressBar value={total === 0 ? 0 : picked / total} />

      <View style={styles.footer}>
        <Text style={[styles.caption, { color: colors.secondaryLabel }]}>
          {picked} van {total} winnaars · {deadline}
        </Text>
        <Text
          style={[
            styles.caption,
            {
              color: status === "error" ? colors.danger : colors.tertiaryLabel,
            },
          ]}
        >
          {statusText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerText: { flex: 1 },
  trophy: { fontSize: 30 },
  caption: { fontSize: 13 },
  champion: { fontSize: 20, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "space-between" },
});

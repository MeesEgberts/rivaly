import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { goalDifference } from "@modules/football/group-table";
import { TeamBadge } from "@/components/match/team-badge";
import { useScoreEntry } from "@/hooks/use-score-entry";
import { InsetCard } from "@/components/ui/inset-card";
import { useAppColors } from "@/hooks/use-app-colors";
import type { MatchRowData } from "@/utils/match-rows";

import { predictedGroupTable } from "@/utils/predicted-group-table";

interface Props {
  name: string;
  matches: MatchRowData[];
  qualifiers: number;
}

/** Jouw voorspelde stand van één groep; rekent live mee met wat je intikt. */
export function GroupTableCard({ name, matches, qualifiers }: Props) {
  const colors = useAppColors();
  const entry = useScoreEntry();

  const table = useMemo(
    () => predictedGroupTable(matches, entry.valueOf),
    [matches, entry.valueOf],
  );

  const footer =
    qualifiers > 0
      ? `De bovenste ${qualifiers} gaan in jouw knock-outschema door.`
      : undefined;

  return (
    <InsetCard title={`Jouw stand · ${name}`} footer={footer}>
      <View style={[styles.row, styles.headerRow]}>
        <Text
          style={[
            styles.position,
            styles.header,
            { color: colors.tertiaryLabel },
          ]}
        >
          #
        </Text>
        <Text
          style={[
            styles.teamCell,
            styles.header,
            { color: colors.tertiaryLabel },
          ]}
        >
          Team
        </Text>
        <Text
          style={[styles.stat, styles.header, { color: colors.tertiaryLabel }]}
        >
          G
        </Text>
        <Text
          style={[styles.stat, styles.header, { color: colors.tertiaryLabel }]}
        >
          DS
        </Text>
        <Text
          style={[
            styles.points,
            styles.header,
            { color: colors.tertiaryLabel },
          ]}
        >
          Pt
        </Text>
      </View>

      {table.rows.map((row, index) => {
        const isQualified = index < qualifiers;

        return (
          <View
            key={row.teamId}
            style={[
              styles.row,
              { borderTopColor: colors.separator },
              styles.divider,
            ]}
          >
            <View
              style={[
                styles.marker,
                {
                  backgroundColor: isQualified ? colors.success : "transparent",
                },
              ]}
            />
            <Text style={[styles.position, { color: colors.secondaryLabel }]}>
              {index + 1}
            </Text>
            <View style={styles.teamCell}>
              <TeamBadge code={table.info(row.teamId).code} />
              <Text
                numberOfLines={1}
                style={[styles.teamName, { color: colors.label }]}
              >
                {table.info(row.teamId).name}
              </Text>
            </View>
            <Text style={[styles.stat, { color: colors.secondaryLabel }]}>
              {row.played}
            </Text>
            <Text style={[styles.stat, { color: colors.secondaryLabel }]}>
              {goalDifference(row) > 0
                ? `+${goalDifference(row)}`
                : goalDifference(row)}
            </Text>
            <Text style={[styles.points, { color: colors.label }]}>
              {row.points}
            </Text>
          </View>
        );
      })}
    </InsetCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  headerRow: { paddingVertical: 6 },
  header: { fontSize: 11, fontWeight: "600" },
  divider: { borderTopWidth: StyleSheet.hairlineWidth },
  marker: {
    position: "absolute",
    left: 0,
    top: 6,
    bottom: 6,
    width: 3,
    borderRadius: 2,
  },
  position: { width: 16, fontSize: 14, fontVariant: ["tabular-nums"] },
  teamCell: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  teamName: { flex: 1, fontSize: 15 },
  stat: {
    width: 26,
    textAlign: "center",
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
  points: {
    width: 26,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});

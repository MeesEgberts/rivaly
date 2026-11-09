import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { CardRow } from "@/components/cards/card-row";
import { Avatar } from "@/components/ui/avatar";
import { useAppColors } from "@/hooks/use-app-colors";
import { standingSubtitle, type StandingRow } from "@/utils/poules";

import { RankBadge } from "./rank-badge";

interface Props {
  rows: StandingRow[];
}

/** De volledige stand: plek, avatar, naam, statistiek en punten; jij gemarkeerd. */
export function StandingsCard({ rows }: Props) {
  const colors = useAppColors();

  return (
    <Card isFlush>
      {rows.map((row, index) => (
        <CardRow
          key={row.userId}
          leading={
            <View style={styles.leading}>
              <RankBadge rank={row.rank} size={26} />
              <Avatar name={row.name} imageUrl={row.imageUrl} size={34} />
            </View>
          }
          title={row.isMe ? `${row.name} (jij)` : row.name}
          subtitle={standingSubtitle(row)}
          trailing={
            <Text style={[styles.points, { color: colors.label }]}>
              {row.points}
              <Text style={[styles.unit, { color: colors.secondaryLabel }]}>
                {" "}
                pt
              </Text>
            </Text>
          }
          isHighlighted={row.isMe}
          isLast={index === rows.length - 1}
        />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  leading: { flexDirection: "row", alignItems: "center", gap: 10 },
  points: { fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },
  unit: { fontSize: 13, fontWeight: "500" },
});

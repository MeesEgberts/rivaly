import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { useAppColors } from "@/hooks/use-app-colors";
import { ordinal } from "@/utils/format";
import {
  pouleSummary,
  type PouleDetail,
  type StandingRow,
} from "@/utils/poules";

import { PouleEmoji } from "./poule-emoji";
import { StatColumn } from "./stat-column";

interface Props {
  poule: PouleDetail;
  me: StandingRow | null;
  memberCount: number;
}

/** Kop van een poule: emoji, naam en jouw plek, punten en exacte voorspellingen. */
export function PouleHeroCard({ poule, me, memberCount }: Props) {
  const colors = useAppColors();

  return (
    <Card>
      <View style={styles.content}>
        <PouleEmoji emoji={poule.emoji} size={72} />
        <Text style={[styles.name, { color: colors.label }]}>{poule.name}</Text>
        <Text style={[styles.summary, { color: colors.secondaryLabel }]}>
          {pouleSummary(memberCount, poule.events.length)}
        </Text>
        <View style={[styles.stats, { borderTopColor: colors.separator }]}>
          <StatColumn
            value={me && me.rank > 0 ? ordinal(me.rank) : "–"}
            label="Jouw plek"
          />
          <StatColumn value={String(me?.points ?? 0)} label="Punten" />
          <StatColumn value={String(me?.exact ?? 0)} label="Exact goed" />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", gap: 4 },
  name: { fontSize: 26, fontWeight: "700", marginTop: 8, textAlign: "center" },
  summary: { fontSize: 14 },
  stats: {
    flexDirection: "row",
    alignSelf: "stretch",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

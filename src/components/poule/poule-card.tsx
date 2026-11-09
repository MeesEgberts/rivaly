import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { useAppColors } from "@/hooks/use-app-colors";
import { pouleSummary, type MyPoule } from "@/utils/poules";
import { moduleIcon } from "@/utils/sport-icon";

import { PouleEmoji } from "./poule-emoji";
import { RankBadge } from "./rank-badge";

interface Props {
  poule: MyPoule;
}

/** Eén poule: emoji, naam, sporten en jouw plek met punten. */
export function PouleCard({ poule }: Props) {
  const colors = useAppColors();

  return (
    <Card
      onPress={() => router.push(`/poules/${poule._id}`)}
      accessibilityLabel={poule.name}
    >
      <View style={styles.row}>
        <PouleEmoji emoji={poule.emoji} />
        <View style={styles.text}>
          <Text
            numberOfLines={1}
            style={[styles.name, { color: colors.label }]}
          >
            {poule.name}
          </Text>
          <Text style={[styles.summary, { color: colors.secondaryLabel }]}>
            {pouleSummary(poule.memberCount, poule.eventNames.length)}
          </Text>
          <View style={styles.sports}>
            {poule.moduleKeys.map((moduleKey) => (
              <SymbolView
                key={moduleKey}
                name={moduleIcon(moduleKey)}
                size={15}
                tintColor={colors.secondaryLabel as string}
              />
            ))}
          </View>
        </View>
        <View style={styles.rank}>
          <RankBadge rank={poule.rank} size={34} />
          <Text style={[styles.points, { color: colors.secondaryLabel }]}>
            {poule.points} pt
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  text: { flex: 1, gap: 3 },
  name: { fontSize: 18, fontWeight: "700" },
  summary: { fontSize: 13 },
  sports: { flexDirection: "row", gap: 8, marginTop: 2 },
  rank: { alignItems: "center", gap: 4 },
  points: { fontSize: 12, fontWeight: "600", fontVariant: ["tabular-nums"] },
});

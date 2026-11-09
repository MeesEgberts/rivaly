import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { Avatar } from "@/components/ui/avatar";
import { useAppColors } from "@/hooks/use-app-colors";
import { ordinal } from "@/utils/format";
import type { MemberPredictions } from "@/utils/member-predictions";

import { StatColumn } from "./stat-column";

interface Props {
  member: MemberPredictions["member"];
  pouleName: string;
}

/** Kop van een poulegenoot: foto, naam en zijn plek, punten en exacte voorspellingen. */
export function MemberHeroCard({ member, pouleName }: Props) {
  const colors = useAppColors();

  return (
    <Card>
      <View style={styles.content}>
        <Avatar name={member.name} imageUrl={member.imageUrl} size={72} />
        <Text style={[styles.name, { color: colors.label }]}>
          {member.isMe ? `${member.name} (jij)` : member.name}
        </Text>
        <Text style={[styles.summary, { color: colors.secondaryLabel }]}>
          {pouleName}
        </Text>
        <View style={[styles.stats, { borderTopColor: colors.separator }]}>
          <StatColumn
            value={member.rank > 0 ? ordinal(member.rank) : "–"}
            label="Plek"
          />
          <StatColumn value={String(member.points)} label="Punten" />
          <StatColumn value={String(member.exact)} label="Exact goed" />
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

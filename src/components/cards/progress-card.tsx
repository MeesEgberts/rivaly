import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";
import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  icon: SFSymbol;
  /** Grijs icoon, bijv. als alles gesloten is. */
  isMuted?: boolean;
  title: string;
  subtitle?: string;
  answered: number;
  total: number;
  /** Uitleg onder de balk. */
  footnote?: string;
}

/** Kaart met voortgang: icoon, titel, "3/6" en een balk. */
export function ProgressCard({
  icon,
  isMuted = false,
  title,
  subtitle,
  answered,
  total,
  footnote,
}: Props) {
  const colors = useAppColors();
  const progress = total > 0 ? answered / total : 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.row}>
        <SymbolView
          name={icon}
          size={18}
          tintColor={
            (isMuted ? colors.secondaryLabel : colors.accent) as string
          }
        />
        <View style={styles.text}>
          <Text style={[styles.title, { color: colors.label }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.secondaryLabel }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.count, { color: colors.secondaryLabel }]}>
          {answered}/{total}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.fill }]}>
        <View
          style={[
            styles.fill,
            { width: `${progress * 100}%`, backgroundColor: colors.accent },
          ]}
        />
      </View>
      {footnote ? (
        <Text style={[styles.footnote, { color: colors.secondaryLabel }]}>
          {footnote}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 14, gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  text: { flex: 1, gap: 1 },
  title: { fontSize: 16, fontWeight: "600" },
  subtitle: { fontSize: 13 },
  count: { fontSize: 15, fontWeight: "600", fontVariant: ["tabular-nums"] },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3 },
  footnote: { fontSize: 13, lineHeight: 18 },
});

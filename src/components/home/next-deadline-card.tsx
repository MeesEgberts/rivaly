import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { StatusPill } from "@/components/cards/status-pill";
import { QuestionVisual } from "@/components/cards/question-visual";
import { useAppColors } from "@/hooks/use-app-colors";
import { openItemHref, type OpenItem } from "@/utils/home";
import { moduleIcon } from "@/utils/sport-icon";

interface Props {
  item: OpenItem;
  now: number;
}

/** Grote kaart bovenaan: het eerstvolgende dat je nog moet invullen. */
export function NextDeadlineCard({ item, now }: Props) {
  const colors = useAppColors();
  const open = () => router.push(openItemHref(item));

  return (
    <Card onPress={open} accessibilityLabel={`Vul in: ${item.label ?? ""}`}>
      <View style={styles.content}>
        <View style={styles.header}>
          <QuestionVisual type={item.type} details={item.details} size={44} />
          <View style={styles.headerText}>
            <Text style={[styles.caption, { color: colors.accent }]}>
              EERSTVOLGENDE DEADLINE
            </Text>
            <View style={styles.eventRow}>
              <SymbolView
                name={moduleIcon(item.moduleKey)}
                size={13}
                tintColor={colors.secondaryLabel as string}
              />
              <Text
                numberOfLines={1}
                style={[styles.event, { color: colors.secondaryLabel }]}
              >
                {item.eventName}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.title, { color: colors.label }]} numberOfLines={2}>
          {item.label ?? "Voorspelling"}
        </Text>
        <StatusPill status="todo" locksAt={item.locksAt} now={now} />

        <View style={[styles.button, { backgroundColor: colors.accent }]}>
          <Text style={[styles.buttonLabel, { color: colors.onAccent }]}>
            Nu invullen
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerText: { flex: 1, gap: 1 },
  caption: { fontSize: 12, fontWeight: "700", letterSpacing: 0.4 },
  eventRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  event: { fontSize: 14, flexShrink: 1 },
  title: { fontSize: 26, fontWeight: "700", lineHeight: 31 },
  button: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonLabel: { fontSize: 17, fontWeight: "600" },
});

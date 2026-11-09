import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { SymbolBadge } from "@/components/cards/symbol-badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useAppColors } from "@/hooks/use-app-colors";
import { eventProgressText, type OverviewEvent } from "@/utils/home";
import { moduleIcon } from "@/utils/sport-icon";

interface Props {
  event: OverviewEvent;
  now: number;
}

/** Eén evenement: sport, naam, hoeveel er nog open staat en een voortgangsbalk. */
export function EventProgressCard({ event, now }: Props) {
  const colors = useAppColors();
  const isDone = event.open > 0 && event.predicted === event.open;

  return (
    <Card
      onPress={() => router.push(`/events/${event.eventId}`)}
      accessibilityLabel={event.name}
    >
      <View style={styles.content}>
        <View style={styles.row}>
          <SymbolBadge name={moduleIcon(event.moduleKey)} size={44} />
          <View style={styles.text}>
            <Text
              numberOfLines={1}
              style={[styles.name, { color: colors.label }]}
            >
              {event.name}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.subtitle, { color: colors.secondaryLabel }]}
            >
              {eventProgressText(event, now)}
            </Text>
          </View>
          {isDone ? (
            <SymbolView
              name="checkmark.circle.fill"
              size={22}
              tintColor={colors.success as string}
            />
          ) : event.open > 0 ? (
            <Text style={[styles.count, { color: colors.secondaryLabel }]}>
              {event.predicted}/{event.open}
            </Text>
          ) : null}
        </View>
        {event.open > 0 ? (
          <ProgressBar value={event.predicted / event.open} />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  text: { flex: 1, gap: 2 },
  name: { fontSize: 17, fontWeight: "600" },
  subtitle: { fontSize: 13 },
  count: { fontSize: 15, fontWeight: "600", fontVariant: ["tabular-nums"] },
});

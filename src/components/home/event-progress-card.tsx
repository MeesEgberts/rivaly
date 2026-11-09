import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { EventMark } from "@/components/event/event-mark";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useAppColors } from "@/hooks/use-app-colors";
import { eventHref } from "@/utils/event-preview";
import { eventProgressText, type OverviewEvent } from "@/utils/home";

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
      onPress={() => router.push(eventHref(event.eventId, event.preview))}
      accessibilityLabel={event.name}
    >
      <View style={styles.content}>
        <View style={styles.row}>
          <EventMark
            logoUrl={event.logoUrl}
            imageUrl={event.preview.imageUrl}
            moduleKey={event.moduleKey}
          />
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

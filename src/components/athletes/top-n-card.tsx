import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { topNHint } from "@/utils/athletes";

import { SlotList, type SlotListProps } from "./slot-list";

interface Props extends SlotListProps {
  title: string;
}

/**
 * Jouw keuze of top N als vaste plekken, met voortgang erboven en uitleg
 * eronder die meebeweegt met wat je kunt doen.
 */
export function TopNCard({ title, ...slotProps }: Props) {
  const colors = useAppColors();
  const { order, size, noun } = slotProps;
  const isComplete = order.length >= size;

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.secondaryLabel }]}>
          {title}
        </Text>
        {isComplete ? (
          <View style={styles.complete}>
            <SymbolView
              name="checkmark.circle.fill"
              size={15}
              tintColor={colors.success as string}
            />
            <Text style={[styles.count, { color: colors.success }]}>
              Compleet
            </Text>
          </View>
        ) : size > 1 ? (
          <Text style={[styles.count, { color: colors.secondaryLabel }]}>
            {order.length}/{size} gekozen
          </Text>
        ) : null}
      </View>

      <SlotList {...slotProps} />

      <Text style={[styles.hint, { color: colors.secondaryLabel }]}>
        {topNHint(order.length, size, noun)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  complete: { flexDirection: "row", alignItems: "center", gap: 4 },
  count: { fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] },
  hint: { fontSize: 13, lineHeight: 18, marginHorizontal: 4 },
});

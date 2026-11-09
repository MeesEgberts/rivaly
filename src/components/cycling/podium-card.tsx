import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { podiumDisplayOrder, type PodiumSlot } from "@/utils/cycling";

import { PodiumStep } from "./podium-step";

interface Props {
  title: string;
  slots: PodiumSlot[];
  /** Tekst van de knop onderaan, bijv. "Kies je top 3"; zonder tekst geen knop. */
  actionLabel?: string;
  onPress?: () => void;
}

/** Podium 2 – 1 – 3 met de gekozen renners, als kaart. */
export function PodiumCard({ title, slots, actionLabel, onPress }: Props) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={[styles.title, { color: colors.secondaryLabel }]}>
        {title}
      </Text>
      <View style={styles.podium}>
        {podiumDisplayOrder(slots).map((slot) => (
          <PodiumStep key={slot.position} slot={slot} />
        ))}
      </View>
      {actionLabel ? (
        <View style={[styles.action, { backgroundColor: colors.accent }]}>
          <Text style={[styles.actionLabel, { color: colors.onAccent }]}>
            {actionLabel}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: 16, gap: 16 },
  title: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  podium: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  action: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 17, fontWeight: "600" },
});

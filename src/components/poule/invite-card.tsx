import { Pressable, StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { SymbolBadge } from "@/components/cards/symbol-badge";
import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  code: string;
  onShare: () => void;
}

/** Uitnodigingscode groot in beeld, met een knop om hem te delen. */
export function InviteCard({ code, onShare }: Props) {
  const colors = useAppColors();

  return (
    <Card>
      <View style={styles.content}>
        <View style={styles.header}>
          <SymbolBadge name="person.badge.plus" size={40} />
          <View style={styles.text}>
            <Text style={[styles.title, { color: colors.label }]}>
              Nodig vrienden uit
            </Text>
            <Text style={[styles.subtitle, { color: colors.secondaryLabel }]}>
              Met deze code doen ze direct mee.
            </Text>
          </View>
        </View>
        <View style={[styles.codeBox, { backgroundColor: colors.fill }]}>
          <Text selectable style={[styles.code, { color: colors.label }]}>
            {code}
          </Text>
        </View>
        <Pressable
          onPress={onShare}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.buttonLabel, { color: colors.onAccent }]}>
            Deel uitnodiging
          </Text>
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  text: { flex: 1, gap: 1 },
  title: { fontSize: 17, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  codeBox: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  code: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 3,
    fontVariant: ["tabular-nums"],
  },
  button: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: { fontSize: 17, fontWeight: "600" },
});

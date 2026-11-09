import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { useAppColors } from "@/hooks/use-app-colors";

/** Bovenaan als alles is ingevuld: een compliment in plaats van een deadline. */
export function AllDoneCard() {
  const colors = useAppColors();

  return (
    <Card>
      <View style={styles.row}>
        <SymbolView
          name="checkmark.seal.fill"
          size={40}
          tintColor={colors.success as string}
        />
        <View style={styles.text}>
          <Text style={[styles.title, { color: colors.label }]}>
            Je bent helemaal bij
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryLabel }]}>
            Alles wat open staat is ingevuld. Aanpassen kan tot de deadline.
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 14, lineHeight: 19 },
});

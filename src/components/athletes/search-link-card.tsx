import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  title: string;
  onPress: () => void;
}

/** Brede knop naar het zoekscherm, in de stijl van een zoekveld. */
export function SearchLinkCard({ title, onPress }: Props) {
  const colors = useAppColors();

  return (
    <Card onPress={onPress} accessibilityLabel={title}>
      <View style={styles.row}>
        <SymbolView
          name="magnifyingglass"
          size={18}
          tintColor={colors.accent as string}
        />
        <Text style={[styles.title, { color: colors.accent }]}>{title}</Text>
        <SymbolView
          name="chevron.right"
          size={13}
          tintColor={colors.tertiaryLabel as string}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { flex: 1, fontSize: 17, fontWeight: "600" },
});

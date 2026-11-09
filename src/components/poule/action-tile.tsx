import type { SFSymbol } from "sf-symbols-typescript";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { SymbolBadge } from "@/components/cards/symbol-badge";
import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  icon: SFSymbol;
  title: string;
  subtitle: string;
  onPress: () => void;
}

/** Actie als tegel, twee naast elkaar: "Nieuwe poule" en "Meedoen met code". */
export function ActionTile({ icon, title, subtitle, onPress }: Props) {
  const colors = useAppColors();

  return (
    <Card onPress={onPress} accessibilityLabel={title} style={styles.tile}>
      <View style={styles.content}>
        <SymbolBadge name={icon} size={44} />
        <Text style={[styles.title, { color: colors.label }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.secondaryLabel }]}>
          {subtitle}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1 },
  content: { gap: 6 },
  title: { fontSize: 16, fontWeight: "700", marginTop: 4 },
  subtitle: { fontSize: 13, lineHeight: 17 },
});

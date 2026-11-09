import type { SFSymbol } from "sf-symbols-typescript";
import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

import { Card } from "./card";
import { SymbolBadge } from "./symbol-badge";

interface Props {
  icon: SFSymbol;
  title: string;
  description: string;
}

/** Lege staat als kaart, voor schermen die uit kaarten bestaan. */
export function EmptyCard({ icon, title, description }: Props) {
  const colors = useAppColors();

  return (
    <Card>
      <View style={styles.content}>
        <SymbolBadge name={icon} size={60} />
        <Text style={[styles.title, { color: colors.label }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.secondaryLabel }]}>
          {description}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: "center", gap: 8, paddingVertical: 20 },
  title: { fontSize: 20, fontWeight: "700", marginTop: 6 },
  description: { fontSize: 15, textAlign: "center", lineHeight: 20 },
});

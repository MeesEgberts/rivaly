import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { formatDateTime } from "@/utils/format";

interface Props {
  title: string;
  context: string;
  locksAt: number;
  isOpen: boolean;
}

/** Kop van een voorspelvraag: vraag, waar hij bij hoort en tot wanneer. */
export function PredictHeaderCard({ title, context, locksAt, isOpen }: Props) {
  const colors = useAppColors();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.label }]}>{title}</Text>
      <Text style={[styles.context, { color: colors.secondaryLabel }]}>
        {context}
      </Text>
      <Text style={[styles.deadline, { color: colors.tertiaryLabel }]}>
        {isOpen ? `Sluit ${formatDateTime(locksAt)}` : "Gesloten"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, gap: 4 },
  title: { fontSize: 22, fontWeight: "700" },
  context: { fontSize: 15 },
  deadline: { fontSize: 13 },
});

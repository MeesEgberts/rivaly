import { StyleSheet, Text, View } from "react-native";

import { TeamBadge } from "@/components/match/team-badge";
import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  answer: { text: string; code: string | null } | null;
  isOpen: boolean;
}

/** Jouw antwoord met landcode, of "Kies" / "Niet ingevuld". */
export function AnswerLine({ answer, isOpen }: Props) {
  const colors = useAppColors();

  if (!answer) {
    return (
      <Text
        style={[
          styles.empty,
          { color: isOpen ? colors.accent : colors.tertiaryLabel },
        ]}
      >
        {isOpen ? "Kies" : "Niet ingevuld"}
      </Text>
    );
  }

  return (
    <View style={styles.row}>
      {answer.code ? <TeamBadge code={answer.code} /> : null}
      <Text numberOfLines={1} style={[styles.text, { color: colors.label }]}>
        {answer.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1 },
  text: { fontSize: 15, fontWeight: "600", flexShrink: 1 },
  empty: { fontSize: 15, fontWeight: "600" },
});

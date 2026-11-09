import { StyleSheet, Text, View } from "react-native";

import { ProgressBar } from "@/components/ui/progress-bar";
import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  open: number;
  predicted: number;
  hasLockedRows: boolean;
}

/** Voortgang en uitleg bovenaan de groepsfase. */
export function GroupStageIntro({ open, predicted, hasLockedRows }: Props) {
  const colors = useAppColors();

  if (open === 0) {
    const text = hasLockedRows
      ? "Alle groepswedstrijden zijn gesloten."
      : "Er zijn geen groepswedstrijden.";

    return (
      <View style={styles.container}>
        <Text style={[styles.hint, { color: colors.secondaryLabel }]}>
          {text}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.count, { color: colors.label }]}>
          {predicted} van {open} ingevuld
        </Text>
      </View>
      <ProgressBar value={open === 0 ? 0 : predicted / open} />
      <Text style={[styles.hint, { color: colors.secondaryLabel }]}>
        Tik op een vak en tik de cijfers. Je stand per groep rekent direct mee
        en vult straks je knock-outschema.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 32, marginTop: 16, gap: 8 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  count: { fontSize: 15, fontWeight: "600" },
  hint: { fontSize: 13, lineHeight: 18 },
});

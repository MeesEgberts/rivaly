import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import type { FixtureDetail } from "@/types/fixture-detail";
import { describeValue } from "@/utils/fixture-text";

interface Props {
  fixture: FixtureDetail;
}

/** Na sluiting: jouw voorspelling en (zodra bekend) de uitslag. */
export function PredictLockedCard({ fixture }: Props) {
  const colors = useAppColors();
  const participants = useFixtureParticipants(fixture);

  const mine = describeValue(
    fixture.myPrediction,
    fixture.payload,
    participants,
  );
  const result = fixture.result
    ? describeValue(fixture.result, fixture.payload, participants)
    : "Nog niet bekend";

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.label, { color: colors.secondaryLabel }]}>
        Jouw voorspelling
      </Text>
      <Text style={[styles.value, { color: colors.label }]}>{mine}</Text>
      <Text style={[styles.label, { color: colors.secondaryLabel }]}>
        Uitslag
      </Text>
      <Text style={[styles.value, { color: colors.label }]}>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, gap: 4 },
  label: { fontSize: 13, marginTop: 6 },
  value: { fontSize: 17, fontWeight: "600" },
});

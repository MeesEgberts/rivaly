import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { predictionOutcome } from "@/utils/score-outcome";
import { OUTCOME_LABEL } from "@/constants/outcome-labels";

import type { FixtureDetail } from "@/types/fixture-detail";

interface Props {
  fixture: FixtureDetail;
}

/** Na sluiting: de uitslag naast je voorspelling. */
export function ScorePredictResult({ fixture }: Props) {
  const colors = useAppColors();

  const prediction =
    fixture.myPrediction?.type === "score" ? fixture.myPrediction : null;
  const result = fixture.result?.type === "score" ? fixture.result : null;
  const outcome = predictionOutcome(prediction, result);

  let text = "Gesloten. De uitslag volgt na de wedstrijd.";

  if (!prediction) {
    text = "Gesloten. Je hebt deze wedstrijd niet voorspeld.";
  }

  if (result) {
    const prefix = fixture.status === "live" ? "Tussenstand" : "Uitslag";
    const verdict = outcome ? ` · ${OUTCOME_LABEL[outcome]}` : "";
    text = `${prefix}: ${result.home} – ${result.away}${verdict}`;
  }

  const isGood = outcome === "exact" || outcome === "outcome";

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text
        style={[styles.text, { color: isGood ? colors.success : colors.label }]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 16 },
  text: { fontSize: 16, fontWeight: "600", textAlign: "center" },
});

import { ScrollView, StyleSheet } from "react-native";

import { PredictHeaderCard } from "@/components/predict/predict-header-card";
import { PredictLockedCard } from "@/components/predict/predict-locked-card";
import { PoulePredictionsCard } from "@/components/predict/poule-predictions-card";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { useAppColors } from "@/hooks/use-app-colors";
import { useAthleteDraft } from "@/hooks/use-athlete-draft";
import { useNow } from "@/hooks/use-now";
import { useSavePrediction } from "@/hooks/use-save-prediction";
import type { FixtureDetail } from "@/types/fixture-detail";
import { isAthletePool, isComplete, orderToValue } from "@/utils/athletes";
import { isFixtureOpen } from "@/utils/match-rows";

import { AthleteChoiceBody } from "./athlete-choice-body";

interface Props {
  fixture: FixtureDetail;
}

/** Voorspellen met atleten (renner, podium, top 5): één weergave voor alles. */
export function AthletePredictView({ fixture }: Props) {
  const colors = useAppColors();
  const now = useNow();
  const draft = useAthleteDraft();
  const { submit, isSaving } = useSavePrediction(fixture._id);
  const payload = fixture.payload;

  if (!isAthletePool(payload)) {
    return null;
  }

  const isOpen = isFixtureOpen(fixture, now);
  const slots = draft.slots;
  const complete = isComplete(slots);

  return (
    <>
      <ModalToolbar
        onConfirm={
          isOpen
            ? () => submit(orderToValue(payload, slots as string[]))
            : undefined
        }
        isConfirmDisabled={!complete || isSaving}
      />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
      >
        <PredictHeaderCard fixture={fixture} isOpen={isOpen} />
        {isOpen ? (
          <AthleteChoiceBody fixture={fixture} mode="prediction" />
        ) : (
          <PredictLockedCard fixture={fixture} />
        )}
        <PoulePredictionsCard fixture={fixture} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
});

import { ScrollView, StyleSheet } from "react-native";

import { PredictHeaderCard } from "@/components/predict/predict-header-card";
import { PredictLockedCard } from "@/components/predict/predict-locked-card";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { useAppColors } from "@/hooks/use-app-colors";
import { useAthleteDraft } from "@/hooks/use-athlete-draft";
import { useNow } from "@/hooks/use-now";
import { useSavePrediction } from "@/hooks/use-save-prediction";
import type { FixtureDetail } from "@/types/fixture-detail";
import { isAthletePool, orderToValue, slotCount } from "@/utils/athletes";
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
  const isComplete = draft.order.length === slotCount(payload);

  return (
    <>
      <ModalToolbar
        onConfirm={
          isOpen ? () => submit(orderToValue(payload, draft.order)) : undefined
        }
        isConfirmDisabled={!isComplete || isSaving}
      />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <PredictHeaderCard fixture={fixture} isOpen={isOpen} />
        {isOpen ? (
          <AthleteChoiceBody
            fixture={fixture}
            mode="prediction"
            searchHref={{
              pathname: "/predict/[fixtureId]/athletes",
              params: { fixtureId: fixture._id },
            }}
          />
        ) : (
          <PredictLockedCard fixture={fixture} />
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
});

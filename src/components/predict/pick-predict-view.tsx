import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { useAppColors } from "@/hooks/use-app-colors";
import { useNow } from "@/hooks/use-now";
import { tapFeedback } from "@/utils/haptics";
import { isFixtureOpen } from "@/utils/match-rows";

import { PredictHeaderCard } from "./predict-header-card";
import { PredictLockedCard } from "./predict-locked-card";
import { describeContext } from "@/utils/fixture-text";
import type { FixtureDetail } from "@/types/fixture-detail";
import { TeamPickCard } from "./team-pick-card";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import { useSavePrediction } from "@/hooks/use-save-prediction";

interface Props {
  fixture: FixtureDetail;
}

/** Keuzevraag ("Wie wordt kampioen?") als raster van teamkaarten. */
export function PickPredictView({ fixture }: Props) {
  const colors = useAppColors();
  const now = useNow();
  const participants = useFixtureParticipants(fixture);
  const { submit, isSaving } = useSavePrediction(fixture._id);

  const saved =
    fixture.myPrediction?.type === "pick"
      ? fixture.myPrediction.optionId
      : null;
  const [selected, setSelected] = useState<string | null>(saved);

  if (fixture.payload.type !== "pick") {
    return null;
  }

  const isOpen = isFixtureOpen(fixture, now);
  const options = fixture.payload.options;

  const choose = (optionId: string) => {
    tapFeedback();
    setSelected(optionId);
  };

  const confirm = () => {
    if (selected) {
      submit({ type: "pick", optionId: selected });
    }
  };

  return (
    <>
      <ModalToolbar
        onConfirm={isOpen ? confirm : undefined}
        isConfirmDisabled={!selected || isSaving}
      />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <PredictHeaderCard
          title={fixture.label ?? "Bonusvraag"}
          context={describeContext(fixture)}
          locksAt={fixture.locksAt}
          isOpen={isOpen}
        />

        {isOpen ? (
          <>
            <Text style={[styles.hint, { color: colors.secondaryLabel }]}>
              Tik je keuze
            </Text>
            <View style={styles.grid}>
              {options.map((option) => (
                <TeamPickCard
                  key={option.id}
                  label={participants.get(option.id)?.shortName ?? option.label}
                  code={participants.get(option.id)?.code ?? null}
                  isSelected={selected === option.id}
                  onPress={() => choose(option.id)}
                />
              ))}
            </View>
          </>
        ) : (
          <PredictLockedCard fixture={fixture} />
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  hint: { fontSize: 13, marginHorizontal: 4, marginTop: 8 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
});

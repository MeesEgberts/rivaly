import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { RoundStepButton } from "@/components/match/round-step-button";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { useAppColors } from "@/hooks/use-app-colors";
import { useNow } from "@/hooks/use-now";
import { tapFeedback } from "@/utils/haptics";
import { isFixtureOpen } from "@/utils/match-rows";

import { clampNumeric, parseNumeric } from "@/utils/numeric";
import { PredictHeaderCard } from "./predict-header-card";
import { PredictLockedCard } from "./predict-locked-card";
import { PoulePredictionsCard } from "./poule-predictions-card";
import type { FixtureDetail } from "@/types/fixture-detail";
import { useSavePrediction } from "@/hooks/use-save-prediction";

interface Props {
  fixture: FixtureDetail;
}

/**
 * Getalvraag ("Totaal aantal goals"): groot getal dat je direct intypt,
 * met − en + om bij te stellen.
 */
export function NumericPredictView({ fixture }: Props) {
  const colors = useAppColors();
  const now = useNow();
  const { submit, isSaving } = useSavePrediction(fixture._id);

  const saved =
    fixture.myPrediction?.type === "numeric"
      ? fixture.myPrediction.value
      : null;
  const [text, setText] = useState(saved === null ? "" : String(saved));

  if (fixture.payload.type !== "numeric") {
    return null;
  }

  const payload = fixture.payload;
  const isOpen = isFixtureOpen(fixture, now);
  const value = parseNumeric(text);
  const step = payload.step ?? 1;

  const nudge = (direction: 1 | -1) => {
    tapFeedback();
    const base = value ?? payload.min ?? 0;
    setText(String(clampNumeric(base + direction * step, payload)));
  };

  const confirm = () => {
    if (value !== null) {
      submit({ type: "numeric", value: clampNumeric(value, payload) });
    }
  };

  return (
    <>
      <ModalToolbar
        onConfirm={isOpen ? confirm : undefined}
        isConfirmDisabled={value === null || isSaving}
      />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
      >
        <PredictHeaderCard
          fixture={fixture}
          isOpen={isOpen}
          fallbackTitle="Bonusvraag"
        />

        {isOpen ? (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <RoundStepButton
                symbol="−"
                label="Minder"
                onPress={() => nudge(-1)}
              />
              <TextInput
                value={text}
                onChangeText={(next) => setText(next.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                selectTextOnFocus
                placeholder="–"
                placeholderTextColor={colors.tertiaryLabel}
                accessibilityLabel={payload.unit ?? "Waarde"}
                style={[styles.input, { color: colors.label }]}
                maxLength={5}
              />
              <RoundStepButton
                symbol="+"
                label="Meer"
                onPress={() => nudge(1)}
              />
            </View>
            {payload.unit ? (
              <Text style={[styles.unit, { color: colors.secondaryLabel }]}>
                {payload.unit}
              </Text>
            ) : null}
            <Text style={[styles.hint, { color: colors.tertiaryLabel }]}>
              Tik op het getal om het in te typen
            </Text>
          </View>
        ) : (
          <PredictLockedCard fixture={fixture} />
        )}
        <PoulePredictionsCard fixture={fixture} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 4,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  input: {
    minWidth: 120,
    fontSize: 56,
    fontWeight: "700",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  unit: { fontSize: 17 },
  hint: { fontSize: 12, marginTop: 8 },
});

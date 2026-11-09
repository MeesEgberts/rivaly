import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { api } from "@convex/_generated/api";
import { PrimaryButton } from "@/components/cards/primary-button";
import { PredictHeaderCard } from "@/components/predict/predict-header-card";
import { useAppColors } from "@/hooks/use-app-colors";
import { useAthleteDraft } from "@/hooks/use-athlete-draft";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import type { FixtureDetail } from "@/types/fixture-detail";
import { isAthletePool, orderToValue, slotCount } from "@/utils/athletes";
import { showError } from "@/utils/error-message";
import { describeValue } from "@/utils/fixture-text";

import { AthleteChoiceBody } from "./athlete-choice-body";

interface Props {
  fixture: FixtureDetail;
}

/** Beheer: uitslag met atleten invoeren, met hetzelfde zoekscherm als voorspellen. */
export function AthleteResultForm({ fixture }: Props) {
  const colors = useAppColors();
  const draft = useAthleteDraft();
  const participants = useFixtureParticipants(fixture);
  const setResult = useMutation(api.admin.setResult);
  const setStatus = useMutation(api.admin.setFixtureStatus);
  const [isBusy, setIsBusy] = useState(false);
  const payload = fixture.payload;

  if (!isAthletePool(payload)) {
    return null;
  }

  const isComplete = draft.order.length === slotCount(payload);
  const current = fixture.result
    ? `Nu: ${describeValue(fixture.result, payload, participants)} (${fixture.status})`
    : `Nog geen uitslag (${fixture.status})`;

  const run = async (action: () => Promise<unknown>) => {
    setIsBusy(true);

    try {
      await action();
      router.back();
    } catch (error) {
      showError("Mislukt", error);
    } finally {
      setIsBusy(false);
    }
  };

  const save = (status: "live" | "finished") =>
    run(() =>
      setResult({
        fixtureId: fixture._id,
        result: orderToValue(payload, draft.order),
        status,
      }),
    );

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <PredictHeaderCard
        fixture={fixture}
        isOpen={false}
        fallbackTitle="Uitslag"
        note={current}
      />
      <AthleteChoiceBody
        fixture={fixture}
        mode="result"
        searchHref={{
          pathname: "/result/[fixtureId]/athletes",
          params: { fixtureId: fixture._id },
        }}
      />
      <PrimaryButton
        label="Opslaan als eindstand"
        onPress={() => save("finished")}
        disabled={isBusy || !isComplete}
      />
      <PrimaryButton
        label="Opslaan als tussenstand"
        variant="secondary"
        onPress={() => save("live")}
        disabled={isBusy || !isComplete}
      />
      {fixture.result ? (
        <PrimaryButton
          label="Uitslag verwijderen"
          variant="destructive"
          onPress={() =>
            run(() =>
              setStatus({ fixtureId: fixture._id, status: "scheduled" }),
            )
          }
          disabled={isBusy}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 40 },
});

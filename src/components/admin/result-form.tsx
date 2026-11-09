import { Column } from "@expo/ui";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";

import { api } from "@convex/_generated/api";
import { FixtureForm } from "@/components/fixture-form/fixture-form";
import { ActionButton } from "@/components/ui/action-button";
import { AppText } from "@/components/ui/app-text";
import { Screen, Section } from "@/components/ui/screen";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import type { FixtureDetail } from "@/types/fixture-detail";
import { showError } from "@/utils/error-message";
import {
  draftFromValue,
  draftToValue,
  type FixtureDraft,
} from "@/utils/fixture-draft";
import { describeFixture, describeValue } from "@/utils/fixture-text";

interface Props {
  fixture: FixtureDetail;
}

/** Beheer: (tussen)uitslag invoeren of weer verwijderen. */
export function ResultForm({ fixture }: Props) {
  const setResult = useMutation(api.admin.setResult);
  const setStatus = useMutation(api.admin.setFixtureStatus);
  const participants = useFixtureParticipants(fixture);

  const [draft, setDraft] = useState<FixtureDraft>(() =>
    draftFromValue(fixture.result, fixture.payload),
  );
  const [isBusy, setIsBusy] = useState(false);

  const title = describeFixture(fixture.payload, fixture.label, participants);
  const current = fixture.result
    ? `Huidige uitslag: ${describeValue(fixture.result, fixture.payload, participants)} (${fixture.status})`
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

  const submit = (status: "live" | "finished") =>
    run(async () => {
      const result = draftToValue(draft, fixture.payload, "result");
      await setResult({ fixtureId: fixture._id, result, status });
    });

  const reopen = () =>
    run(() => setStatus({ fixtureId: fixture._id, status: "scheduled" }));

  return (
    <Screen
      footer={
        <>
          <ActionButton
            label="Opslaan als eindstand"
            onPress={() => submit("finished")}
            disabled={isBusy}
          />
          <ActionButton
            label="Opslaan als tussenstand"
            variant="secondary"
            onPress={() => submit("live")}
            disabled={isBusy}
          />
          {fixture.result ? (
            <ActionButton
              label="Uitslag verwijderen"
              variant="destructive"
              onPress={reopen}
              disabled={isBusy}
            />
          ) : null}
        </>
      }
    >
      <Section>
        <Column spacing={4}>
          <AppText variant="title">{title}</AppText>
          <AppText variant="secondary">{current}</AppText>
        </Column>
      </Section>

      <FixtureForm
        payload={fixture.payload}
        participants={participants}
        draft={draft}
        onChange={setDraft}
        mode="result"
      />
    </Screen>
  );
}

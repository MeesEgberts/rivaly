import { Column } from "@expo/ui";
import { useState } from "react";

import { FixtureForm } from "@/components/fixture-form/fixture-form";
import { AppText } from "@/components/ui/app-text";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section } from "@/components/ui/screen";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import { useNow } from "@/hooks/use-now";
import { useSavePrediction } from "@/hooks/use-save-prediction";
import type { FixtureDetail } from "@/types/fixture-detail";
import { showError } from "@/utils/error-message";
import {
  draftFromValue,
  draftToValue,
  type FixtureDraft,
} from "@/utils/fixture-draft";
import {
  describeContext,
  describeFixture,
  describeValue,
} from "@/utils/fixture-text";
import { formatDateTime } from "@/utils/format";
import { isFixtureOpen } from "@/utils/match-rows";

interface Props {
  fixture: FixtureDetail;
}

/**
 * Generiek voorspelformulier in een native Form. Vangnet voor types en
 * platforms zonder eigen weergave (Android-top-N).
 */
export function GenericPredictForm({ fixture }: Props) {
  const now = useNow();
  const participants = useFixtureParticipants(fixture);
  const { submit, isSaving } = useSavePrediction(fixture._id);

  const [draft, setDraft] = useState<FixtureDraft>(() =>
    draftFromValue(fixture.myPrediction, fixture.payload),
  );

  const isOpen = isFixtureOpen(fixture, now);
  const title = describeFixture(fixture.payload, fixture.label, participants);
  const deadline = isOpen
    ? `Sluit ${formatDateTime(fixture.locksAt)}`
    : "Gesloten";

  const handleConfirm = () => {
    try {
      submit(draftToValue(draft, fixture.payload, "prediction"));
    } catch (error) {
      showError("Nog niet compleet", error);
    }
  };

  return (
    <Screen>
      <ModalToolbar
        onConfirm={isOpen ? handleConfirm : undefined}
        isConfirmDisabled={isSaving}
      />

      <Section>
        <Column spacing={4}>
          <AppText variant="title">{title}</AppText>
          <AppText variant="secondary">{describeContext(fixture)}</AppText>
          <AppText variant="caption">{deadline}</AppText>
        </Column>
      </Section>

      {isOpen ? (
        <FixtureForm
          payload={fixture.payload}
          participants={participants}
          draft={draft}
          onChange={setDraft}
          mode="prediction"
        />
      ) : (
        <Section title="Resultaat">
          <NavRow
            icon="person.fill"
            title="Jouw voorspelling"
            value={describeValue(
              fixture.myPrediction,
              fixture.payload,
              participants,
            )}
          />
          {fixture.result ? (
            <NavRow
              icon="flag.checkered"
              title="Uitslag"
              value={describeValue(
                fixture.result,
                fixture.payload,
                participants,
              )}
              highlighted
            />
          ) : null}
        </Section>
      )}
    </Screen>
  );
}

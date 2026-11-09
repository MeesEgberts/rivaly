import { Picker } from "@expo/ui";

import type { FixturePayload } from "@modules/validators";
import { AppText } from "@/components/ui/app-text";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Section } from "@/components/ui/screen";
import {
  NO_CHOICE,
  type FixtureDraft,
  type FixtureFormMode,
} from "@/utils/fixture-draft";
import { participantName, type ParticipantMap } from "@/utils/participants";

interface Props {
  payload: Extract<FixturePayload, { type: "score" }>;
  participants: ParticipantMap;
  draft: FixtureDraft;
  onChange: (draft: FixtureDraft) => void;
  mode: FixtureFormMode;
}

export function ScoreFields({
  payload,
  participants,
  draft,
  onChange,
  mode,
}: Props) {
  const home = participantName(participants, payload.homeId);
  const away = participantName(participants, payload.awayId);

  const isKnockout = !payload.allowDraw;
  const needsWinner =
    mode === "result" && isKnockout && draft.home === draft.away;
  const title = mode === "result" ? "Uitslag" : "Jouw voorspelling";

  return (
    <>
      <Section title={title}>
        <NumberStepper
          label={home}
          value={draft.home}
          onChange={(value) => onChange({ ...draft, home: value })}
        />
        <NumberStepper
          label={away}
          value={draft.away}
          onChange={(value) => onChange({ ...draft, away: value })}
        />
      </Section>

      {isKnockout && mode === "prediction" ? (
        <Section>
          <AppText variant="caption">
            Knock-outwedstrijd: een gelijkspel is niet mogelijk.
          </AppText>
        </Section>
      ) : null}

      {needsWinner ? (
        <Section title="Winnaar na verlenging of strafschoppen">
          <Picker
            selectedValue={draft.winnerId || NO_CHOICE}
            onValueChange={(id) => onChange({ ...draft, winnerId: String(id) })}
          >
            <Picker.Item label="Kies…" value={NO_CHOICE} />
            <Picker.Item label={home} value={payload.homeId} />
            <Picker.Item label={away} value={payload.awayId} />
          </Picker>
        </Section>
      ) : null}
    </>
  );
}

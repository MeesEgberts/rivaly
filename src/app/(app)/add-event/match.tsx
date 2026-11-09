import { TextInput } from "@expo/ui";
import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "@convex/_generated/api";
import { AppText } from "@/components/ui/app-text";
import { DateTimeRow } from "@/components/ui/date-time-row";
import { LabeledPicker } from "@/components/ui/labeled-picker";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section, SectionFooter } from "@/components/ui/screen";
import { useAddEventDraft } from "@/hooks/use-add-event-draft";
import {
  defaultStartsAt,
  presetOptions,
  suggestedCode,
} from "@/utils/custom-event-form";
import { closeAddEventModal } from "@/utils/add-event-navigation";
import { showError } from "@/utils/error-message";

/** Eigen voetbalwedstrijd: twee teams, aftrap en of gelijkspel kan. */
export default function NewMatchScreen() {
  const { destination } = useAddEventDraft();
  const createMatch = useMutation(api.customEvents.createMatch);
  const presets = presetOptions("football");

  const [homeName, setHomeName] = useState("");
  const [homeCode, setHomeCode] = useState("");
  const [awayName, setAwayName] = useState("");
  const [awayCode, setAwayCode] = useState("");
  const [startsAt, setStartsAt] = useState(defaultStartsAt);
  const [allowDraw, setAllowDraw] = useState(true);
  const [presetKey, setPresetKey] = useState(presets[0].value);
  const [busy, setBusy] = useState(false);

  const activePreset =
    presets.find((preset) => preset.value === presetKey) ?? presets[0];
  const canSubmit =
    homeName.trim().length >= 2 && awayName.trim().length >= 2 && !busy;

  const submit = async () => {
    setBusy(true);

    try {
      await createMatch({
        pouleId: destination.pouleId ?? undefined,
        publish: destination.publish || undefined,
        presetKey,
        home: { name: homeName, code: homeCode || suggestedCode(homeName) },
        away: { name: awayName, code: awayCode || suggestedCode(awayName) },
        startsAt,
        allowDraw,
      });

      closeAddEventModal();
    } catch (error) {
      showError("Aanmaken mislukt", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ModalToolbar
        onConfirm={submit}
        isConfirmDisabled={!canSubmit}
        confirmLabel="Wedstrijd aanmaken"
      />

      <Section title="Thuis">
        <TextInput
          placeholder="Team, bijv. Ajax"
          defaultValue={homeName}
          onChangeText={setHomeName}
          autoCapitalize="words"
          maxLength={40}
        />
        <TextInput
          placeholder={`Code, bijv. ${suggestedCode(homeName) || "AJA"}`}
          defaultValue={homeCode}
          onChangeText={setHomeCode}
          autoCapitalize="characters"
          maxLength={4}
        />
      </Section>

      <Section title="Uit">
        <TextInput
          placeholder="Team, bijv. PSV"
          defaultValue={awayName}
          onChangeText={setAwayName}
          autoCapitalize="words"
          maxLength={40}
        />
        <TextInput
          placeholder={`Code, bijv. ${suggestedCode(awayName) || "PSV"}`}
          defaultValue={awayCode}
          onChangeText={setAwayCode}
          autoCapitalize="characters"
          maxLength={4}
        />
        <SectionFooter>
          <AppText variant="caption">
            Een landcode (NED, BEL) krijgt vanzelf zijn vlag.
          </AppText>
        </SectionFooter>
      </Section>

      <Section title="Wedstrijd">
        <DateTimeRow label="Aftrap" value={startsAt} onChange={setStartsAt} />
        <NavRow
          icon="equal.circle"
          title="Gelijkspel mogelijk"
          subtitle="Zet uit bij een knock-outwedstrijd"
          selected={allowDraw}
          onPress={() => setAllowDraw((value) => !value)}
        />
      </Section>

      {destination.pouleId ? (
        <Section>
          <LabeledPicker
            label="Puntentelling"
            options={presets}
            selectedValue={activePreset.value}
            onValueChange={setPresetKey}
          />
          <SectionFooter>
            <AppText variant="caption">{activePreset.description}</AppText>
          </SectionFooter>
        </Section>
      ) : null}
    </Screen>
  );
}

import { TextInput } from "@expo/ui";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";

import { api } from "@convex/_generated/api";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { AppText } from "@/components/ui/app-text";
import { LabeledPicker } from "@/components/ui/labeled-picker";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { Screen, Section, SectionFooter } from "@/components/ui/screen";
import { showError } from "@/utils/error-message";

type RevealPredictions = Doc<"poules">["settings"]["revealPredictions"];

const REVEAL_OPTIONS: { value: RevealPredictions; label: string }[] = [
  { value: "afterLock", label: "Na de deadline" },
  { value: "always", label: "Altijd" },
];

interface Props {
  pouleId: Id<"poules">;
  initialName: string;
  initialEmoji: string;
  initialReveal: RevealPredictions;
}

/** Formulier om de instellingen van een poule te wijzigen. */
export function EditPouleForm({
  pouleId,
  initialName,
  initialEmoji,
  initialReveal,
}: Props) {
  const updateSettings = useMutation(api.poules.updateSettings);

  const [name, setName] = useState(initialName);
  const [emoji, setEmoji] = useState(initialEmoji);
  const [reveal, setReveal] = useState<RevealPredictions>(initialReveal);
  const [busy, setBusy] = useState(false);

  const canSubmit = name.trim().length >= 2;

  const submit = async () => {
    setBusy(true);

    try {
      await updateSettings({
        pouleId,
        name,
        emoji: emoji.trim(),
        revealPredictions: reveal,
      });

      router.back();
    } catch (error) {
      showError("Opslaan mislukt", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ModalToolbar onConfirm={submit} isConfirmDisabled={busy || !canSubmit} />

      <Section title="Naam">
        <TextInput
          placeholder="Bijv. Kantoorpoule"
          defaultValue={initialName}
          onChangeText={setName}
          autoCapitalize="sentences"
          maxLength={40}
        />
        <TextInput
          placeholder="Emoji (optioneel)"
          defaultValue={initialEmoji}
          onChangeText={setEmoji}
          maxLength={2}
        />
      </Section>

      <Section>
        <LabeledPicker
          label="Voorspellingen zichtbaar"
          options={REVEAL_OPTIONS}
          selectedValue={reveal}
          onValueChange={(value) => setReveal(value as RevealPredictions)}
        />
        <SectionFooter>
          <AppText variant="caption">
            Wanneer leden elkaars voorspellingen kunnen zien.
          </AppText>
        </SectionFooter>
      </Section>
    </Screen>
  );
}

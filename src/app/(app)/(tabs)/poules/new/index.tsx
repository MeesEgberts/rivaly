import { TextInput } from "@expo/ui";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useMemo, useState } from "react";

import { api } from "@convex/_generated/api";
import { ListSkeleton } from "@/components/skeleton/list-skeleton";
import { AppText } from "@/components/ui/app-text";
import { LabeledPicker } from "@/components/ui/labeled-picker";
import { NavRow } from "@/components/ui/nav-row";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { Screen, Section, SectionFooter } from "@/components/ui/screen";
import { useNewPouleDraft } from "@/hooks/use-new-poule-draft";
import { catalogSubtitle, sportIcon } from "@/utils/event-catalog";
import { showError } from "@/utils/error-message";

/**
 * Poule aanmaken op één scherm: naam, wedstrijden (gekozen in een apart
 * zoekscherm) en puntentelling. De puntentelling heeft een standaardwaarde.
 */
export default function NewPouleScreen() {
  const catalog = useQuery(api.events.catalog);
  const create = useMutation(api.poules.create);
  const { selectedEventIds } = useNewPouleDraft();

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [presetKey, setPresetKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const chosenEvents = useMemo(
    () => (catalog ?? []).filter((event) => selectedEventIds.has(event._id)),
    [catalog, selectedEventIds],
  );

  // Presets die élk gekozen evenement kent; bij één module zijn dat gewoon de presets van die module.
  const presets = useMemo(() => {
    if (chosenEvents.length === 0) {
      return [];
    }

    return chosenEvents[0].presets.filter((preset) =>
      chosenEvents.every((event) =>
        event.presets.some((candidate) => candidate.key === preset.key),
      ),
    );
  }, [chosenEvents]);

  const activePreset =
    presets.find((preset) => preset.key === presetKey) ?? presets[0] ?? null;

  const canSubmit =
    catalog !== undefined && name.trim().length >= 2 && activePreset !== null;

  const submit = async () => {
    if (!activePreset) {
      return;
    }

    setBusy(true);

    try {
      const { pouleId } = await create({
        name,
        emoji: emoji.trim() || undefined,
        eventIds: chosenEvents.map((event) => event._id),
        presetKey: activePreset.key,
      });

      router.back();
      router.push(`/poules/${pouleId}`);
    } catch (error) {
      showError("Aanmaken mislukt", error);
    } finally {
      setBusy(false);
    }
  };

  // De knoppen staan er vanaf het openen, ook als de catalogus nog laadt.
  const toolbar = (
    <ModalToolbar
      onConfirm={submit}
      isConfirmDisabled={busy || !canSubmit}
      confirmLabel="Poule aanmaken"
    />
  );

  if (catalog === undefined) {
    return (
      <>
        {toolbar}
        <ListSkeleton sections={[2, 1, 1]} leading="none" />
      </>
    );
  }

  return (
    <Screen>
      {toolbar}

      <Section title="Naam">
        <TextInput
          placeholder="Bijv. Kantoorpoule"
          defaultValue={name}
          onChangeText={setName}
          autoCapitalize="sentences"
          maxLength={40}
        />
        <TextInput
          placeholder="Emoji (optioneel)"
          defaultValue={emoji}
          onChangeText={setEmoji}
          maxLength={2}
        />
      </Section>

      <Section title="Wedstrijden en toernooien">
        {chosenEvents.map((event) => (
          <NavRow
            key={event._id}
            icon={sportIcon(event)}
            title={event.name}
            subtitle={catalogSubtitle(event)}
          />
        ))}
        <NavRow
          icon={
            chosenEvents.length === 0
              ? "plus.circle.fill"
              : "pencil.circle.fill"
          }
          title={
            chosenEvents.length === 0 ? "Kies wedstrijden" : "Wijzig keuze"
          }
          onPress={() => router.push("/poules/new/events")}
        />
      </Section>

      {activePreset ? (
        <Section>
          <LabeledPicker
            label="Puntentelling"
            options={presets.map((preset) => ({
              value: preset.key,
              label: preset.name,
            }))}
            selectedValue={activePreset.key}
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

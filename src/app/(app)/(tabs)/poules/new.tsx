import { Picker, TextInput } from "@expo/ui";
import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useMemo, useState } from "react";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { LoadingScreen } from "@/components/loading-screen";
import { AppText } from "@/components/ui/app-text";
import { NavRow } from "@/components/ui/nav-row";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { Screen, Section } from "@/components/ui/screen";
import { formatDate } from "@/utils/format";
import { showError } from "@/utils/error-message";

/**
 * Poule aanmaken in drie stappen op één scherm: naam, wedstrijden kiezen,
 * puntentelling. Stap drie heeft een standaardwaarde en mag worden overgeslagen.
 */
export default function NewPouleScreen() {
  const catalog = useQuery(api.events.catalog);
  const create = useMutation(api.poules.create);

  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [selected, setSelected] = useState<Set<Id<"events">>>(new Set());
  const [presetKey, setPresetKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Presets die élk gekozen evenement kent; bij één module zijn dat gewoon de presets van die module.
  const presets = useMemo(() => {
    if (!catalog) {
      return [];
    }

    const chosen = catalog.filter((event) => selected.has(event._id));

    if (chosen.length === 0) {
      return [];
    }

    return chosen[0].presets.filter((preset) =>
      chosen.every((event) =>
        event.presets.some((candidate) => candidate.key === preset.key),
      ),
    );
  }, [catalog, selected]);

  const activePreset =
    presets.find((preset) => preset.key === presetKey) ?? presets[0] ?? null;

  if (catalog === undefined) {
    return <LoadingScreen />;
  }

  const toggle = (eventId: Id<"events">, on: boolean) => {
    const next = new Set(selected);

    if (on) {
      next.add(eventId);
    } else {
      next.delete(eventId);
    }

    setSelected(next);
  };

  const canSubmit = name.trim().length >= 2 && activePreset !== null;

  const submit = async () => {
    if (!activePreset) {
      return;
    }

    setBusy(true);

    try {
      const { pouleId } = await create({
        name,
        emoji: emoji.trim() || undefined,
        eventIds: [...selected],
        presetKey: activePreset.key,
      });

      router.dismiss();
      router.push(`/poules/${pouleId}`);
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
        isConfirmDisabled={busy || !canSubmit}
        confirmLabel="Poule aanmaken"
      />

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
        {catalog.length === 0 ? (
          <AppText variant="secondary">
            Er staan nog geen evenementen in de catalogus.
          </AppText>
        ) : (
          catalog.map((event) => (
            <NavRow
              key={event._id}
              icon={
                event.moduleKey === "football" ? "soccerball" : "sportscourt"
              }
              title={event.name}
              subtitle={`${event.moduleName} · ${formatDate(event.startsAt)}`}
              selected={selected.has(event._id)}
              onPress={() => toggle(event._id, !selected.has(event._id))}
            />
          ))
        )}
      </Section>

      {activePreset ? (
        <Section title="Puntentelling">
          <Picker
            selectedValue={activePreset.key}
            onValueChange={(key) => setPresetKey(String(key))}
          >
            {presets.map((preset) => (
              <Picker.Item
                key={preset.key}
                label={preset.name}
                value={preset.key}
              />
            ))}
          </Picker>
          <AppText variant="caption">{activePreset.description}</AppText>
        </Section>
      ) : (
        <Section>
          <AppText variant="caption">
            Kies minimaal één wedstrijd of toernooi om verder te gaan.
          </AppText>
        </Section>
      )}
    </Screen>
  );
}

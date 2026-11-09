import { TextInput } from "@expo/ui";
import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";

import { api } from "@convex/_generated/api";
import { AppText } from "@/components/ui/app-text";
import { DateTimeRow } from "@/components/ui/date-time-row";
import { LabeledPicker } from "@/components/ui/labeled-picker";
import { NavRow } from "@/components/ui/nav-row";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { Screen, Section, SectionFooter } from "@/components/ui/screen";
import { useAddEventDraft } from "@/hooks/use-add-event-draft";
import {
  defaultStartsAt,
  parseDistance,
  presetOptions,
  PROFILE_OPTIONS,
  profileFromOption,
  routeFrom,
} from "@/utils/custom-event-form";
import { closeAddEventModal } from "@/utils/add-event-navigation";
import { showError } from "@/utils/error-message";

const MIN_FAVOURITES = 3;

/**
 * Eigen eendagskoers: naam, start, parcours en favorieten. Het podium wordt
 * uit alle renners gekozen; de favorieten staan bovenaan.
 */
export default function NewRaceScreen() {
  const { destination, favourites } = useAddEventDraft();
  const createRace = useMutation(api.customEvents.createRace);
  const presets = presetOptions("cycling");

  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState(defaultStartsAt);
  const [start, setStart] = useState("");
  const [finish, setFinish] = useState("");
  const [distance, setDistance] = useState("");
  const [profile, setProfile] = useState("none");
  const [includeDutch, setIncludeDutch] = useState(true);
  const [presetKey, setPresetKey] = useState(presets[0].value);
  const [busy, setBusy] = useState(false);

  const activePreset =
    presets.find((preset) => preset.value === presetKey) ?? presets[0];
  const canSubmit =
    name.trim().length >= 2 && favourites.length >= MIN_FAVOURITES && !busy;

  const submit = async () => {
    setBusy(true);

    try {
      await createRace({
        pouleId: destination.pouleId ?? undefined,
        publish: destination.publish || undefined,
        presetKey,
        name,
        startsAt,
        route: routeFrom(start, finish),
        distanceKm: parseDistance(distance),
        profile: profileFromOption(profile),
        favouriteIds: favourites.map((athlete) => athlete.id as never),
        includeDutchQuestions: includeDutch,
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
        confirmLabel="Koers aanmaken"
      />

      <Section title="Koers">
        <TextInput
          placeholder="Naam, bijv. Milaan-Sanremo 2027"
          defaultValue={name}
          onChangeText={setName}
          autoCapitalize="sentences"
          maxLength={60}
        />
        <DateTimeRow label="Start" value={startsAt} onChange={setStartsAt} />
      </Section>

      <Section title="Parcours">
        <TextInput
          placeholder="Startplaats"
          defaultValue={start}
          onChangeText={setStart}
          autoCapitalize="words"
          maxLength={40}
        />
        <TextInput
          placeholder="Finishplaats"
          defaultValue={finish}
          onChangeText={setFinish}
          autoCapitalize="words"
          maxLength={40}
        />
        <TextInput
          placeholder="Afstand in km"
          defaultValue={distance}
          onChangeText={setDistance}
          keyboardType="numeric"
          maxLength={4}
        />
        <LabeledPicker
          label="Soort koers"
          options={PROFILE_OPTIONS}
          selectedValue={profile}
          onValueChange={setProfile}
        />
      </Section>

      <Section title="Vragen">
        <NavRow
          icon="star.fill"
          title="Favorieten"
          subtitle={
            favourites.length === 0
              ? `Kies minimaal ${MIN_FAVOURITES} renners`
              : favourites.map((athlete) => athlete.shortName).join(", ")
          }
          value={String(favourites.length)}
          onPress={() => router.push("/add-event/favourites")}
        />
        <NavRow
          icon="flag.fill"
          title="Nederlandse vragen"
          subtitle="Beste Nederlander en Nederlanders in de top 10"
          selected={includeDutch}
          onPress={() => setIncludeDutch((value) => !value)}
        />
        <SectionFooter>
          <AppText variant="caption">
            Het podium (top 3) zit er altijd in. Deelnemers kiezen uit alle
            renners; jouw favorieten staan bovenaan.
          </AppText>
        </SectionFooter>
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

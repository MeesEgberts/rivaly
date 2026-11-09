import { useMutation, useQuery } from "convex/react";
import { Stack } from "expo-router";
import { useMemo, useState } from "react";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { CatalogPicker } from "@/components/catalog/catalog-picker";
import { useAddEventDraft } from "@/hooks/use-add-event-draft";
import { closeAddEventModal } from "@/utils/add-event-navigation";
import { showError } from "@/utils/error-message";

/**
 * Catalogus-evenementen toevoegen aan een bestaande poule. De puntentelling
 * volgt die van de evenementen die er al in zitten.
 */
export default function AddFromCatalogScreen() {
  const { destination, selectedEventIds, toggleEvent, toggleEvents } =
    useAddEventDraft();
  const pouleId = destination.pouleId;
  const poule = useQuery(api.poules.get, pouleId ? { pouleId } : "skip");
  const addEvents = useMutation(api.poules.addEvents);
  const [busy, setBusy] = useState(false);

  const excludeEventIds = useMemo(
    () =>
      new Set<Id<"events">>((poule?.events ?? []).map((event) => event._id)),
    [poule?.events],
  );

  const presetKey = poule?.events[0]?.presetKey ?? "classic";

  const submit = async () => {
    if (!pouleId) {
      return;
    }

    setBusy(true);

    try {
      await addEvents({
        pouleId,
        eventIds: [...selectedEventIds],
        presetKey,
      });
      closeAddEventModal();
    } catch (error) {
      showError("Toevoegen mislukt", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <CatalogPicker
      selectedEventIds={selectedEventIds}
      toggleEvent={toggleEvent}
      toggleEvents={toggleEvents}
      excludeEventIds={excludeEventIds}
      toolbarItems={
        <Stack.Toolbar.Button
          icon="checkmark"
          variant="prominent"
          accessibilityLabel="Toevoegen"
          disabled={busy || !poule || selectedEventIds.size === 0}
          onPress={submit}
        />
      }
    />
  );
}

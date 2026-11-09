import { CatalogPicker } from "@/components/catalog/catalog-picker";
import { useNewPouleDraft } from "@/hooks/use-new-poule-draft";

/** Wedstrijden en toernooien kiezen voor een nieuwe poule. */
export default function ChooseEventsScreen() {
  const { selectedEventIds, toggleEvent, toggleEvents } = useNewPouleDraft();

  return (
    <CatalogPicker
      selectedEventIds={selectedEventIds}
      toggleEvent={toggleEvent}
      toggleEvents={toggleEvents}
    />
  );
}

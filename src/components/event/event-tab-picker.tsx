import type { EventTab, EventTabKey } from "@/utils/event-tabs";

export interface EventTabPickerProps {
  tabs: EventTab[];
  selected: EventTabKey;
  onSelect: (key: EventTabKey) => void;
}

/** Platformvarianten in `event-tab-picker.ios.tsx` en `event-tab-picker.android.tsx`. */
export function EventTabPicker(_props: EventTabPickerProps) {
  return null;
}

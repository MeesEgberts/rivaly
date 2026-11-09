import { DatePicker } from "@expo/ui/swift-ui";

import type { DateTimeRowProps } from "./date-time-row";

/**
 * Datum en tijd kiezen zoals in Agenda: label links, datum- en tijdknop
 * rechts die een native kalender en tijdwiel openen.
 */
export function DateTimeRow({ label, value, onChange }: DateTimeRowProps) {
  return (
    <DatePicker
      title={label}
      selection={new Date(value)}
      displayedComponents={["date", "hourAndMinute"]}
      range={{ start: new Date() }}
      onDateChange={(date) => onChange(date.getTime())}
    />
  );
}

import {
  DateTimePicker,
  ListItem,
  Text,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";

import { formatDateTime } from "@/utils/format";

import type { DateTimeRowProps } from "./date-time-row";

/** Material-rij met het gekozen moment, en daaronder de datum- en tijdkiezer. */
export function DateTimeRow({ label, value, onChange }: DateTimeRowProps) {
  const colors = useMaterialColors();

  return (
    <>
      <ListItem modifiers={[fillMaxWidth()]}>
        <ListItem.HeadlineContent>
          <Text style={{ typography: "bodyLarge" }}>{label}</Text>
        </ListItem.HeadlineContent>
        <ListItem.TrailingContent>
          <Text
            color={colors.onSurfaceVariant}
            style={{ typography: "labelLarge" }}
          >
            {formatDateTime(value)}
          </Text>
        </ListItem.TrailingContent>
      </ListItem>
      <DateTimePicker
        initialDate={new Date(value).toISOString()}
        displayedComponents="dateAndTime"
        variant="input"
        is24Hour
        onDateSelected={(date) => {
          if (date) {
            onChange(date.getTime());
          }
        }}
      />
    </>
  );
}

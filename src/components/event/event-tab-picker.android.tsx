import {
  Host,
  SegmentedButton,
  SingleChoiceSegmentedButtonRow,
  Text,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding } from "@expo/ui/jetpack-compose/modifiers";

import type { EventTabPickerProps } from "./event-tab-picker";

/** Material 3 segmented buttons onder de app bar. */
export function EventTabPicker({
  tabs,
  selected,
  onSelect,
}: EventTabPickerProps) {
  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <SingleChoiceSegmentedButtonRow
        modifiers={[fillMaxWidth(), padding(16, 8, 16, 8)]}
      >
        {tabs.map((tab) => (
          <SegmentedButton
            key={tab.key}
            selected={tab.key === selected}
            onClick={() => onSelect(tab.key)}
          >
            <SegmentedButton.Label>
              <Text>{tab.label}</Text>
            </SegmentedButton.Label>
          </SegmentedButton>
        ))}
      </SingleChoiceSegmentedButtonRow>
    </Host>
  );
}

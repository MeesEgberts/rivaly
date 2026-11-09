import { Host, Picker, Text } from "@expo/ui/swift-ui";
import { padding, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

import type { EventTabPickerProps } from "./event-tab-picker";
import type { EventTabKey } from "@/utils/event-tabs";

/** Native SwiftUI segmented control onder de navigatiebalk. */
export function EventTabPicker({
  tabs,
  selected,
  onSelect,
}: EventTabPickerProps) {
  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <Picker
        selection={selected}
        onSelectionChange={(key) => onSelect(key as EventTabKey)}
        modifiers={[
          pickerStyle("segmented"),
          padding({ horizontal: 16, vertical: 8 }),
        ]}
      >
        {tabs.map((tab) => (
          <Text key={tab.key} modifiers={[tag(tab.key)]}>
            {tab.label}
          </Text>
        ))}
      </Picker>
    </Host>
  );
}

import { Picker, Text } from "@expo/ui/swift-ui";
import { pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";

import type { LabeledPickerProps } from "./labeled-picker";

/**
 * Keuzerij zoals in Instellingen: label links, gekozen waarde met ⌃⌄ rechts.
 * Een SwiftUI-menupicker met label doet dit vanzelf binnen een Form.
 */
export function LabeledPicker({
  label,
  options,
  selectedValue,
  onValueChange,
}: LabeledPickerProps) {
  return (
    <Picker
      label={label}
      selection={selectedValue}
      onSelectionChange={(value) => onValueChange(String(value))}
      modifiers={[pickerStyle("menu")]}
    >
      {options.map((option) => (
        <Text key={option.value} modifiers={[tag(option.value)]}>
          {option.label}
        </Text>
      ))}
    </Picker>
  );
}

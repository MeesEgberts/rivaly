import {
  DropdownMenu,
  DropdownMenuItem,
  ListItem,
  Text,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { clickable, fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";

import type { LabeledPickerProps } from "./labeled-picker";

/**
 * Material-rij met label links en de gekozen waarde rechts; tikken opent
 * een dropdownmenu met de opties.
 */
export function LabeledPicker({
  label,
  options,
  selectedValue,
  onValueChange,
}: LabeledPickerProps) {
  const colors = useMaterialColors();
  const [expanded, setExpanded] = useState(false);

  const selectedLabel =
    options.find((option) => option.value === selectedValue)?.label ?? "";

  return (
    <DropdownMenu
      expanded={expanded}
      onDismissRequest={() => setExpanded(false)}
    >
      <DropdownMenu.Trigger>
        <ListItem
          modifiers={[fillMaxWidth(), clickable(() => setExpanded(true))]}
        >
          <ListItem.HeadlineContent>
            <Text style={{ typography: "bodyLarge" }}>{label}</Text>
          </ListItem.HeadlineContent>
          <ListItem.TrailingContent>
            <Text
              color={colors.onSurfaceVariant}
              style={{ typography: "labelLarge" }}
            >
              {selectedLabel}
            </Text>
          </ListItem.TrailingContent>
        </ListItem>
      </DropdownMenu.Trigger>
      <DropdownMenu.Items>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              onValueChange(option.value);
              setExpanded(false);
            }}
          >
            <DropdownMenuItem.Text>
              <Text>{option.label}</Text>
            </DropdownMenuItem.Text>
          </DropdownMenuItem>
        ))}
      </DropdownMenu.Items>
    </DropdownMenu>
  );
}

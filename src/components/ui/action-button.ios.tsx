import { Button, Text } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  controlSize,
  disabled as disabledModifier,
  font,
  frame,
} from "@expo/ui/swift-ui/modifiers";

import type { ActionButtonProps } from "./action-button";

/**
 * Volledige-breedte knop zoals iOS die onderaan een formulier of scherm
 * toont: `borderedProminent` voor de hoofdactie, `bordered` voor de rest.
 */
export function ActionButton({
  label,
  onPress,
  variant = "primary",
  disabled,
}: ActionButtonProps) {
  return (
    <Button
      onPress={onPress}
      role={variant === "destructive" ? "destructive" : undefined}
      modifiers={[
        buttonStyle(variant === "primary" ? "borderedProminent" : "bordered"),
        controlSize("large"),
        frame({ maxWidth: Infinity }),
        ...(disabled ? [disabledModifier(true)] : []),
      ]}
    >
      <Text
        modifiers={[
          font({ textStyle: "body", weight: "semibold" }),
          frame({ maxWidth: Infinity }),
        ]}
      >
        {label}
      </Text>
    </Button>
  );
}

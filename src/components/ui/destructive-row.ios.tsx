import { Button, HStack, Spacer, Text } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  contentShape,
  foregroundStyle,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import type { DestructiveRowProps } from "./destructive-row";

/** De rode, gecentreerde tekstrij die iOS gebruikt voor "Uitloggen" en "Verwijderen". */
export function DestructiveRow({ title, onPress }: DestructiveRowProps) {
  return (
    <Button
      onPress={onPress}
      role="destructive"
      modifiers={[buttonStyle("plain")]}
    >
      <HStack modifiers={[contentShape(shapes.rectangle())]}>
        <Spacer />
        <Text modifiers={[foregroundStyle("red")]}>{title}</Text>
        <Spacer />
      </HStack>
    </Button>
  );
}

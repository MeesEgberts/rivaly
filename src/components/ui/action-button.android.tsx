import {
  Button,
  FilledTonalButton,
  OutlinedButton,
  Text,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { fillMaxWidth, height } from "@expo/ui/jetpack-compose/modifiers";

import type { ActionButtonProps } from "./action-button";

/**
 * Material 3: Filled button voor de hoofdactie, Filled tonal voor de
 * alternatieve, Outlined in error-kleur voor destructieve acties.
 */
export function ActionButton({
  label,
  onPress,
  variant = "primary",
  disabled,
}: ActionButtonProps) {
  const colors = useMaterialColors();
  const modifiers = [fillMaxWidth(), height(48)];
  const content = <Text style={{ typography: "labelLarge" }}>{label}</Text>;

  if (variant === "secondary") {
    return (
      <FilledTonalButton
        onClick={onPress}
        enabled={!disabled}
        modifiers={modifiers}
      >
        {content}
      </FilledTonalButton>
    );
  }

  if (variant === "destructive") {
    return (
      <OutlinedButton
        onClick={onPress}
        enabled={!disabled}
        colors={{ contentColor: colors.error }}
        modifiers={modifiers}
      >
        {content}
      </OutlinedButton>
    );
  }

  return (
    <Button onClick={onPress} enabled={!disabled} modifiers={modifiers}>
      {content}
    </Button>
  );
}

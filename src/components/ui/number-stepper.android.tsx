import {
  FilledTonalButton,
  Row,
  Spacer,
  Text,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  size,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";

import type { NumberStepperProps } from "./number-stepper";

/**
 * Material kent geen stepper; het gangbare patroon is een label met twee
 * tonal knoppen rond de waarde.
 */
export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
}: NumberStepperProps) {
  const colors = useMaterialColors();

  return (
    <Row
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: 8 }}
      modifiers={[fillMaxWidth(), padding(16, 8, 16, 8)]}
    >
      <Text style={{ typography: "bodyLarge" }} modifiers={[weight(1)]}>
        {label}
      </Text>
      <Spacer />
      <FilledTonalButton
        onClick={() => onChange(Math.max(min, value - step))}
        enabled={value > min}
        modifiers={[size(40, 40)]}
        contentPadding={{ start: 0, end: 0, top: 0, bottom: 0 }}
      >
        <Text style={{ typography: "titleMedium" }}>−</Text>
      </FilledTonalButton>
      <Text
        color={colors.onSurface}
        style={{ typography: "headlineSmall", textAlign: "center" }}
        modifiers={[size(44, 40)]}
      >
        {String(value)}
      </Text>
      <FilledTonalButton
        onClick={() => onChange(Math.min(max, value + step))}
        enabled={value < max}
        modifiers={[size(40, 40)]}
        contentPadding={{ start: 0, end: 0, top: 0, bottom: 0 }}
      >
        <Text style={{ typography: "titleMedium" }}>+</Text>
      </FilledTonalButton>
    </Row>
  );
}

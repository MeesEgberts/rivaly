import { HStack, Spacer, Stepper, Text } from "@expo/ui/swift-ui";
import {
  font,
  labelsHidden,
  monospacedDigit,
} from "@expo/ui/swift-ui/modifiers";

import type { NumberStepperProps } from "./number-stepper";

/**
 * Native SwiftUI Stepper in een Form-rij: label links, grote waarde en
 * de -/+ knoppen rechts. Zo voer je op iOS een score in zonder toetsenbord.
 */
export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
}: NumberStepperProps) {
  return (
    <HStack spacing={12}>
      <Text modifiers={[font({ textStyle: "body" })]}>{label}</Text>
      <Spacer />
      <Text
        modifiers={[
          font({ textStyle: "title2", weight: "semibold", design: "rounded" }),
          monospacedDigit(),
        ]}
      >
        {String(value)}
      </Text>
      <Stepper
        label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={onChange}
        modifiers={[labelsHidden()]}
      />
    </HStack>
  );
}

export interface NumberStepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/** Platformvarianten in `number-stepper.ios.tsx` en `number-stepper.android.tsx`. */
export function NumberStepper(_props: NumberStepperProps) {
  return null;
}

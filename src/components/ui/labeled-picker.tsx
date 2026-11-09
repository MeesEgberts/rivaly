export interface LabeledPickerOption {
  value: string;
  label: string;
}

export interface LabeledPickerProps {
  /** Tekst links in de rij, bijv. "Puntentelling". */
  label: string;
  options: LabeledPickerOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

/** Platformvarianten in `labeled-picker.ios.tsx` en `labeled-picker.android.tsx`. */
export function LabeledPicker(_props: LabeledPickerProps) {
  return null;
}

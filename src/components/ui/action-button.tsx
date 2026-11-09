export interface ActionButtonProps {
  label: string;
  onPress: () => void;
  /** `primary` is de hoofdactie van een scherm, `secondary` de alternatieve, `destructive` verwijderen/uitloggen. */
  variant?: "primary" | "secondary" | "destructive";
  disabled?: boolean;
}

/** Platformvarianten in `action-button.ios.tsx` en `action-button.android.tsx`. */
export function ActionButton(_props: ActionButtonProps) {
  return null;
}

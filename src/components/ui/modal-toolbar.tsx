import { router, Stack } from "expo-router";

interface Props {
  /** Zonder `onConfirm` toont de header alleen een sluitknop (bijv. als iets gesloten is). */
  onConfirm?: () => void;
  isConfirmDisabled?: boolean;
  confirmLabel?: string;
}

/**
 * Header van een modaal formulier zoals iOS dat doet: links annuleren (✕),
 * rechts bevestigen (✓, prominent). Geen grote knop onderin het scherm.
 */
export function ModalToolbar({
  onConfirm,
  isConfirmDisabled,
  confirmLabel = "Bewaar",
}: Props) {
  return (
    <>
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          accessibilityLabel={onConfirm ? "Annuleer" : "Sluit"}
          onPress={() => router.back()}
        />
      </Stack.Toolbar>
      {onConfirm ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon="checkmark"
            variant="prominent"
            accessibilityLabel={confirmLabel}
            disabled={isConfirmDisabled}
            onPress={onConfirm}
          />
        </Stack.Toolbar>
      ) : null}
    </>
  );
}

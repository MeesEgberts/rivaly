import * as Haptics from "expo-haptics";

/** Licht tikje bij een cijfer of keuze. Faalt stil op toestellen zonder haptics. */
export function tapFeedback() {
  Haptics.selectionAsync().catch(() => undefined);
}

/** Iets steviger bij een afgeronde stap, zoals een opgeslagen wedstrijd. */
export function successFeedback() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
    () => undefined,
  );
}

import { ConvexError } from "convex/values";
import { Alert } from "react-native";

/**
 * Tekst voor de gebruiker. Convex geeft alleen `ConvexError`-data door in
 * productie; andere fouten komen binnen als "Server Error".
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ConvexError && typeof error.data === "string") {
    return error.data;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Er ging iets mis. Probeer het opnieuw.";
}

export function showError(title: string, error: unknown) {
  Alert.alert(title, errorMessage(error));
}

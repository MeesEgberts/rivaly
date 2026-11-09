import { useMutation } from "convex/react";
import { router } from "expo-router";
import { Alert } from "react-native";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { showError } from "@/utils/error-message";

/**
 * Vraagt bevestiging en verwijdert dan de poule. We gaan eerst terug naar
 * het overzicht, zodat het poulescherm niet een verdwenen poule laadt.
 */
export function useDeletePoule(pouleId: Id<"poules">, pouleName: string) {
  const removePoule = useMutation(api.poules.remove);

  const remove = async () => {
    router.back();

    try {
      await removePoule({ pouleId });
    } catch (error) {
      showError("Verwijderen mislukt", error);
    }
  };

  return () => {
    Alert.alert(
      "Poule verwijderen?",
      `"${pouleName}" en alles wat erin staat verdwijnt. Dit kun je niet ongedaan maken.`,
      [
        { text: "Annuleer", style: "cancel" },
        { text: "Verwijder", style: "destructive", onPress: remove },
      ],
    );
  };
}

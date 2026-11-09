import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useCallback, useState } from "react";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type { FixturePrediction } from "@modules/validators";
import { showError } from "@/utils/error-message";
import { successFeedback } from "@/utils/haptics";

/** Bewaart een voorspelling en sluit daarna het modale scherm. */
export function useSavePrediction(fixtureId: Id<"fixtures">) {
  const save = useMutation(api.predictions.save);
  const [isSaving, setIsSaving] = useState(false);

  const submit = useCallback(
    async (payload: FixturePrediction) => {
      setIsSaving(true);

      try {
        await save({ fixtureId, payload });
        successFeedback();
        router.back();
      } catch (error) {
        showError("Opslaan mislukt", error);
      } finally {
        setIsSaving(false);
      }
    },
    [save, fixtureId],
  );

  return { submit, isSaving };
}

import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ListSkeleton } from "@/components/skeleton/list-skeleton";
import { EditPouleForm } from "@/components/poule/edit-poule-form";

/** Naam, emoji en zichtbaarheid van voorspellingen wijzigen (modal). */
export default function EditPouleScreen() {
  const { pouleId } = useLocalSearchParams<{ pouleId: Id<"poules"> }>();
  const poule = useQuery(api.poules.get, { pouleId });

  if (poule === undefined) {
    return <ListSkeleton sections={[2, 1]} leading="none" />;
  }

  return (
    <EditPouleForm
      pouleId={pouleId}
      initialName={poule.name}
      initialEmoji={poule.emoji ?? ""}
      initialReveal={poule.settings.revealPredictions}
    />
  );
}

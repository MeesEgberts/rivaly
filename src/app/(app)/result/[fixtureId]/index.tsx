import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { BracketResultEditor } from "@/components/admin/bracket-result-editor";
import { ResultForm } from "@/components/admin/result-form";
import { AthleteResultForm } from "@/components/athletes/athlete-result-form";
import { PredictSkeleton } from "@/components/skeleton/predict-skeleton";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { isAthletePool } from "@/utils/athletes";

/** Beheerscherm: (tussen)uitslag invoeren. Alleen voor users.isAdmin. */
export default function ResultScreen() {
  const { fixtureId } = useLocalSearchParams<{ fixtureId: Id<"fixtures"> }>();
  const fixture = useQuery(api.events.fixture, { fixtureId });

  // De knoppen staan er al tijdens het openen; anders schuiven ze er pas
  // later in, als de modal al omhoog is gekomen.
  if (fixture === undefined) {
    return (
      <>
        <ModalToolbar onConfirm={() => {}} isConfirmDisabled />
        <PredictSkeleton />
      </>
    );
  }

  if (fixture.payload.type === "bracket") {
    return <BracketResultEditor key={fixture._id} fixture={fixture} />;
  }

  if (isAthletePool(fixture.payload)) {
    return <AthleteResultForm key={fixture._id} fixture={fixture} />;
  }

  return <ResultForm key={fixture._id} fixture={fixture} />;
}

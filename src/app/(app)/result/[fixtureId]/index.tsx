import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { BracketResultEditor } from "@/components/admin/bracket-result-editor";
import { ResultForm } from "@/components/admin/result-form";
import { AthleteResultForm } from "@/components/athletes/athlete-result-form";
import { LoadingScreen } from "@/components/loading-screen";
import { isAthletePool } from "@/utils/athletes";

/** Beheerscherm: (tussen)uitslag invoeren. Alleen voor users.isAdmin. */
export default function ResultScreen() {
  const { fixtureId } = useLocalSearchParams<{ fixtureId: Id<"fixtures"> }>();
  const fixture = useQuery(api.events.fixture, { fixtureId });

  if (fixture === undefined) {
    return <LoadingScreen />;
  }

  if (fixture.payload.type === "bracket") {
    return <BracketResultEditor key={fixture._id} fixture={fixture} />;
  }

  if (isAthletePool(fixture.payload)) {
    return <AthleteResultForm key={fixture._id} fixture={fixture} />;
  }

  return <ResultForm key={fixture._id} fixture={fixture} />;
}

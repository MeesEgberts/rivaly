import { useQuery } from "convex/react";
import { Redirect, useLocalSearchParams } from "expo-router";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { AthletePredictView } from "@/components/athletes/athlete-predict-view";
import { LoadingScreen } from "@/components/loading-screen";
import { NumericPredictView } from "@/components/predict/numeric-predict-view";
import { PickPredictView } from "@/components/predict/pick-predict-view";
import { RankingPredictView } from "@/components/predict/ranking-predict-view";
import { ScorePredictView } from "@/components/predict/score-predict-view";
import { isAthletePool } from "@/utils/athletes";

/** Voorspellen: elk vraagtype heeft zijn eigen weergave. */
export default function PredictScreen() {
  const { fixtureId } = useLocalSearchParams<{ fixtureId: Id<"fixtures"> }>();
  const fixture = useQuery(api.events.fixture, { fixtureId });

  if (fixture === undefined) {
    return <LoadingScreen />;
  }

  // Kiezen uit alle atleten van een sport: één weergave voor keuze en volgorde.
  if (isAthletePool(fixture.payload)) {
    return <AthletePredictView key={fixture._id} fixture={fixture} />;
  }

  switch (fixture.payload.type) {
    case "score":
      return <ScorePredictView key={fixture._id} fixture={fixture} />;
    case "pick":
      return <PickPredictView key={fixture._id} fixture={fixture} />;
    case "ranking":
      return <RankingPredictView key={fixture._id} fixture={fixture} />;
    case "numeric":
      return <NumericPredictView key={fixture._id} fixture={fixture} />;
    case "bracket":
      // Een schema vul je in op het toernooischerm.
      return (
        <Redirect
          href={{
            pathname: "/events/[eventId]",
            params: { eventId: fixture.eventId, tab: "bracket" },
          }}
        />
      );
  }
}

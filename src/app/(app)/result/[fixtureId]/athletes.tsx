import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { AthleteSearchScreen } from "@/components/athletes/athlete-search-screen";
import { LoadingScreen } from "@/components/loading-screen";

/** Zoeken in alle atleten van de sport, voor een uitslag. */
export default function ResultAthletesScreen() {
  const { fixtureId } = useLocalSearchParams<{ fixtureId: Id<"fixtures"> }>();
  const fixture = useQuery(api.events.fixture, { fixtureId });

  if (fixture === undefined) {
    return <LoadingScreen />;
  }

  return <AthleteSearchScreen fixture={fixture} mode="result" />;
}

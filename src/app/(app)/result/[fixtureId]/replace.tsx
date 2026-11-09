import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { AthleteReplaceScreen } from "@/components/athletes/athlete-replace-screen";
import { LoadingScreen } from "@/components/loading-screen";

/** Een renner op het podium vervangen. */
export default function ReplaceAthleteScreen() {
  const { fixtureId, position } = useLocalSearchParams<{
    fixtureId: Id<"fixtures">;
    position: string;
  }>();
  const fixture = useQuery(api.events.fixture, { fixtureId });

  if (fixture === undefined) {
    return <LoadingScreen />;
  }

  return (
    <AthleteReplaceScreen
      fixture={fixture}
      mode="result"
      position={Number(position)}
    />
  );
}

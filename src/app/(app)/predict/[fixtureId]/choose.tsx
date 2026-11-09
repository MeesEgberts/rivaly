import { useQuery } from "convex/react";
import { useLocalSearchParams } from "expo-router";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { AthleteChooseScreen } from "@/components/athletes/athlete-choose-screen";
import { ListSkeleton } from "@/components/skeleton/list-skeleton";

/** Een renner kiezen voor een plek op het podium, of hem vervangen. */
export default function ChooseAthleteScreen() {
  const { fixtureId, position } = useLocalSearchParams<{
    fixtureId: Id<"fixtures">;
    position: string;
  }>();
  const fixture = useQuery(api.events.fixture, { fixtureId });

  if (fixture === undefined) {
    return <ListSkeleton sections={[8]} leading="circle" />;
  }

  return (
    <AthleteChooseScreen
      fixture={fixture}
      mode="prediction"
      position={Number(position)}
    />
  );
}

import { useMemo } from "react";

import type { Id } from "@convex/_generated/dataModel";
import { LoadingScreen } from "@/components/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { Screen, Section } from "@/components/ui/screen";
import { useEventData } from "@/hooks/use-event-data";

import { BracketEditor } from "./bracket-editor";

interface Props {
  eventId: Id<"events">;
}

/** Tab "Schema": het vooraf in te vullen knock-outschema van dit toernooi. */
export function BracketTab({ eventId }: Props) {
  const { fixtures, participants, isLoading } = useEventData(eventId);

  const bracketFixture = useMemo(
    () =>
      fixtures?.find((fixture) => fixture.payload.type === "bracket") ?? null,
    [fixtures],
  );

  if (isLoading || !fixtures) {
    return <LoadingScreen />;
  }

  if (!bracketFixture) {
    return (
      <Screen>
        <Section>
          <EmptyState
            icon="trophy"
            title="Nog geen schema"
            description="Voor dit toernooi is (nog) geen knock-outschema om in te vullen."
          />
        </Section>
      </Screen>
    );
  }

  return (
    <BracketEditor
      key={bracketFixture._id}
      fixture={bracketFixture}
      fixtures={fixtures}
      participants={participants}
    />
  );
}

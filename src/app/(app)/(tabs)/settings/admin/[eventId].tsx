import { useMutation, useQuery } from "convex/react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { LoadingScreen } from "@/components/loading-screen";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section } from "@/components/ui/screen";
import { describeFixture, describeValue } from "@/utils/fixture-text";
import { nextEventStatus } from "@/utils/event-status";
import { formatDateTime } from "@/utils/format";
import { buildParticipantMap } from "@/utils/participants";
import { showError } from "@/utils/error-message";

export default function AdminEventScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: Id<"events"> }>();
  const event = useQuery(api.events.get, { eventId });
  const fixtures = useQuery(api.events.fixtures, { eventId });
  const setEventStatus = useMutation(api.admin.setEventStatus);

  const participants = useMemo(
    () => buildParticipantMap(event?.participants ?? []),
    [event?.participants],
  );

  if (event === undefined || fixtures === undefined) {
    return <LoadingScreen />;
  }

  const nextStatus = nextEventStatus(event.status);

  const advance = async () => {
    if (!nextStatus) {
      return;
    }

    try {
      await setEventStatus({ eventId, status: nextStatus });
    } catch (error) {
      showError("Mislukt", error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: event.name }} />
      <Screen>
        <Section title="Status">
          <NavRow
            icon="info.circle"
            title="Huidige status"
            value={event.status}
          />
          {nextStatus ? (
            <NavRow
              icon="arrow.right.circle"
              title={`Zet op "${nextStatus}"`}
              onPress={advance}
            />
          ) : null}
        </Section>

        {event.stages.map((stage) => {
          const stageFixtures = fixtures.filter(
            (fixture) => fixture.stageId === stage._id,
          );

          if (stageFixtures.length === 0) {
            return null;
          }

          return (
            <Section key={stage._id} title={stage.name}>
              {stageFixtures.map((fixture) => (
                <NavRow
                  key={fixture._id}
                  title={describeFixture(
                    fixture.payload,
                    fixture.label,
                    participants,
                  )}
                  subtitle={
                    fixture.result
                      ? describeValue(
                          fixture.result,
                          fixture.payload,
                          participants,
                        )
                      : formatDateTime(fixture.startsAt)
                  }
                  value={fixture.status}
                  onPress={() => router.push(`/result/${fixture._id}`)}
                />
              ))}
            </Section>
          );
        })}
      </Screen>
    </>
  );
}

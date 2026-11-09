import { useMutation, useQuery } from "convex/react";
import { router } from "expo-router";
import { useMemo } from "react";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { ListSkeleton } from "@/components/skeleton/list-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section, SectionFooter } from "@/components/ui/screen";
import { AppText } from "@/components/ui/app-text";
import { describeFixture, describeValue } from "@/utils/fixture-text";
import { nextEventStatus } from "@/utils/event-status";
import { formatDateTime } from "@/utils/format";
import { buildParticipantMap } from "@/utils/participants";
import { showError } from "@/utils/error-message";

interface Props {
  eventId: Id<"events">;
}

/**
 * Uitslagen invoeren per onderdeel. Platformbeheerders zien ook de status
 * van het evenement; bij een eigen wedstrijd van een poule volgt die status
 * vanzelf uit de uitslagen.
 */
export function EventManageScreen({ eventId }: Props) {
  const me = useQuery(api.users.me);
  const event = useQuery(api.events.get, { eventId });
  const fixtures = useQuery(api.events.fixtures, { eventId });
  const setEventStatus = useMutation(api.admin.setEventStatus);

  const participants = useMemo(
    () => buildParticipantMap(event?.participants ?? []),
    [event?.participants],
  );

  if (event === undefined || fixtures === undefined || me === undefined) {
    return <ListSkeleton sections={[2, 5]} leading="none" />;
  }

  if (!event.canManage) {
    return (
      <Screen>
        <Section>
          <EmptyState
            icon="lock"
            title="Geen toegang"
            description="Alleen een beheerder voert hier uitslagen in."
          />
        </Section>
      </Screen>
    );
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

  // De titel ("Uitslagen") komt uit de layout, zodat hij niet na het laden
  // verspringt; de naam van het evenement staat boven de eerste sectie.
  return (
    <>
      <Screen>
        {me?.isAdmin ? (
          <Section title={event.name}>
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
        ) : (
          <Section title={event.name}>
            <SectionFooter>
              <AppText variant="caption">
                Tik een onderdeel om de uitslag in te voeren. De punten van alle
                leden worden daarna direct bijgewerkt.
              </AppText>
            </SectionFooter>
          </Section>
        )}

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

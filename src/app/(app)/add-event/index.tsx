import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";

import type { Id } from "@convex/_generated/dataModel";
import { AppText } from "@/components/ui/app-text";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section, SectionFooter } from "@/components/ui/screen";
import { useAddEventDraft } from "@/hooks/use-add-event-draft";

/**
 * Keuzescherm: een bestaande wedstrijd uit de catalogus toevoegen, of zelf
 * een koers of voetbalwedstrijd maken. Een platformbeheerder komt hier ook
 * om iets nieuws in de catalogus te zetten.
 */
export default function AddEventScreen() {
  const { pouleId, publish } = useLocalSearchParams<{
    pouleId?: Id<"poules">;
    publish?: string;
  }>();
  const { destination, setDestination } = useAddEventDraft();
  const isPublish = publish === "1";

  useEffect(() => {
    setDestination({ pouleId: pouleId ?? null, publish: isPublish });
  }, [pouleId, isPublish, setDestination]);

  return (
    <>
      <Stack.Screen
        options={{
          title: isPublish ? "Nieuw in catalogus" : "Wedstrijd toevoegen",
        }}
      />
      <ModalToolbar />
      <Screen>
        {destination.pouleId ? (
          <Section title="Uit de catalogus">
            <NavRow
              icon="books.vertical"
              title="Kies uit de catalogus"
              subtitle="Toernooien, klassiekers, grote rondes en meer"
              onPress={() => router.push("/add-event/catalog")}
            />
          </Section>
        ) : null}

        <Section title={isPublish ? "Nieuwe wedstrijd" : "Zelf maken"}>
          <NavRow
            icon="bicycle"
            title="Wielerkoers"
            subtitle="Eendagskoers met podium en favorieten"
            onPress={() => router.push("/add-event/race")}
          />
          <NavRow
            icon="soccerball"
            title="Voetbalwedstrijd"
            subtitle="Eén wedstrijd, uitslag voorspellen"
            onPress={() => router.push("/add-event/match")}
          />
          <SectionFooter>
            <AppText variant="caption">
              {isPublish
                ? "Komt in de publieke catalogus; elke poule kan hem kiezen en jij voert de uitslag in."
                : "Alleen zichtbaar in deze poule. Jij voert zelf de uitslag in zodra die bekend is."}
            </AppText>
          </SectionFooter>
        </Section>
      </Screen>
    </>
  );
}

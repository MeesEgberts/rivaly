import { Stack } from "expo-router";

import { AddEventDraftProvider } from "@/components/event/add-event-draft-provider";

/**
 * Eigen stack binnen de "Wedstrijd toevoegen"-modal: kiezen uit de
 * catalogus, of zelf een koers of voetbalwedstrijd maken. De keuzes zijn
 * gedeeld via de draft-provider.
 */
export default function AddEventLayout() {
  return (
    <AddEventDraftProvider>
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
        <Stack.Screen name="index" options={{ title: "Wedstrijd toevoegen" }} />
        <Stack.Screen name="catalog" options={{ title: "Catalogus" }} />
        <Stack.Screen name="race" options={{ title: "Eigen koers" }} />
        <Stack.Screen name="favourites" options={{ title: "Favorieten" }} />
        <Stack.Screen name="match" options={{ title: "Eigen wedstrijd" }} />
      </Stack>
    </AddEventDraftProvider>
  );
}

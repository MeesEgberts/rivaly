import { Stack } from "expo-router";

import { NewPouleDraftProvider } from "@/components/poule/new-poule-draft-provider";

/**
 * Eigen stack binnen de "Nieuwe poule"-modal, zodat het zoekscherm voor
 * wedstrijden in de sheet zelf opent en de keuze gedeeld blijft.
 */
export default function NewPouleLayout() {
  return (
    <NewPouleDraftProvider>
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
        <Stack.Screen name="index" options={{ title: "Nieuwe poule" }} />
        <Stack.Screen name="events" options={{ title: "Wedstrijden" }} />
      </Stack>
    </NewPouleDraftProvider>
  );
}

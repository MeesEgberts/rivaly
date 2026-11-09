import { Stack } from "expo-router";

import { AthleteDraftProvider } from "@/components/athletes/athlete-draft-provider";

/**
 * Eigen stack in de voorspelmodal, zodat het zoekscherm voor atleten in de
 * sheet zelf opent en de keuze gedeeld blijft.
 */
export default function PredictLayout() {
  return (
    <AthleteDraftProvider>
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
        <Stack.Screen name="index" options={{ title: "Voorspellen" }} />
        <Stack.Screen name="athletes" options={{ title: "Zoeken" }} />
      </Stack>
    </AthleteDraftProvider>
  );
}

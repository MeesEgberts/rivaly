import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AthleteDraftProvider } from "@/components/athletes/athlete-draft-provider";

/** Eigen stack in de modal, met de podiumkeuze gedeeld tussen schermen. */
export default function PredictLayout() {
  return (
    // Een native modal heeft een eigen root nodig voor slepen op het podium.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AthleteDraftProvider>
        <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
          <Stack.Screen name="index" options={{ title: "Voorspellen" }} />
          <Stack.Screen name="replace" options={{ title: "Vervang" }} />
        </Stack>
      </AthleteDraftProvider>
    </GestureHandlerRootView>
  );
}

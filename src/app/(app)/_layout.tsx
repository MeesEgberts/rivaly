import { Stack } from "expo-router";

import { AuthGate } from "@/components/auth-gate";

export default function AppLayout() {
  return (
    <AuthGate>
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
        <Stack.Screen
          name="events/[eventId]"
          options={{ title: "Programma" }}
        />
        <Stack.Screen
          name="predict/[fixtureId]"
          options={{ title: "Voorspellen", presentation: "modal" }}
        />
        <Stack.Screen
          name="result/[fixtureId]"
          options={{ title: "Uitslag invoeren", presentation: "modal" }}
        />
      </Stack>
    </AuthGate>
  );
}

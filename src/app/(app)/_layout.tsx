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
        {/* Modals met een eigen stack (zoekscherm voor atleten). */}
        <Stack.Screen
          name="predict/[fixtureId]"
          options={{ presentation: "modal", headerShown: false }}
        />
        <Stack.Screen
          name="result/[fixtureId]"
          options={{ presentation: "modal", headerShown: false }}
        />
      </Stack>
    </AuthGate>
  );
}

import { Stack } from "expo-router";

import { AuthGate } from "@/components/auth-gate";

export default function AppLayout() {
  return (
    <AuthGate>
      <Stack screenOptions={{ headerBackButtonDisplayMode: "minimal" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="account" options={{ headerShown: false }} />
        {/*
          De kop van een evenement loopt onder een doorzichtige balk door.
          Dat staat hier vast, zodat de balk niet verspringt na het laden.
        */}
        <Stack.Screen
          name="events/[eventId]"
          options={{
            title: "",
            headerTransparent: true,
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen
          name="manage/[eventId]"
          options={{ title: "Uitslagen" }}
        />
        <Stack.Screen
          name="add-event"
          options={{ presentation: "modal", headerShown: false }}
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

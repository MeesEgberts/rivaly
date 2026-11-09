import { Stack } from "expo-router";

import { AvatarButton } from "@/components/ui/avatar-button";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Profiel",
          headerLargeTitle: true,
          headerRight: () => <AvatarButton />,
        }}
      />
      <Stack.Screen name="admin/index" options={{ title: "Beheer" }} />
      <Stack.Screen name="admin/[eventId]" options={{ title: "Uitslagen" }} />
    </Stack>
  );
}

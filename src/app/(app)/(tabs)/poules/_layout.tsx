import { router, Stack } from "expo-router";
import { Platform } from "react-native";

export default function PoulesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "Poules", headerLargeTitle: true }}
      >
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button
            icon={Platform.OS === "ios" ? "plus" : undefined}
            accessibilityLabel="Nieuwe poule"
            onPress={() => router.push("/poules/new")}
          >
            Nieuw
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      </Stack.Screen>
      <Stack.Screen
        name="new"
        options={{ title: "Nieuwe poule", presentation: "modal" }}
      />
      <Stack.Screen
        name="join"
        options={{ title: "Meedoen", presentation: "modal" }}
      />
      <Stack.Screen name="[pouleId]" options={{ title: "Poule" }} />
    </Stack>
  );
}

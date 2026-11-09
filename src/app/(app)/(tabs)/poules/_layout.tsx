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
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen
        name="join"
        options={{ title: "Meedoen", presentation: "modal" }}
      />
      {/* De titel komt mee als parameter, dan staat hij er al tijdens de overgang. */}
      <Stack.Screen
        name="[pouleId]/index"
        options={({ route }) => ({
          title: (route.params as { title?: string } | undefined)?.title ?? "",
        })}
      />
      <Stack.Screen
        name="[pouleId]/edit"
        options={{ title: "Bewerk poule", presentation: "modal" }}
      />
      <Stack.Screen
        name="[pouleId]/member/[userId]"
        options={({ route }) => ({
          title: (route.params as { title?: string } | undefined)?.title ?? "",
        })}
      />
    </Stack>
  );
}

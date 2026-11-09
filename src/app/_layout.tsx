import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ConvexClientProvider } from "@/components/convex-client-provider";
import { requireEnv } from "@/utils/env";

const publishableKey = requireEnv(
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "Zet de publishable key van je Clerk-applicatie in .env.local.",
);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <ConvexClientProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </ConvexClientProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}

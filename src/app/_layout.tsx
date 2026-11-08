import { Stack } from "expo-router";

import { ConvexClientProvider } from "@/components/convex-client-provider";

export default function RootLayout() {
  return (
    <ConvexClientProvider>
      <Stack />
    </ConvexClientProvider>
  );
}

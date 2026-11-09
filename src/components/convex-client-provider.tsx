import { useAuth } from "@clerk/expo";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";

import { requireEnv } from "@/utils/env";

const convex = new ConvexReactClient(
  requireEnv(
    process.env.EXPO_PUBLIC_CONVEX_URL,
    "EXPO_PUBLIC_CONVEX_URL",
    "Draai `npx convex dev` om .env.local aan te maken.",
  ),
  { unsavedChangesWarning: false },
);

interface Props {
  children: ReactNode;
}

/** Moet binnen een `ClerkProvider` staan: de Clerk-sessie levert het JWT voor Convex. */
export function ConvexClientProvider({ children }: Props) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

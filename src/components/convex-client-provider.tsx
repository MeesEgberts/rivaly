import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { ReactNode } from "react";

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error(
    "EXPO_PUBLIC_CONVEX_URL is not set. Run `npx convex dev` to create .env.local.",
  );
}

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

interface Props {
  children: ReactNode;
}

export function ConvexClientProvider({ children }: Props) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}

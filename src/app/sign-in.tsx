import { useSession } from "@clerk/expo";
import { AuthView } from "@clerk/expo/native-components";
import { useConvexAuth } from "convex/react";
import { Redirect } from "expo-router";

import { AuthLogo } from "@/components/auth/auth-logo";
import { LoadingScreen } from "@/components/loading-screen";

/**
 * Inloggen en registreren via Clerk's native AuthView (SwiftUI/Compose).
 * Het scherm is niet weg te klikken; zodra Convex de sessie accepteert gaan
 * we door naar de app, waar `AuthGate` het users-document aanmaakt.
 *
 * Doorsturen gebeurt op Convex-auth, net als in `AuthGate`. Kijken we hier
 * naar de Clerk-sessie, dan is er een moment waarop Clerk al actief is en
 * Convex nog niet, en sturen de twee schermen elkaar eindeloos door.
 */
export default function SignInScreen() {
  const { isLoaded } = useSession();
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (!isLoaded || isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect href="/home" />;
  }

  return <AuthView isDismissible={false} logo={<AuthLogo />} />;
}

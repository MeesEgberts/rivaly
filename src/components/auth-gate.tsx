import { Redirect } from "expo-router";
import type { ReactNode } from "react";

import { LoadingScreen } from "@/components/loading-screen";
import { useStoreUser } from "@/hooks/use-store-user";

interface Props {
  children: ReactNode;
}

/** Laat alleen ingelogde gebruikers met een users-document door. */
export function AuthGate({ children }: Props) {
  const { isLoading, isAuthenticated } = useStoreUser();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return children;
}

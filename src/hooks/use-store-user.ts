import { useUser } from "@clerk/expo";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useState } from "react";

import { api } from "@convex/_generated/api";

/**
 * Convex-auth plus het users-document. `isAuthenticated` wordt pas true als
 * het document bestaat, zodat schermen die `requireUser` aanroepen nooit te
 * vroeg renderen. Zie docs.convex.dev/auth/database-auth.
 */
export function useStoreUser() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const storeUser = useMutation(api.users.store);
  const [isStored, setIsStored] = useState(false);

  const name = user?.fullName ?? user?.firstName ?? undefined;
  const imageUrl = user?.hasImage ? user.imageUrl : undefined;

  // Eén keer per login; wisselt de gebruiker, dan begint het opnieuw.
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isCancelled = false;

    storeUser({ name, imageUrl }).then(() => {
      if (!isCancelled) {
        setIsStored(true);
      }
    });

    return () => {
      isCancelled = true;
      setIsStored(false);
    };
    // Naam en foto horen bij de ingelogde gebruiker en hoeven geen herstart te triggeren.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, storeUser, user?.id]);

  return {
    isLoading: isLoading || (isAuthenticated && !isStored),
    isAuthenticated: isAuthenticated && isStored,
  };
}

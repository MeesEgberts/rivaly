import { useClerk } from "@clerk/expo";
import { useQuery } from "convex/react";
import { router } from "expo-router";

import { api } from "@convex/_generated/api";
import { LoadingScreen } from "@/components/loading-screen";
import { DestructiveRow } from "@/components/ui/destructive-row";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section } from "@/components/ui/screen";

export default function ProfileScreen() {
  const me = useQuery(api.users.me);
  const { signOut } = useClerk();

  if (me === undefined) {
    return <LoadingScreen />;
  }

  return (
    <Screen>
      <Section title="Account">
        <NavRow
          icon="person.crop.circle.fill"
          title={me?.name ?? "Speler"}
          subtitle={me?.email ?? undefined}
          onPress={() => router.push("/account")}
        />
      </Section>

      {me?.isAdmin ? (
        <Section title="Platform">
          <NavRow
            icon="wrench.and.screwdriver"
            title="Beheer"
            subtitle="Evenementen en uitslagen"
            onPress={() => router.push("/profile/admin")}
          />
        </Section>
      ) : null}

      <Section>
        <DestructiveRow title="Uitloggen" onPress={() => signOut()} />
      </Section>
    </Screen>
  );
}

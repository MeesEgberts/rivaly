import { useQuery } from "convex/react";
import { router } from "expo-router";

import { api } from "@convex/_generated/api";
import { ListSkeleton } from "@/components/skeleton/list-skeleton";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section } from "@/components/ui/screen";
import { appVersion } from "@/utils/app-version";

/**
 * Instellingen-tab. Het account (naam, foto, uitloggen) zit achter de
 * avatar rechtsboven; hier komen app-voorkeuren zoals later taal en meldingen.
 */
export default function SettingsScreen() {
  const me = useQuery(api.users.me);

  if (me === undefined) {
    return <ListSkeleton sections={[1]} />;
  }

  return (
    <Screen>
      {me?.isAdmin ? (
        <Section title="Platform">
          <NavRow
            icon="wrench.and.screwdriver"
            title="Beheer"
            subtitle="Evenementen en uitslagen"
            onPress={() => router.push("/settings/admin")}
          />
        </Section>
      ) : null}

      <Section title="Over Rivaly">
        <NavRow icon="info.circle" title="Versie" value={appVersion()} />
      </Section>
    </Screen>
  );
}

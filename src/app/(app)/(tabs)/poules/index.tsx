import { useQuery } from "convex/react";
import { router } from "expo-router";

import { api } from "@convex/_generated/api";
import { LoadingScreen } from "@/components/loading-screen";
import { EmptyState } from "@/components/ui/empty-state";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section } from "@/components/ui/screen";
import { ordinal } from "@/utils/format";

/**
 * Tabscherm: geen vaste knoppen onderaan, want op iOS 26 zweeft de tabbalk
 * over de inhoud. Acties staan als rijen in de lijst en als "+" in de
 * navigatiebalk.
 */
export default function PoulesScreen() {
  const poules = useQuery(api.poules.listMine);

  if (poules === undefined) {
    return <LoadingScreen />;
  }

  return (
    <Screen>
      {poules.length === 0 ? (
        <Section>
          <EmptyState
            icon="trophy"
            title="Nog geen poules"
            description="Maak je eerste poule of doe mee met een uitnodigingscode."
          />
        </Section>
      ) : (
        <Section title="Mijn poules">
          {poules.map((poule) => (
            <NavRow
              key={poule._id}
              leadingText={poule.emoji ?? undefined}
              icon={poule.emoji ? undefined : "trophy.fill"}
              title={poule.name}
              subtitle={poule.eventNames.join(" · ") || "Nog geen evenementen"}
              value={
                poule.rank > 0
                  ? `${ordinal(poule.rank)} · ${poule.points} pt`
                  : undefined
              }
              onPress={() => router.push(`/poules/${poule._id}`)}
            />
          ))}
        </Section>
      )}

      <Section>
        <NavRow
          icon="plus.circle.fill"
          title="Nieuwe poule"
          subtitle="Kies wedstrijden en nodig vrienden uit"
          onPress={() => router.push("/poules/new")}
        />
        <NavRow
          icon="person.badge.plus"
          title="Meedoen met code"
          subtitle="Je hebt een uitnodiging gekregen"
          onPress={() => router.push("/poules/join")}
        />
      </Section>
    </Screen>
  );
}

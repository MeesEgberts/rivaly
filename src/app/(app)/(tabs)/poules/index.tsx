import { useQuery } from "convex/react";
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { api } from "@convex/_generated/api";
import { EmptyCard } from "@/components/cards/empty-card";
import { SectionTitle } from "@/components/cards/section-title";
import { LoadingScreen } from "@/components/loading-screen";
import { ActionTile } from "@/components/poule/action-tile";
import { PouleCard } from "@/components/poule/poule-card";
import { useAppColors } from "@/hooks/use-app-colors";

/**
 * Tabscherm: geen vaste knoppen onderaan, want op iOS 26 zweeft de tabbalk
 * over de inhoud. Acties staan als tegels en als "+" in de navigatiebalk.
 */
export default function PoulesScreen() {
  const colors = useAppColors();
  const poules = useQuery(api.poules.listMine);

  if (poules === undefined) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      {poules.length === 0 ? (
        <EmptyCard
          icon="trophy"
          title="Nog geen poules"
          description="Maak je eerste poule of doe mee met een uitnodigingscode."
        />
      ) : (
        poules.map((poule) => <PouleCard key={poule._id} poule={poule} />)
      )}

      <SectionTitle>
        {poules.length === 0 ? "Aan de slag" : "Meer poules"}
      </SectionTitle>
      <View style={styles.actions}>
        <ActionTile
          icon="plus"
          title="Nieuwe poule"
          subtitle="Kies wedstrijden en nodig vrienden uit"
          onPress={() => router.push("/poules/new")}
        />
        <ActionTile
          icon="person.badge.plus"
          title="Meedoen"
          subtitle="Met een code van een vriend"
          onPress={() => router.push("/poules/join")}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 120 },
  actions: { flexDirection: "row", gap: 12 },
});

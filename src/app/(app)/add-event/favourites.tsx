import { useQuery } from "convex/react";
import { Stack } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";

import { api } from "@convex/_generated/api";
import { AthleteAvatar } from "@/components/athletes/athlete-avatar";
import { AthleteRow } from "@/components/athletes/athlete-row";
import { Card } from "@/components/cards/card";
import { CardRow } from "@/components/cards/card-row";
import { EmptyCard } from "@/components/cards/empty-card";
import { useAppColors } from "@/hooks/use-app-colors";
import { useAddEventDraft } from "@/hooks/use-add-event-draft";
import type { AthleteInfo } from "@/types/athlete";
import { tapFeedback } from "@/utils/haptics";

/**
 * Favorieten voor een eigen koers kiezen: zoek renners via de zoekbalk en
 * tik ze aan; gekozen renners staan bovenaan en gaan weg met een tik.
 */
export default function RaceFavouritesScreen() {
  const colors = useAppColors();
  const { favourites, addFavourite, removeFavourite } = useAddEventDraft();
  const [search, setSearch] = useState("");
  const term = search.trim();

  const results = useQuery(
    api.athletes.search,
    term.length > 0 ? { sport: "cycling", query: term } : "skip",
  );

  const candidates = useMemo<AthleteInfo[]>(
    () =>
      (results ?? [])
        .filter(
          (athlete) => !favourites.some((item) => item.id === athlete._id),
        )
        .map((athlete) => ({
          id: athlete._id,
          name: athlete.name,
          shortName: athlete.shortName,
          code: athlete.nation,
          imageUrl: athlete.imageUrl,
        })),
    [results, favourites],
  );

  const add = (athlete: AthleteInfo) => {
    tapFeedback();
    addFavourite(athlete);
  };

  return (
    <>
      <Stack.Screen options={{ title: `Favorieten (${favourites.length})` }} />
      <Stack.SearchBar
        placeholder="Zoek renner of land"
        hideWhenScrolling={false}
        onChangeText={(event) => setSearch(event.nativeEvent.text)}
        onCancelButtonPress={() => setSearch("")}
      />

      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
      >
        {favourites.length > 0 ? (
          <>
            <Text style={[styles.section, { color: colors.secondaryLabel }]}>
              GEKOZEN
            </Text>
            <Card isFlush>
              {favourites.map((athlete, index) => (
                <CardRow
                  key={athlete.id}
                  leading={
                    <AthleteAvatar
                      name={athlete.name}
                      imageUrl={athlete.imageUrl}
                      code={athlete.code}
                      size={36}
                    />
                  }
                  title={athlete.name}
                  subtitle={athlete.code ?? undefined}
                  trailing={
                    <SymbolView
                      name="minus.circle.fill"
                      size={24}
                      tintColor={colors.danger as string}
                    />
                  }
                  onPress={() => removeFavourite(athlete.id)}
                  hideChevron
                  isLast={index === favourites.length - 1}
                />
              ))}
            </Card>
          </>
        ) : null}

        {term.length === 0 ? (
          favourites.length === 0 ? (
            <EmptyCard
              icon="magnifyingglass"
              title="Zoek renners"
              description="Typ een naam of landcode (bijv. NED) in de zoekbalk en tik een renner aan."
            />
          ) : null
        ) : results !== undefined && candidates.length === 0 ? (
          <EmptyCard
            icon="magnifyingglass"
            title="Niets gevonden"
            description={`Geen renners gevonden voor “${term}”.`}
          />
        ) : (
          <>
            <Text style={[styles.section, { color: colors.secondaryLabel }]}>
              RESULTATEN
            </Text>
            <Card isFlush>
              {candidates.map((athlete, index) => (
                <AthleteRow
                  key={athlete.id}
                  athlete={athlete}
                  onPress={() => add(athlete)}
                  isLast={index === candidates.length - 1}
                />
              ))}
            </Card>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  section: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    marginHorizontal: 4,
    marginTop: 8,
  },
});

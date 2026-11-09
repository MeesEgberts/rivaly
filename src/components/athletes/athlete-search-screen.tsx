import { useQuery } from "convex/react";
import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { api } from "@convex/_generated/api";
import { Card } from "@/components/cards/card";
import { EmptyCard } from "@/components/cards/empty-card";
import { SectionTitle } from "@/components/cards/section-title";
import { useAppColors } from "@/hooks/use-app-colors";
import { useAthleteDraft } from "@/hooks/use-athlete-draft";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import type { AthleteInfo } from "@/types/athlete";
import type { FixtureDetail } from "@/types/fixture-detail";
import {
  athleteInfo,
  isAthletePool,
  isOther,
  poolNoun,
  selectableFavourites,
} from "@/utils/athletes";
import { capitalize } from "@/utils/format";

import { AthleteRow } from "./athlete-row";

interface Props {
  fixture: FixtureDetail;
  mode: "prediction" | "result";
}

/**
 * Zoeken in alle atleten van de sport via de native zoekbalk. Zonder
 * zoekterm staan de favorieten er; tik om toe te voegen.
 */
export function AthleteSearchScreen({ fixture, mode }: Props) {
  const colors = useAppColors();
  const draft = useAthleteDraft();
  const participants = useFixtureParticipants(fixture);
  const [search, setSearch] = useState("");
  const payload = fixture.payload;
  const pool = isAthletePool(payload) ? payload.pool : null;
  const term = search.trim();

  const results = useQuery(
    api.athletes.search,
    pool && term.length > 0
      ? { sport: pool.sport, nation: pool.nation, query: term }
      : "skip",
  );

  const athletes = useMemo<AthleteInfo[]>(() => {
    if (!isAthletePool(payload)) {
      return [];
    }

    if (term.length === 0) {
      return selectableFavourites(payload, mode).map((option) =>
        athleteInfo(option.id, draft.known, participants, payload),
      );
    }

    return (results ?? []).map((athlete) => ({
      id: athlete._id,
      name: athlete.name,
      shortName: athlete.shortName,
      code: athlete.nation,
    }));
  }, [payload, mode, term, results, draft.known, participants]);

  if (!isAthletePool(payload)) {
    return null;
  }

  const noun = poolNoun(payload.pool);
  const remaining = draft.size - draft.order.length;

  const choose = (athlete: AthleteInfo) => {
    draft.add(athlete, mode === "result" && isOther(athlete.id));

    // Klaar als er één plek is of de laatste plek nu gevuld is.
    if (draft.size === 1 || remaining <= 1) {
      router.back();
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: capitalize(noun.plural) }} />
      <Stack.SearchBar
        placeholder={`Zoek ${noun.singular} of land`}
        hideWhenScrolling={false}
        onChangeText={(event) => setSearch(event.nativeEvent.text)}
        onCancelButtonPress={() => setSearch("")}
      />
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {term.length > 0 && results !== undefined && athletes.length === 0 ? (
          <EmptyCard
            icon="magnifyingglass"
            title="Niets gevonden"
            description={`Geen ${noun.plural} gevonden voor "${term}".`}
          />
        ) : (
          <>
            <SectionTitle>
              {term.length > 0
                ? "Resultaten"
                : draft.size > 1
                  ? `Favorieten · nog ${remaining} te kiezen`
                  : "Favorieten"}
            </SectionTitle>
            <Card isFlush>
              {athletes.map((athlete, index) => (
                <AthleteRow
                  key={athlete.id}
                  athlete={athlete}
                  isChosen={draft.order.includes(athlete.id)}
                  onPress={() => choose(athlete)}
                  isLast={index === athletes.length - 1}
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
  content: { padding: 16, gap: 12, paddingBottom: 40 },
});

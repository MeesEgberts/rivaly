import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text } from "react-native";

import { Card } from "@/components/cards/card";
import { EmptyCard } from "@/components/cards/empty-card";
import { useAppColors } from "@/hooks/use-app-colors";
import { useAthleteDraft } from "@/hooks/use-athlete-draft";
import { useAthleteOptions } from "@/hooks/use-athlete-options";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import type { AthleteInfo } from "@/types/athlete";
import type { FixtureDetail } from "@/types/fixture-detail";
import {
  athleteInfo,
  isAthletePool,
  poolNoun,
  selectableFavourites,
} from "@/utils/athletes";
import { tapFeedback } from "@/utils/haptics";

import { AthleteRow } from "./athlete-row";

interface Props {
  fixture: FixtureDetail;
  mode: "prediction" | "result";
  /** Plek op het podium die je vervangt, 0 = plek 1. */
  position: number;
}

/**
 * Een renner op het podium vervangen: favorieten, of zoeken in alle
 * renners via de native zoekbalk onderaan. "Haal weg" maakt de plek leeg.
 */
export function AthleteReplaceScreen({ fixture, mode, position }: Props) {
  const colors = useAppColors();
  const draft = useAthleteDraft();
  const participants = useFixtureParticipants(fixture);
  const [search, setSearch] = useState("");
  const payload = fixture.payload;

  const favourites = useMemo(() => {
    if (!isAthletePool(payload)) {
      return [];
    }

    return selectableFavourites(payload, mode).map((option) =>
      athleteInfo(option.id, draft.known, participants, payload),
    );
  }, [payload, mode, draft.known, participants]);

  const pool = isAthletePool(payload) ? payload.pool : { sport: "" };
  const { athletes, isSearching, isLoading } = useAthleteOptions({
    pool,
    favourites,
    search,
    chosen: draft.slots,
  });

  if (!isAthletePool(payload)) {
    return null;
  }

  const occupantId = draft.slots[position];
  const occupant = occupantId
    ? athleteInfo(occupantId, draft.known, participants, payload)
    : null;
  const noun = poolNoun(payload.pool);
  const isRanking = draft.slots.length > 1;

  const choose = (athlete: AthleteInfo) => {
    tapFeedback();
    draft.replaceAt(position, athlete);
    router.back();
  };

  const clear = () => {
    draft.clear(position);
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: occupant ? `Vervang ${occupant.shortName}` : "Kies renner",
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={Platform.OS === "ios" ? "trash" : undefined}
          accessibilityLabel="Haal weg"
          onPress={clear}
        >
          Haal weg
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
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
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
      >
        {isSearching && !isLoading && athletes.length === 0 ? (
          <EmptyCard
            icon="magnifyingglass"
            title="Niets gevonden"
            description={`Geen ${noun.plural} gevonden voor “${search.trim()}”.`}
          />
        ) : (
          <>
            <Text style={[styles.section, { color: colors.secondaryLabel }]}>
              {isSearching ? "RESULTATEN" : "FAVORIETEN"}
            </Text>
            <Card isFlush>
              {athletes.map((athlete, index) => (
                <AthleteRow
                  key={athlete.id}
                  athlete={athlete}
                  place={{
                    text: isRanking ? `Plek ${position + 1}` : "Kies",
                    isChosen: false,
                  }}
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
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  section: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    marginHorizontal: 4,
  },
});

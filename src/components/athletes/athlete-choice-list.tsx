import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { useAppColors } from "@/hooks/use-app-colors";
import { useAthleteOptions } from "@/hooks/use-athlete-options";
import type { AthleteInfo } from "@/types/athlete";
import { choiceHint, type Slots } from "@/utils/athletes";

import { AthleteRow } from "./athlete-row";
import { AthleteSearchField } from "./athlete-search-field";

interface Props {
  pool: { sport: string; nation?: string };
  noun: { singular: string; plural: string };
  favourites: AthleteInfo[];
  slots: Slots;
  active: number | null;
  infoOf: (id: string) => AthleteInfo;
  onPlace: (athlete: AthleteInfo) => void;
}

/**
 * Eén lijst onder het podium: zoeken bovenaan, daaronder favorieten of
 * zoekresultaten. Tik een renner en hij komt op de blauwe plek.
 */
export function AthleteChoiceList({
  pool,
  noun,
  favourites,
  slots,
  active,
  infoOf,
  onPlace,
}: Props) {
  const colors = useAppColors();
  const [search, setSearch] = useState("");
  const { athletes, isSearching, isLoading } = useAthleteOptions({
    pool,
    favourites,
    search,
    chosen: slots,
  });

  const hint = choiceHint(slots, active, (id) => infoOf(id).shortName);
  const target =
    active === null ? null : slots.length > 1 ? `Plek ${active + 1}` : "Kies";

  const place = (athlete: AthleteInfo) => {
    onPlace(athlete);
    setSearch("");
  };

  return (
    <Card isFlush>
      <View style={styles.top}>
        <View style={styles.hintRow}>
          {active === null ? (
            <SymbolView
              name="checkmark.circle.fill"
              size={22}
              tintColor={colors.success as string}
            />
          ) : null}
          <Text
            style={[
              active === null ? styles.done : styles.hint,
              { color: active === null ? colors.secondaryLabel : colors.label },
            ]}
          >
            {hint}
          </Text>
        </View>
        {active !== null ? (
          <AthleteSearchField
            value={search}
            onChange={setSearch}
            placeholder={`Zoek in alle ${noun.plural}`}
          />
        ) : null}
      </View>

      {active !== null ? (
        <>
          <Text style={[styles.section, { color: colors.secondaryLabel }]}>
            {isSearching ? "RESULTATEN" : "FAVORIETEN"}
          </Text>
          {athletes.map((athlete, index) => (
            <AthleteRow
              key={athlete.id}
              athlete={athlete}
              place={target ? { text: target, isChosen: false } : null}
              onPress={() => place(athlete)}
              isLast={index === athletes.length - 1}
            />
          ))}
          {isSearching && !isLoading && athletes.length === 0 ? (
            <Text style={[styles.empty, { color: colors.secondaryLabel }]}>
              Geen {noun.plural} gevonden voor “{search.trim()}”.
            </Text>
          ) : null}
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { padding: 14, gap: 12 },
  hintRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  hint: { flex: 1, fontSize: 17, fontWeight: "700" },
  done: { flex: 1, fontSize: 15, lineHeight: 20 },
  section: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  empty: { fontSize: 15, padding: 14 },
});

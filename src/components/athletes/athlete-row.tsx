import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { CardRow } from "@/components/cards/card-row";
import { SymbolBadge } from "@/components/cards/symbol-badge";
import { TeamBadge } from "@/components/match/team-badge";
import { useAppColors } from "@/hooks/use-app-colors";
import type { AthleteInfo } from "@/types/athlete";

interface Props {
  athlete: AthleteInfo;
  /**
   * Rechts: "Plek 2" in groen als hij gekozen is, "+ Plek 3" in blauw als
   * hij daar terechtkomt, of niets als alle plekken vol zijn.
   */
  place: { text: string; isChosen: boolean } | null;
  onPress: () => void;
  isLast?: boolean;
}

/** Eén atleet in een lijst: landcode, naam en waar hij terechtkomt. */
export function AthleteRow({ athlete, place, onPress, isLast }: Props) {
  const colors = useAppColors();
  const tint = place?.isChosen ? colors.success : colors.accent;

  return (
    <CardRow
      leading={
        athlete.code ? (
          <TeamBadge code={athlete.code} />
        ) : (
          <SymbolBadge name="person.fill" size={28} />
        )
      }
      title={athlete.name}
      isHighlighted={place?.isChosen ?? false}
      trailing={
        place ? (
          <View style={[styles.place, { borderColor: tint }]}>
            <SymbolView
              name={place.isChosen ? "checkmark" : "plus"}
              size={11}
              tintColor={tint as string}
            />
            <Text style={[styles.placeText, { color: tint }]}>
              {place.text}
            </Text>
          </View>
        ) : undefined
      }
      onPress={onPress}
      isLast={isLast}
      hideChevron
    />
  );
}

const styles = StyleSheet.create({
  place: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  placeText: { fontSize: 13, fontWeight: "700", fontVariant: ["tabular-nums"] },
});

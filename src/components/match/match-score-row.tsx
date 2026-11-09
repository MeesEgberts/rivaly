import { StyleSheet, Text, View } from "react-native";

import { useScoreEntry } from "@/hooks/use-score-entry";
import { sameCell } from "@/utils/score-entry-cells";
import { useAppColors } from "@/hooks/use-app-colors";
import type { MatchRowData } from "@/utils/match-rows";

import { MatchRowCaption } from "./match-row-caption";
import { ScoreBox } from "./score-box";

interface Props {
  match: MatchRowData;
  /** Laatste rij in een kaart: geen scheidingslijn eronder. */
  isLast?: boolean;
}

/**
 * Eén wedstrijd met twee scorevakken. Open wedstrijden vul je in via het
 * cijferblok van de omliggende ScoreEntryScrollView; gesloten wedstrijden
 * tonen je voorspelling en de uitslag.
 */
export function MatchScoreRow({ match, isLast }: Props) {
  const colors = useAppColors();
  const entry = useScoreEntry();

  const value = match.isLocked
    ? {
        home: match.prediction?.home ?? null,
        away: match.prediction?.away ?? null,
      }
    : entry.valueOf(match.fixtureId);

  const homeCell = { fixtureId: match.fixtureId, side: "home" as const };
  const awayCell = { fixtureId: match.fixtureId, side: "away" as const };
  const isHomeActive = sameCell(entry.activeCell, homeCell);
  const isAwayActive = sameCell(entry.activeCell, awayCell);
  const isRowActive = isHomeActive || isAwayActive;

  const isSaved =
    match.prediction !== null &&
    value.home === match.prediction.home &&
    value.away === match.prediction.away;

  const selectHome = match.isLocked
    ? undefined
    : () => entry.selectCell(homeCell);
  const selectAway = match.isLocked
    ? undefined
    : () => entry.selectCell(awayCell);

  return (
    <View
      ref={(view) => entry.registerRow(match.fixtureId, view)}
      style={[
        styles.row,
        !isLast && {
          borderBottomColor: colors.separator,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View style={styles.teams}>
        <Text
          numberOfLines={2}
          style={[
            styles.team,
            styles.home,
            { color: colors.label },
            isRowActive && styles.teamActive,
          ]}
        >
          {match.home.name}
        </Text>

        <View style={styles.scores}>
          <ScoreBox
            value={value.home}
            isActive={isHomeActive}
            onPress={selectHome}
            accessibilityLabel={`Doelpunten ${match.home.name}`}
          />
          <Text style={[styles.dash, { color: colors.tertiaryLabel }]}>–</Text>
          <ScoreBox
            value={value.away}
            isActive={isAwayActive}
            onPress={selectAway}
            accessibilityLabel={`Doelpunten ${match.away.name}`}
          />
        </View>

        <Text
          numberOfLines={2}
          style={[
            styles.team,
            { color: colors.label },
            isRowActive && styles.teamActive,
          ]}
        >
          {match.away.name}
        </Text>
      </View>

      <MatchRowCaption
        match={match}
        isSaving={entry.isSaving(match.fixtureId)}
        isSaved={isSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 10, paddingHorizontal: 12, gap: 4 },
  teams: { flexDirection: "row", alignItems: "center", gap: 10 },
  team: { flex: 1, fontSize: 15 },
  home: { textAlign: "right" },
  teamActive: { fontWeight: "600" },
  scores: { flexDirection: "row", alignItems: "center", gap: 6 },
  dash: { fontSize: 16 },
});

import { StyleSheet, Text, View } from "react-native";

import { useScoreEntry } from "@/hooks/use-score-entry";
import { sameCell } from "@/utils/score-entry-cells";
import { useAppColors } from "@/hooks/use-app-colors";
import type { MatchRowData } from "@/utils/match-rows";

import { MatchRowCaption } from "./match-row-caption";
import { MatchTeamSide } from "./match-team-side";
import { ScoreBox } from "./score-box";

interface Props {
  match: MatchRowData;
  /** Laatste rij in een kaart: geen scheidingslijn eronder. */
  isLast?: boolean;
}

/**
 * Eén wedstrijd als scorebord: landcode en naam aan weerszijden, twee
 * scorevakken in het midden. Open wedstrijden vul je in via het
 * cijferblok van de omliggende ScoreEntryScrollView; gesloten wedstrijden
 * tonen je voorspelling en de uitslag.
 */
export function MatchScoreRow({ match, isLast }: Props) {
  const colors = useAppColors();
  const entry = useScoreEntry();

  // Gespeeld: de uitslag in het scorebord. Gesloten: jouw voorspelling.
  const value = match.result
    ? match.result
    : match.isLocked
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
        <MatchTeamSide team={match.home} isActive={isRowActive} />

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

        <MatchTeamSide team={match.away} isActive={isRowActive} />
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
  row: { paddingVertical: 12, paddingHorizontal: 12, gap: 8 },
  teams: { flexDirection: "row", alignItems: "center", gap: 8 },
  scores: { flexDirection: "row", alignItems: "center", gap: 6 },
  dash: { fontSize: 16 },
});

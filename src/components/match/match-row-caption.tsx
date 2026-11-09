import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { Chip } from "@/components/cards/chip";
import { RESULT_COLORS } from "@/constants/result-colors";
import { useAppColors } from "@/hooks/use-app-colors";
import { useNow } from "@/hooks/use-now";
import { formatKickoff } from "@/utils/format";
import type { MatchRowData } from "@/utils/match-rows";
import { formatTimeLeft } from "@/utils/prediction-cards";
import { predictionOutcome } from "@/utils/score-outcome";

import { OUTCOME_LABEL } from "@/constants/outcome-labels";

interface Props {
  match: MatchRowData;
  isSaving: boolean;
  isSaved: boolean;
}

/**
 * Regel onder een wedstrijd. Open: aftrap, hoe lang nog en of je voorspelling
 * is opgeslagen. Gesloten: een slotje. Gespeeld: de uitslag en hoe jij het deed.
 */
export function MatchRowCaption({ match, isSaving, isSaved }: Props) {
  const colors = useAppColors();
  const now = useNow();

  if (match.result) {
    const outcome = predictionOutcome(match.prediction, match.result);
    const outcomeTint =
      outcome === "exact"
        ? RESULT_COLORS.exact
        : outcome === "outcome"
          ? RESULT_COLORS.partial
          : colors.secondaryLabel;

    return (
      <View style={styles.chips}>
        {match.status === "live" ? (
          <Chip text="Live" tint={colors.danger} />
        ) : null}
        {match.prediction && outcome ? (
          <Chip
            text={`Jij ${match.prediction.home}–${match.prediction.away} · ${capitalize(OUTCOME_LABEL[outcome])}`}
            tint={outcomeTint}
          />
        ) : (
          <Chip text="Niet voorspeld" />
        )}
      </View>
    );
  }

  if (match.isLocked) {
    return (
      <View style={styles.line}>
        <SymbolView
          name="lock.fill"
          size={10}
          tintColor={colors.tertiaryLabel as string}
        />
        <Text style={[styles.caption, { color: colors.tertiaryLabel }]}>
          {match.prediction ? "Gesloten" : "Gesloten · niet voorspeld"}
        </Text>
      </View>
    );
  }

  const saveStatus = isSaving ? "opslaan…" : isSaved ? "✓ opgeslagen" : null;

  return (
    <View style={styles.line}>
      <Text style={[styles.caption, { color: colors.tertiaryLabel }]}>
        {formatKickoff(match.startsAt)} · {formatTimeLeft(match.startsAt, now)}
      </Text>
      {saveStatus ? (
        <Text
          style={[
            styles.caption,
            styles.saved,
            { color: isSaving ? colors.tertiaryLabel : colors.success },
          ]}
        >
          {saveStatus}
        </Text>
      ) : null}
    </View>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 2,
  },
  line: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  caption: { fontSize: 12, fontVariant: ["tabular-nums"] },
  saved: { fontWeight: "600" },
});

import { StyleSheet, Text } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { formatKickoff } from "@/utils/format";
import type { MatchRowData } from "@/utils/match-rows";
import { predictionOutcome } from "@/utils/score-outcome";

import { OUTCOME_LABEL } from "@/constants/outcome-labels";

interface Props {
  match: MatchRowData;
  isSaving: boolean;
  isSaved: boolean;
}

/** Regel onder een wedstrijd: aftraptijd en opslagstatus, of de uitslag. */
export function MatchRowCaption({ match, isSaving, isSaved }: Props) {
  const colors = useAppColors();

  const outcome = predictionOutcome(match.prediction, match.result);

  if (match.result) {
    const score = `${match.result.home}–${match.result.away}`;
    const prefix = match.status === "live" ? "Live" : "Uitslag";
    const outcomeColor =
      outcome === "wrong" || outcome === null
        ? colors.secondaryLabel
        : colors.success;
    const outcomeText = outcome
      ? ` · ${OUTCOME_LABEL[outcome]}`
      : " · niet voorspeld";

    return (
      <Text style={[styles.caption, { color: outcomeColor }]}>
        {prefix} {score}
        {outcomeText}
      </Text>
    );
  }

  if (match.isLocked) {
    const text = match.prediction ? "Gesloten" : "Gesloten · niet voorspeld";

    return (
      <Text style={[styles.caption, { color: colors.secondaryLabel }]}>
        {text}
      </Text>
    );
  }

  let status = "";

  if (isSaving) {
    status = " · opslaan…";
  } else if (isSaved) {
    status = " · ✓ opgeslagen";
  }

  return (
    <Text style={[styles.caption, { color: colors.tertiaryLabel }]}>
      {formatKickoff(match.startsAt)}
      <Text
        style={{
          color: isSaved && !isSaving ? colors.success : colors.tertiaryLabel,
        }}
      >
        {status}
      </Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: 12, textAlign: "center" },
});

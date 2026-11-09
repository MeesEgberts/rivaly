import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { QuickScoreChips } from "@/components/match/quick-score-chips";
import { ScoreStepperColumn } from "@/components/match/score-stepper-column";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { useAppColors } from "@/hooks/use-app-colors";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import { useNow } from "@/hooks/use-now";
import { useSavePrediction } from "@/hooks/use-save-prediction";
import type { FixtureDetail } from "@/types/fixture-detail";
import { formatDateTime } from "@/utils/format";
import { tapFeedback } from "@/utils/haptics";
import { isFixtureOpen } from "@/utils/match-rows";
import { participantInfo, UNKNOWN_PARTICIPANT } from "@/utils/participants";
import { describeToto } from "@/utils/score-outcome";

import { PoulePredictionsCard } from "./poule-predictions-card";
import { ScorePredictResult } from "./score-predict-result";

interface Props {
  fixture: FixtureDetail;
}

const MAX_GOALS = 20;

/** Eén wedstrijd voorspellen met een grote kaart, − en + en snelkeuzes. */
export function ScorePredictView({ fixture }: Props) {
  const colors = useAppColors();
  const now = useNow();
  const participants = useFixtureParticipants(fixture);
  const { submit, isSaving } = useSavePrediction(fixture._id);

  const saved =
    fixture.myPrediction?.type === "score" ? fixture.myPrediction : null;
  const [home, setHome] = useState<number | null>(saved?.home ?? null);
  const [away, setAway] = useState<number | null>(saved?.away ?? null);

  if (fixture.payload.type !== "score") {
    return null;
  }

  const homeTeam =
    participantInfo(participants, fixture.payload.homeId) ??
    UNKNOWN_PARTICIPANT;
  const awayTeam =
    participantInfo(participants, fixture.payload.awayId) ??
    UNKNOWN_PARTICIPANT;
  const isOpen = isFixtureOpen(fixture, now);
  const isComplete = home !== null && away !== null;
  const isForbiddenDraw =
    isComplete && !fixture.payload.allowDraw && home === away;
  const context = [fixture.stageName, formatDateTime(fixture.startsAt)]
    .filter(Boolean)
    .join(" · ");

  const change = (side: "home" | "away", delta: number) => {
    tapFeedback();

    const current = side === "home" ? home : away;
    const fallback = delta > 0 ? 0 : 1;
    const next = Math.min(
      Math.max((current ?? fallback) + delta, 0),
      MAX_GOALS,
    );

    if (side === "home") {
      setHome(next);
      setAway((value) => value ?? 0);
    } else {
      setAway(next);
      setHome((value) => value ?? 0);
    }
  };

  const chooseQuickScore = (chipHome: number, chipAway: number) => {
    tapFeedback();
    setHome(chipHome);
    setAway(chipAway);
  };

  const handleConfirm = () => {
    if (isComplete) {
      submit({ type: "score", home, away });
    }
  };

  let summary = "Tik + of kies hieronder een uitslag";

  if (isForbiddenDraw) {
    summary = "Een knock-outwedstrijd kan niet gelijk eindigen";
  } else if (isComplete) {
    summary = describeToto({ home, away }, homeTeam.name, awayTeam.name);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.context, { color: colors.secondaryLabel }]}>
          {fixture.eventName}
          {context ? `\n${context}` : ""}
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.teams}>
            <ScoreStepperColumn
              team={homeTeam}
              value={home}
              onIncrement={isOpen ? () => change("home", 1) : undefined}
              onDecrement={isOpen ? () => change("home", -1) : undefined}
            />
            <ScoreStepperColumn
              team={awayTeam}
              value={away}
              onIncrement={isOpen ? () => change("away", 1) : undefined}
              onDecrement={isOpen ? () => change("away", -1) : undefined}
            />
          </View>
          {isOpen ? (
            <Text
              style={[
                styles.summary,
                {
                  color: isForbiddenDraw
                    ? colors.danger
                    : colors.secondaryLabel,
                },
              ]}
            >
              {summary}
            </Text>
          ) : null}
        </View>

        {isOpen ? (
          <>
            <Text
              style={[styles.sectionTitle, { color: colors.secondaryLabel }]}
            >
              Snel kiezen
            </Text>
            <QuickScoreChips
              home={home}
              away={away}
              onSelect={chooseQuickScore}
            />
            <Text style={[styles.deadline, { color: colors.tertiaryLabel }]}>
              Aanpassen kan tot de aftrap ({formatDateTime(fixture.locksAt)}).
            </Text>
          </>
        ) : (
          <ScorePredictResult fixture={fixture} />
        )}
        <PoulePredictionsCard fixture={fixture} />
      </ScrollView>

      <ModalToolbar
        onConfirm={isOpen ? handleConfirm : undefined}
        isConfirmDisabled={!isComplete || isForbiddenDraw || isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  context: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  card: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 8,
    gap: 16,
  },
  teams: { flexDirection: "row" },
  summary: { fontSize: 15, textAlign: "center" },
  sectionTitle: { fontSize: 13, textAlign: "center", marginTop: 4 },
  deadline: { fontSize: 12, textAlign: "center" },
});

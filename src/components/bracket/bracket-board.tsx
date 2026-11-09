import { useEffect, useMemo, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  type ScrollViewInstance,
} from "react-native";

import type {
  BracketPayload,
  BracketValue,
} from "@modules/fixture-types/bracket";
import {
  championOf,
  resolveBracket,
  teamsInRound,
  type ResolvedRound,
} from "@modules/fixture-types/bracket-tree";
import { useAppColors } from "@/hooks/use-app-colors";
import type { ParticipantMap } from "@/utils/participants";

import { BracketChampionColumn } from "./bracket-champion-column";
import { BracketConnector } from "./bracket-connector";
import {
  CONNECTOR_WIDTH,
  ROUND_HEADER_HEIGHT,
  boardHeight,
  columnWidth,
  matchTop,
} from "@/utils/bracket-layout";
import { matchLabels } from "@/utils/bracket-labels";
import { BracketMatchCard } from "./bracket-match-card";
import { firstOpenRound } from "@/utils/bracket-rounds";

interface Props {
  payload: BracketPayload;
  value: BracketValue;
  participants: ParticipantMap;
  /** De echte bracket, om goede en foute keuzes te markeren. */
  actual: BracketValue | null;
  /** Zonder `onPick` is de bracket alleen-lezen. */
  onPick?: (matchId: string, teamId: string) => void;
}

/**
 * Het toernooischema als klassieke bracket: rondes als kolommen die je
 * horizontaal doorswipet. Is een ronde helemaal gekozen, dan schuift de
 * bracket vanzelf door naar de volgende.
 */
export function BracketBoard({
  payload,
  value,
  participants,
  actual,
  onPick,
}: Props) {
  const colors = useAppColors();
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef = useRef<ScrollViewInstance>(null);

  const resolved = useMemo(
    () => resolveBracket(payload, value),
    [payload, value],
  );
  const actualResolved = useMemo<ResolvedRound[] | null>(
    () => (actual ? resolveBracket(payload, actual) : null),
    [payload, actual],
  );
  const labels = useMemo(() => matchLabels(payload), [payload]);

  const column = columnWidth(screenWidth);
  const step = column + CONNECTOR_WIDTH;
  const height = boardHeight(payload.rounds[0]?.matches.length ?? 1);
  const champion = championOf(resolved);
  const openRound = firstOpenRound(resolved);

  // Ronde afgerond, of keuzes gewist door een wijziging eerder in het
  // schema: schuif naar de eerste ronde waar nog iets te kiezen is.
  const previousOpenRound = useRef(openRound);

  useEffect(() => {
    const changed = openRound !== previousOpenRound.current;
    previousOpenRound.current = openRound;

    if (!changed || !onPick) {
      return;
    }

    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({
        x: openRound * step,
        animated: true,
      });
    }, 250);

    return () => clearTimeout(timeout);
  }, [openRound, step, onPick]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToInterval={step}
      decelerationRate="fast"
      contentContainerStyle={styles.content}
    >
      {resolved.map((round, roundIndex) => {
        const actualTeams = actualResolved
          ? teamsInRound(actualResolved, roundIndex)
          : null;

        return (
          <View key={round.key} style={styles.roundWithConnector}>
            <View style={{ width: column }}>
              <Text
                style={[styles.roundName, { color: colors.secondaryLabel }]}
              >
                {round.name}
              </Text>
              <View style={{ height }}>
                {round.matches.map((match, matchIndex) => (
                  <BracketMatchCard
                    key={match.id}
                    match={match}
                    participants={participants}
                    labels={labels}
                    actualTeams={actualTeams}
                    top={matchTop(roundIndex, matchIndex)}
                    width={column}
                    onPick={
                      onPick ? (teamId) => onPick(match.id, teamId) : undefined
                    }
                  />
                ))}
              </View>
            </View>

            <View style={{ marginTop: ROUND_HEADER_HEIGHT }}>
              <BracketConnector
                round={round}
                roundIndex={roundIndex}
                height={height}
              />
            </View>
          </View>
        );
      })}

      <BracketChampionColumn
        champion={champion}
        participants={participants}
        roundIndex={resolved.length}
        width={column}
        height={height}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 8 },
  roundWithConnector: { flexDirection: "row" },
  roundName: {
    height: ROUND_HEADER_HEIGHT,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
});

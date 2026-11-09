import { useMemo, useRef, useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import type { Id } from "@convex/_generated/dataModel";
import { footballStageKinds } from "@modules/football/module";
import { LoadingScreen } from "@/components/loading-screen";
import { useAppColors } from "@/hooks/use-app-colors";
import { useEventData } from "@/hooks/use-event-data";
import { useNow } from "@/hooks/use-now";
import { ScoreEntryScrollView } from "@/components/score-entry/score-entry-scroll-view";
import { tapFeedback } from "@/utils/haptics";
import { toEditableMatches, toMatchRows } from "@/utils/match-rows";

import { defaultMatchdayIndex } from "@/utils/matchdays";
import { MatchdayPage } from "./matchday-page";
import { MatchdayStrip } from "./matchday-strip";
import { shortRoundName, type MatchdayRound } from "@/utils/matchday-rounds";

interface Props {
  eventId: Id<"events">;
}

/**
 * Competitie: onder de kop een strip met alle speelrondes, en de rondes zelf
 * als pagina's waar je horizontaal doorheen swipet. Het cijferblok loopt
 * door de wedstrijden van de ronde die in beeld is.
 */
export function MatchdayTab({ eventId }: Props) {
  const colors = useAppColors();
  const now = useNow();
  const { width } = useWindowDimensions();
  const { event, fixtures, participants, isLoading } = useEventData(eventId);
  const pagerRef = useRef<FlatList<MatchdayRound>>(null);

  const rounds = useMemo<MatchdayRound[]>(() => {
    if (!event || !fixtures) {
      return [];
    }

    return event.stages
      .filter((stage) => stage.kind === footballStageKinds.matchday)
      .map((stage) => ({
        stageId: stage._id,
        name: stage.name,
        shortName: shortRoundName(stage.name),
        matches: toMatchRows(
          fixtures.filter((fixture) => fixture.stageId === stage._id),
          participants,
          now,
        ),
      }));
  }, [event, fixtures, participants, now]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const index = selectedIndex ?? defaultMatchdayIndex(rounds);

  const editable = useMemo(
    () => toEditableMatches(rounds[index]?.matches ?? []),
    [rounds, index],
  );

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (rounds.length === 0) {
    return null;
  }

  const selectRound = (next: number) => {
    tapFeedback();
    setSelectedIndex(next);
    pagerRef.current?.scrollToIndex({ index: next, animated: true });
  };

  const handleSwipeEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);

    if (next !== index) {
      setSelectedIndex(next);
    }
  };

  return (
    <ScoreEntryScrollView matches={editable}>
      {/* Eén speelronde (bijv. een losse eigen wedstrijd): geen strip nodig. */}
      {rounds.length > 1 ? (
        <>
          <MatchdayStrip
            rounds={rounds}
            selectedIndex={index}
            onSelect={selectRound}
          />
          <View
            style={[styles.divider, { backgroundColor: colors.separator }]}
          />
        </>
      ) : null}
      <FlatList
        ref={pagerRef}
        data={rounds}
        keyExtractor={(round) => round.stageId}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={index}
        getItemLayout={(_, itemIndex) => ({
          length: width,
          offset: width * itemIndex,
          index: itemIndex,
        })}
        onMomentumScrollEnd={handleSwipeEnd}
        windowSize={3}
        renderItem={({ item }) => <MatchdayPage round={item} width={width} />}
      />
    </ScoreEntryScrollView>
  );
}

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth },
});

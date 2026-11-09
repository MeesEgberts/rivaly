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
import { cyclingStageKinds } from "@modules/cycling/module";
import { LoadingScreen } from "@/components/loading-screen";
import { useAppColors } from "@/hooks/use-app-colors";
import { useEventData } from "@/hooks/use-event-data";
import { useNow } from "@/hooks/use-now";
import {
  defaultStageIndex,
  toCyclingStages,
  type CyclingStage,
} from "@/utils/cycling";
import { fixturesOfKind } from "@/utils/prediction-cards";
import { tapFeedback } from "@/utils/haptics";

import { StagePage } from "./stage-page";
import { StageStrip } from "./stage-strip";

interface Props {
  eventId: Id<"events">;
}

/**
 * Etappes van een ronde: strip met alle ritten bovenaan, daaronder per
 * etappe een pagina waar je horizontaal doorheen swipet.
 */
export function StagesTab({ eventId }: Props) {
  const colors = useAppColors();
  const now = useNow();
  const { width } = useWindowDimensions();
  const { event, fixtures, participants, isLoading } = useEventData(eventId);
  const pagerRef = useRef<FlatList<CyclingStage>>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const stages = useMemo(() => {
    if (!event || !fixtures) {
      return [];
    }

    return toCyclingStages(
      fixturesOfKind(event.stages, fixtures, cyclingStageKinds.stages),
      now,
    );
  }, [event, fixtures, now]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (stages.length === 0) {
    return null;
  }

  const index = selectedIndex ?? defaultStageIndex(stages);

  const selectStage = (next: number) => {
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StageStrip
        stages={stages}
        selectedIndex={index}
        onSelect={selectStage}
      />
      <FlatList
        ref={pagerRef}
        data={stages}
        keyExtractor={(stage) => stage.fixture._id}
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
        renderItem={({ item }) => (
          <StagePage
            stage={item}
            width={width}
            participants={participants}
            now={now}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

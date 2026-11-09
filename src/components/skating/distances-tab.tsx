import { useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";

import type { Id } from "@convex/_generated/dataModel";
import { skatingStageKinds } from "@modules/skating/module";
import { EventBodySkeleton } from "@/components/skeleton/event-body-skeleton";
import { useAppColors } from "@/hooks/use-app-colors";
import { useEventData } from "@/hooks/use-event-data";
import { useEventScroll } from "@/hooks/use-event-scroll";
import { useNow } from "@/hooks/use-now";
import { tapFeedback } from "@/utils/haptics";
import { fixturesOfKind } from "@/utils/prediction-cards";
import {
  defaultDistanceIndex,
  toSkatingDistances,
  type SkatingDistance,
} from "@/utils/skating";

import { DistancePage } from "./distance-page";
import { DistanceStrip } from "./distance-strip";

interface Props {
  eventId: Id<"events">;
}

/**
 * Afstanden van een schaats- of shorttracktoernooi: onder de kop een strip
 * met alle afstanden, daaronder per afstand een pagina met je podium waar je
 * horizontaal doorheen swipet.
 */
export function DistancesTab({ eventId }: Props) {
  const colors = useAppColors();
  const now = useNow();
  const { width } = useWindowDimensions();
  const { event, fixtures, participants, isLoading } = useEventData(eventId);
  const { header, scrollRef, scrollProps } = useEventScroll();
  const pagerRef = useRef<FlatList<SkatingDistance>>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const distances = useMemo(() => {
    if (!event || !fixtures) {
      return [];
    }

    return toSkatingDistances(
      fixturesOfKind(event.stages, fixtures, skatingStageKinds.distances),
      event.moduleKey,
      now,
    );
  }, [event, fixtures, now]);

  const index = selectedIndex ?? defaultDistanceIndex(distances);

  const select = (next: number) => {
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
    <Animated.ScrollView
      ref={scrollRef}
      {...scrollProps}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
    >
      {header}
      {isLoading ? (
        <EventBodySkeleton showTabs={false} />
      ) : distances.length > 0 ? (
        <>
          <DistanceStrip
            distances={distances}
            selectedIndex={index}
            onSelect={select}
          />
          <FlatList
            ref={pagerRef}
            data={distances}
            keyExtractor={(distance) => distance.fixture._id}
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
              <DistancePage
                distance={item}
                sport={event?.moduleKey ?? "speedskating"}
                width={width}
                participants={participants}
                now={now}
              />
            )}
          />
        </>
      ) : null}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 120 },
});

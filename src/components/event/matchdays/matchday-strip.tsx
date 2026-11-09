import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, type ScrollViewInstance } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

import { MatchdayStripChip, STRIP_CHIP_WIDTH } from "./matchday-strip-chip";
import { roundStatus, type MatchdayRound } from "@/utils/matchday-rounds";

interface Props {
  rounds: MatchdayRound[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const GAP = 8;
const PADDING = 16;

/**
 * Strip met alle speelrondes. De gekozen ronde staat in het midden; een
 * stip betekent dat er nog iets in te vullen is, een vinkje dat alles klaar is.
 */
export function MatchdayStrip({ rounds, selectedIndex, onSelect }: Props) {
  const colors = useAppColors();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  // Houd de gekozen ronde in het midden, zodra we weten hoe breed de strip is.
  useEffect(() => {
    if (viewportWidth === 0) {
      return;
    }

    const chipCenter =
      PADDING + selectedIndex * (STRIP_CHIP_WIDTH + GAP) + STRIP_CHIP_WIDTH / 2;
    const x = Math.max(0, chipCenter - viewportWidth / 2);

    scrollRef.current?.scrollTo({ x, animated: true });
  }, [selectedIndex, viewportWidth]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
      style={{ backgroundColor: colors.background, flexGrow: 0 }}
      contentContainerStyle={styles.content}
    >
      {rounds.map((round, index) => (
        <MatchdayStripChip
          key={round.stageId}
          label={round.shortName}
          status={roundStatus(round)}
          isSelected={index === selectedIndex}
          onPress={() => onSelect(index)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: PADDING, paddingVertical: 8, gap: GAP },
});

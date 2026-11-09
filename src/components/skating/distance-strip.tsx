import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, type ScrollViewInstance } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import type { SkatingDistance } from "@/utils/skating";

import { DISTANCE_CHIP_WIDTH, DistanceChip } from "./distance-chip";

interface Props {
  distances: SkatingDistance[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const GAP = 8;
const PADDING = 16;

/** Alle afstanden naast elkaar; de gekozen afstand schuift naar het midden. */
export function DistanceStrip({ distances, selectedIndex, onSelect }: Props) {
  const colors = useAppColors();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    if (viewportWidth === 0) {
      return;
    }

    const chipCenter =
      PADDING +
      selectedIndex * (DISTANCE_CHIP_WIDTH + GAP) +
      DISTANCE_CHIP_WIDTH / 2;

    scrollRef.current?.scrollTo({
      x: Math.max(0, chipCenter - viewportWidth / 2),
      animated: true,
    });
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
      {distances.map((distance, index) => (
        <DistanceChip
          key={distance.fixture._id}
          distance={distance}
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

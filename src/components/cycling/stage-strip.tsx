import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, type ScrollViewInstance } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { formatStripDay, type CyclingStage } from "@/utils/cycling";

import { STAGE_CHIP_WIDTH, StageStripChip } from "./stage-strip-chip";

interface Props {
  stages: CyclingStage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const GAP = 8;
const PADDING = 16;

/** Alle etappes naast elkaar; de gekozen etappe schuift naar het midden. */
export function StageStrip({ stages, selectedIndex, onSelect }: Props) {
  const colors = useAppColors();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    if (viewportWidth === 0) {
      return;
    }

    const chipCenter =
      PADDING + selectedIndex * (STAGE_CHIP_WIDTH + GAP) + STAGE_CHIP_WIDTH / 2;

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
      {stages.map((stage, index) => (
        <StageStripChip
          key={stage.fixture._id}
          number={stage.number}
          day={formatStripDay(stage.fixture.startsAt)}
          status={stage.status}
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

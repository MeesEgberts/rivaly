import { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { groupByDay, type SkatingDistance } from "@/utils/skating";

import { DISTANCE_CHIP_WIDTH, DistanceChip } from "./distance-chip";

interface Props {
  distances: SkatingDistance[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const GAP = 8;
const DAY_GAP = 18;
const PADDING = 16;

/**
 * Alle afstanden, per wedstrijddag met de dag erboven; de gekozen afstand
 * schuift naar het midden.
 */
export function DistanceStrip({ distances, selectedIndex, onSelect }: Props) {
  const colors = useAppColors();
  const scrollRef = useRef<ScrollViewInstance>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const days = useMemo(() => groupByDay(distances), [distances]);

  // Midden van elke chip in de strip, vooraf uitgerekend: vaste breedtes.
  const centers = useMemo(() => {
    const result: number[] = [];
    let x = PADDING;

    days.forEach((day, dayIndex) => {
      if (dayIndex > 0) {
        x += DAY_GAP;
      }

      day.items.forEach((item, itemIndex) => {
        if (itemIndex > 0) {
          x += GAP;
        }

        result[item.index] = x + DISTANCE_CHIP_WIDTH / 2;
        x += DISTANCE_CHIP_WIDTH;
      });
    });

    return result;
  }, [days]);

  useEffect(() => {
    if (viewportWidth === 0 || centers[selectedIndex] === undefined) {
      return;
    }

    scrollRef.current?.scrollTo({
      x: Math.max(0, centers[selectedIndex] - viewportWidth / 2),
      animated: true,
    });
  }, [selectedIndex, viewportWidth, centers]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
      style={{ backgroundColor: colors.background, flexGrow: 0 }}
      contentContainerStyle={styles.content}
    >
      {days.map((day) => (
        <View key={day.label} style={styles.day}>
          <Text style={[styles.dayLabel, { color: colors.secondaryLabel }]}>
            {day.label}
          </Text>
          <View style={styles.row}>
            {day.items.map(({ distance, index }) => (
              <DistanceChip
                key={distance.fixture._id}
                distance={distance}
                isSelected={index === selectedIndex}
                onPress={() => onSelect(index)}
              />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: PADDING, paddingVertical: 8, gap: DAY_GAP },
  day: { gap: 6 },
  dayLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginLeft: 2,
  },
  row: { flexDirection: "row", gap: GAP },
});

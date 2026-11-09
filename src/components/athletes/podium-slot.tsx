import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";
import {
  GestureDetector,
  useExclusiveGestures,
  usePanGesture,
  useTapGesture,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { TeamBadge } from "@/components/match/team-badge";
import { medalColor } from "@/constants/medal-colors";
import { useAppColors } from "@/hooks/use-app-colors";
import type { AthleteInfo } from "@/types/athlete";
import { stepHeight } from "@/utils/athletes";
import { tapFeedback } from "@/utils/haptics";

interface Props {
  /** Plek op het podium, 0 = plek 1. */
  position: number;
  size: number;
  athlete: AthleteInfo | null;
  isActive: boolean;
  /** Middens van alle treden (x binnen het podium), in volgorde van weergave. */
  centers: SharedValue<number[]>;
  /** Plekken in volgorde van weergave, om een drop terug te rekenen. */
  layout: number[];
  onSelect: (position: number) => void;
  onDrop: (from: number, to: number) => void;
}

const SPRING = { damping: 20, stiffness: 240 };

/**
 * Eén trede: de renner (of een lege plek) boven een blok in goud, zilver
 * of brons. Tik om deze plek te kiezen; houd een renner vast en sleep hem
 * naar een andere trede om te wisselen.
 */
export function PodiumSlot({
  position,
  size,
  athlete,
  isActive,
  centers,
  layout,
  onSelect,
  onDrop,
}: Props) {
  const colors = useAppColors();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const isCompact = size > 3;

  const pan = usePanGesture({
    enabled: athlete !== null && size > 1,
    activateAfterLongPress: 200,
    onActivate: () => {
      "worklet";
      isDragging.set(true);
      scheduleOnRN(tapFeedback);
    },
    onUpdate: (event) => {
      "worklet";
      translateX.set(event.translationX);
      translateY.set(event.translationY);
    },
    onFinalize: () => {
      "worklet";

      if (!isDragging.get()) {
        return;
      }

      const all = centers.get();
      const from = layout.indexOf(position);
      const dropX = all[from] + translateX.get();
      let nearest = from;

      all.forEach((center, index) => {
        if (Math.abs(center - dropX) < Math.abs(all[nearest] - dropX)) {
          nearest = index;
        }
      });

      isDragging.set(false);
      translateX.set(withSpring(0, SPRING));
      translateY.set(withSpring(0, SPRING));

      if (nearest !== from) {
        scheduleOnRN(onDrop, position, layout[nearest]);
      }
    },
  });

  const tap = useTapGesture({
    onActivate: () => {
      "worklet";
      scheduleOnRN(onSelect, position);
    },
  });

  const gesture = useExclusiveGestures(pan, tap);

  const riderStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.get() },
      { translateY: translateY.get() },
      { scale: withSpring(isDragging.get() ? 1.08 : 1, SPRING) },
    ],
    zIndex: isDragging.get() ? 10 : 0,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={styles.column}
        accessibilityRole="button"
        accessibilityLabel={
          athlete
            ? `Plek ${position + 1}: ${athlete.name}`
            : `Plek ${position + 1}: nog leeg`
        }
      >
        <Animated.View style={[styles.rider, riderStyle]}>
          {athlete ? (
            <View
              style={[
                styles.chosen,
                {
                  backgroundColor: colors.card,
                  borderColor: isActive ? colors.accent : "transparent",
                },
              ]}
            >
              {athlete.code ? <TeamBadge code={athlete.code} /> : null}
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
                style={[
                  styles.name,
                  isCompact && styles.compactName,
                  { color: colors.label },
                ]}
              >
                {athlete.shortName}
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.empty,
                {
                  borderColor: isActive ? colors.accent : colors.separator,
                  backgroundColor: isActive ? colors.accentSoft : "transparent",
                },
              ]}
            >
              <SymbolView
                name="plus"
                size={16}
                tintColor={
                  (isActive ? colors.accent : colors.tertiaryLabel) as string
                }
              />
              {isCompact ? null : (
                <Text
                  style={[
                    styles.emptyText,
                    { color: isActive ? colors.accent : colors.tertiaryLabel },
                  ]}
                >
                  Plek {position + 1}
                </Text>
              )}
            </View>
          )}
        </Animated.View>

        <View
          style={[
            styles.block,
            {
              height: stepHeight(position, size),
              backgroundColor: medalColor(position + 1),
              opacity: athlete || isActive ? 1 : 0.45,
            },
          ]}
        >
          <Text style={styles.number}>{position + 1}</Text>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  column: { flex: 1, justifyContent: "flex-end", gap: 8 },
  rider: { alignItems: "stretch" },
  chosen: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 12,
    borderWidth: 2,
  },
  name: { fontSize: 14, fontWeight: "700", textAlign: "center" },
  compactName: { fontSize: 11 },
  empty: {
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  emptyText: { fontSize: 13, fontWeight: "600" },
  block: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  number: { color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
});

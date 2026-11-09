import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { tapFeedback } from "@/utils/haptics";

import {
  clampIndex,
  moveTo,
  orderFromPositions,
  type Positions,
} from "@/utils/sortable-positions";

interface Props {
  id: string;
  positions: SharedValue<Positions>;
  count: number;
  rowHeight: number;
  isEnabled: boolean;
  onDrop: (order: string[]) => void;
  children: ReactNode;
}

const SPRING = { damping: 22, stiffness: 260 };
const LONG_PRESS_MS = 300;

/**
 * Eén rij die je na een korte druk kunt verslepen. De andere rijen schuiven
 * mee zodra je over hun plek komt; bij loslaten gaat de nieuwe volgorde naar
 * `onDrop`.
 */
export function SortableRow({
  id,
  positions,
  count,
  rowHeight,
  isEnabled,
  onDrop,
  children,
}: Props) {
  const isDragging = useSharedValue(false);
  const dragTop = useSharedValue(0);
  const startTop = useSharedValue(0);

  const pan = usePanGesture({
    enabled: isEnabled,
    activateAfterLongPress: LONG_PRESS_MS,
    onActivate: () => {
      "worklet";

      isDragging.set(true);
      startTop.set(positions.get()[id] * rowHeight);
      dragTop.set(startTop.get());
      scheduleOnRN(tapFeedback);
    },
    onUpdate: (event) => {
      "worklet";

      const maxTop = (count - 1) * rowHeight;
      dragTop.set(
        Math.max(0, Math.min(maxTop, startTop.get() + event.translationY)),
      );

      const target = clampIndex(Math.round(dragTop.get() / rowHeight), count);

      if (target !== positions.get()[id]) {
        positions.set(moveTo(positions.get(), id, target));
        scheduleOnRN(tapFeedback);
      }
    },
    onFinalize: () => {
      "worklet";

      if (!isDragging.get()) {
        return;
      }

      isDragging.set(false);
      scheduleOnRN(onDrop, orderFromPositions(positions.get()));
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const restingTop = positions.get()[id] * rowHeight;

    return {
      top: isDragging.get() ? dragTop.get() : withSpring(restingTop, SPRING),
      zIndex: isDragging.get() ? 10 : 0,
      shadowOpacity: withTiming(isDragging.get() ? 0.18 : 0),
      transform: [{ scale: withSpring(isDragging.get() ? 1.03 : 1, SPRING) }],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.row, { height: rowHeight }, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  row: {
    position: "absolute",
    left: 0,
    right: 0,
    shadowColor: "#000",
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});

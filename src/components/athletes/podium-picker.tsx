import { SymbolView } from "expo-symbols";
import { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { Card } from "@/components/cards/card";
import { useAppColors } from "@/hooks/use-app-colors";
import type { AthleteInfo } from "@/types/athlete";
import { podiumLayout, type Slots } from "@/utils/athletes";

import { PodiumSlot } from "./podium-slot";
import { SingleChoiceSlot } from "./single-choice-slot";

interface Props {
  title: string;
  slots: Slots;
  active: number | null;
  infoOf: (id: string) => AthleteInfo;
  /** Tik op een lege plek: die plek wordt de plek die je kiest. */
  onSelect: (position: number) => void;
  /** Tik op een gevulde plek: open het vervangscherm. */
  onReplace: (position: number) => void;
  onSwap: (from: number, to: number) => void;
}

/**
 * Het podium dat je opbouwt: de treden 2–1–3 (of 4–2–1–3–5), met de plek
 * die je nu kiest in blauw. Bij één keuze is het één vak.
 */
export function PodiumPicker({
  title,
  slots,
  active,
  infoOf,
  onSelect,
  onReplace,
  onSwap,
}: Props) {
  const tapSlot = (position: number) =>
    slots[position] ? onReplace(position) : onSelect(position);

  const colors = useAppColors();
  const size = slots.length;
  const layout = useMemo(() => podiumLayout(size), [size]);
  const centers = useSharedValue<number[]>(layout.map(() => 0));
  const filled = slots.filter(Boolean).length;
  const isComplete = filled === size;

  // De metingen komen los binnen; houd ze hier bij en geef steeds de hele
  // lijst door, zodat ze elkaar niet overschrijven.
  const measured = useRef<number[]>([]);

  const setCenter = useCallback(
    (layoutIndex: number, center: number) => {
      measured.current[layoutIndex] = center;
      centers.set(layout.map((_, index) => measured.current[index] ?? 0));
    },
    [centers, layout],
  );

  return (
    <Card>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.secondaryLabel }]}>
            {title}
          </Text>
          {isComplete ? (
            <View style={styles.status}>
              <SymbolView
                name="checkmark.circle.fill"
                size={15}
                tintColor={colors.success as string}
              />
              <Text style={[styles.count, { color: colors.success }]}>
                Compleet
              </Text>
            </View>
          ) : size > 1 ? (
            <Text style={[styles.count, { color: colors.secondaryLabel }]}>
              {filled}/{size}
            </Text>
          ) : null}
        </View>

        {size === 1 ? (
          <SingleChoiceSlot
            athlete={slots[0] ? infoOf(slots[0]) : null}
            isActive={active === 0}
            onPress={() => tapSlot(0)}
          />
        ) : (
          <View style={styles.podium}>
            {layout.map((position, layoutIndex) => {
              const id = slots[position];

              // Meet de trede hier: binnen de gebarenlaag is x altijd 0.
              return (
                <View
                  key={position}
                  style={styles.step}
                  onLayout={(event) =>
                    setCenter(
                      layoutIndex,
                      event.nativeEvent.layout.x +
                        event.nativeEvent.layout.width / 2,
                    )
                  }
                >
                  <PodiumSlot
                    position={position}
                    size={size}
                    athlete={id ? infoOf(id) : null}
                    isActive={active === position}
                    centers={centers}
                    layout={layout}
                    onSelect={tapSlot}
                    onDrop={onSwap}
                  />
                </View>
              );
            })}
          </View>
        )}

        {size > 1 && filled > 1 ? (
          <Text style={[styles.footnote, { color: colors.tertiaryLabel }]}>
            Houd een renner vast en sleep hem naar een andere trede.
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  status: { flexDirection: "row", alignItems: "center", gap: 4 },
  count: { fontSize: 13, fontWeight: "600", fontVariant: ["tabular-nums"] },
  podium: { flexDirection: "row", alignItems: "flex-end", gap: 8 },
  step: { flex: 1, alignSelf: "stretch", justifyContent: "flex-end" },
  footnote: { fontSize: 12, textAlign: "center" },
});

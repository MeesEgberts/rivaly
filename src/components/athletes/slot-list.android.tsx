import { View, StyleSheet } from "react-native";

import { Card } from "@/components/cards/card";
import { RankBadge } from "@/components/poule/rank-badge";
import { SortableList } from "@/components/sortable/sortable-list";

import { ChosenAthleteRow } from "./chosen-athlete-row";
import { EmptySlotRow } from "./empty-slot-row";
import type { SlotListProps } from "./slot-list";

const SLOT_HEIGHT = 58;

/**
 * Android: eigen sleeplijst, want Compose in `@expo/ui` kent geen
 * herordenen. De plekken staan vast; gekozen atleten versleep je na een
 * korte druk.
 */
export function SlotList({
  order,
  size,
  noun,
  infoOf,
  onRemove,
  onReorder,
  onPickSlot,
}: SlotListProps) {
  const isRanking = size > 1;
  const canDrag = isRanking && order.length > 1;
  const emptyPositions = Array.from(
    { length: Math.max(0, size - order.length) },
    (_, index) => order.length + index + 1,
  );

  return (
    <Card isFlush>
      <View style={styles.body}>
        {isRanking ? (
          <View>
            {Array.from({ length: size }, (_, index) => (
              <View key={index} style={styles.medal}>
                <RankBadge rank={index + 1} size={28} />
              </View>
            ))}
          </View>
        ) : null}

        <View style={[styles.slots, !isRanking && styles.single]}>
          <SortableList
            order={order}
            rowHeight={SLOT_HEIGHT}
            isEnabled={canDrag}
            onReorder={onReorder}
            renderRow={(id) => (
              <ChosenAthleteRow
                athlete={infoOf(id)}
                onRemove={() => onRemove(order.indexOf(id))}
                isDraggable={canDrag}
              />
            )}
          />
          {emptyPositions.map((position, index) => (
            <View key={position} style={styles.emptyRow}>
              <EmptySlotRow
                position={isRanking ? position : null}
                isNext={index === 0}
                noun={noun}
                onPress={onPickSlot}
              />
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  body: { flexDirection: "row" },
  medal: {
    height: SLOT_HEIGHT,
    width: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  slots: { flex: 1 },
  single: { paddingLeft: 14 },
  emptyRow: { height: SLOT_HEIGHT },
});

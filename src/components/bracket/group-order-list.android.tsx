import { Pressable, StyleSheet, Text, View } from "react-native";

import { SortableList } from "@/components/sortable/sortable-list";
import { InsetCard } from "@/components/ui/inset-card";
import { useAppColors } from "@/hooks/use-app-colors";

import type { GroupOrderListProps } from "./group-order-list";
import { BracketGroupSlot } from "./bracket-group-slot";
import { BracketGroupTeamRow } from "./bracket-group-team-row";
import { GROUP_ROW_HEIGHT } from "@/utils/bracket-layout";

/**
 * Android: eigen sleeplijst, want Compose in `@expo/ui` kent geen
 * herordenen. De plekken (1 t/m 4, "door") staan vast; de teams versleep
 * je na een korte druk.
 */
export function GroupOrderList({
  name,
  order,
  qualifiers,
  participants,
  onReorder,
  footerAction,
}: GroupOrderListProps) {
  const colors = useAppColors();

  return (
    <InsetCard title={name}>
      <View style={styles.body}>
        <View>
          {order.map((teamId, index) => (
            <BracketGroupSlot
              key={teamId}
              position={index + 1}
              isQualified={index < qualifiers}
              isFirst={index === 0}
            />
          ))}
        </View>

        <View style={styles.teams}>
          <SortableList
            order={order}
            rowHeight={GROUP_ROW_HEIGHT}
            isEnabled={onReorder !== undefined}
            onReorder={(next) => onReorder?.(next)}
            renderRow={(teamId) => (
              <BracketGroupTeamRow
                team={participants.get(teamId) ?? null}
                isDraggable={onReorder !== undefined}
              />
            )}
          />
        </View>
      </View>

      {footerAction ? (
        <Pressable
          onPress={footerAction.onPress}
          style={[styles.footer, { borderTopColor: colors.separator }]}
          accessibilityRole="button"
        >
          <Text style={[styles.footerText, { color: colors.accent }]}>
            {footerAction.label}
          </Text>
        </Pressable>
      ) : null}
    </InsetCard>
  );
}

const styles = StyleSheet.create({
  body: { flexDirection: "row" },
  teams: { flex: 1 },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    alignItems: "center",
  },
  footerText: { fontSize: 15 },
});

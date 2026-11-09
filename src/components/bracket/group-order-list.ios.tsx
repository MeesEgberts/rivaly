import { Host, List, Section } from "@expo/ui/swift-ui";
import {
  environment,
  ignoreSafeArea,
  listSectionSpacing,
  listStyle,
  scrollContentBackground,
  scrollDisabled,
} from "@expo/ui/swift-ui/modifiers";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { applyMove } from "@/utils/apply-move";

import type { GroupOrderListProps } from "./group-order-list";
import { groupListHeight } from "@/utils/bracket-layout";
import { BracketGroupListRow } from "./bracket-group-list-row";

/**
 * iOS: een native SwiftUI-lijst in bewerkmodus. Versleep een team aan de
 * ≡-greep rechts, zoals bij Instellingen of Herinneringen.
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
  const isEditable = onReorder !== undefined;

  const handleMove = (sourceIndices: number[], destination: number) => {
    onReorder?.(applyMove(order, sourceIndices, destination));
  };

  return (
    <View style={styles.container}>
      <Host style={{ width: "100%", height: groupListHeight(order.length) }}>
        <List
          modifiers={[
            listStyle("insetGrouped"),
            listSectionSpacing("compact"),
            scrollDisabled(true),
            scrollContentBackground("hidden"),
            environment("editMode", isEditable ? "active" : "inactive"),
            // De lijst staat midden in een pagina; anders schuift SwiftUI de
            // inhoud omlaag zodra hij onder de navigatiebalk komt.
            ignoreSafeArea({ edges: "all" }),
          ]}
        >
          <Section title={name}>
            <List.ForEach
              data={order}
              keyExtractor={(teamId) => teamId}
              onMove={isEditable ? handleMove : undefined}
            >
              {({ item: teamId, index }) => (
                <BracketGroupListRow
                  position={index + 1}
                  team={participants.get(teamId) ?? null}
                  isQualified={index < qualifiers}
                />
              )}
            </List.ForEach>
          </Section>
        </List>
      </Host>

      {footerAction ? (
        <Pressable
          onPress={footerAction.onPress}
          accessibilityRole="button"
          style={styles.footer}
        >
          <Text style={[styles.footerText, { color: colors.accent }]}>
            {footerAction.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 4 },
  footer: { alignSelf: "center", paddingVertical: 6, paddingHorizontal: 16 },
  footerText: { fontSize: 15 },
});

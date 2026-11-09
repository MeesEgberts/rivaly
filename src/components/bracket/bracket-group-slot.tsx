import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

import { GROUP_ROW_HEIGHT } from "@/utils/bracket-layout";

interface Props {
  position: number;
  isQualified: boolean;
  isFirst: boolean;
}

/** Vaste plek links in de groepskaart: nummer en groene "door"-streep. */
export function BracketGroupSlot({ position, isQualified, isFirst }: Props) {
  const colors = useAppColors();

  return (
    <View
      style={[
        styles.slot,
        !isFirst && {
          borderTopColor: colors.separator,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View
        style={[
          styles.marker,
          { backgroundColor: isQualified ? colors.success : "transparent" },
        ]}
      />
      <Text style={[styles.position, { color: colors.secondaryLabel }]}>
        {position}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: 36,
    height: GROUP_ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  position: { fontSize: 15, fontVariant: ["tabular-nums"] },
});

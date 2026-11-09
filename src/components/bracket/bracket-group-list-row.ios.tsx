import { HStack, Spacer, Text } from "@expo/ui/swift-ui";
import {
  background,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  monospacedDigit,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import { iosColors, iosStatusColors } from "@/theme/ios-colors";

import type { BracketGroupListRowProps } from "./bracket-group-list-row";

/** Eén team in de native groepslijst: plek, landcode, naam en "door". */
export function BracketGroupListRow({
  position,
  team,
  isQualified,
}: BracketGroupListRowProps) {
  return (
    <HStack spacing={10}>
      <Text
        modifiers={[
          font({ textStyle: "body" }),
          monospacedDigit(),
          foregroundStyle(iosColors.secondaryLabel),
          frame({ width: 18 }),
        ]}
      >
        {String(position)}
      </Text>
      <Text
        modifiers={[
          font({ textStyle: "caption2", weight: "bold" }),
          foregroundStyle(iosColors.secondaryLabel),
          padding({ horizontal: 6, vertical: 3 }),
          background(
            iosStatusColors.fill,
            shapes.roundedRectangle({ cornerRadius: 5 }),
          ),
        ]}
      >
        {team?.code ?? "?"}
      </Text>
      <Text modifiers={[font({ textStyle: "body" }), lineLimit(1)]}>
        {team?.name ?? "Onbekend"}
      </Text>
      <Spacer />
      {isQualified ? (
        <Text
          modifiers={[
            font({ textStyle: "footnote", weight: "semibold" }),
            foregroundStyle(iosStatusColors.success),
          ]}
        >
          door
        </Text>
      ) : null}
    </HStack>
  );
}

import {
  Button,
  HStack,
  Host,
  List,
  Section,
  Spacer,
  Text,
} from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  environment,
  font,
  foregroundStyle,
  frame,
  ignoreSafeArea,
  lineLimit,
  listSectionSpacing,
  listStyle,
  monospacedDigit,
  padding,
  scrollContentBackground,
  scrollDisabled,
} from "@expo/ui/swift-ui/modifiers";

import { medalColor } from "@/constants/medal-colors";
import { iosColors, iosStatusColors } from "@/theme/ios-colors";
import { applyMove } from "@/utils/apply-move";
import { SLOT_LIST, slotListHeight } from "@/utils/athletes";

import type { SlotListProps } from "./slot-list";

/**
 * iOS: de plekken als native lijst in bewerkmodus. Versleep een gekozen
 * atleet aan de ≡-greep, haal hem weg met de rode min; lege plekken staan
 * eronder en openen het zoekscherm.
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
  const empty = Array.from(
    { length: Math.max(0, size - order.length) },
    (_, index) => order.length + index + 1,
  );

  return (
    // De lijst springt zelf in en houdt ruimte boven en onder; trek dat
    // weg, zodat hij even breed is als de andere kaarten.
    <Host
      style={{
        height: slotListHeight(size),
        marginHorizontal: -SLOT_LIST.sideInset,
        marginTop: -(SLOT_LIST.topInset - 6),
        marginBottom: -(SLOT_LIST.bottomInset - 4),
      }}
    >
      <List
        modifiers={[
          listStyle("insetGrouped"),
          listSectionSpacing("compact"),
          scrollDisabled(true),
          scrollContentBackground("hidden"),
          environment("editMode", "active"),
          // Midden in een scrollende pagina; anders schuift SwiftUI de
          // inhoud omlaag zodra de lijst onder de navigatiebalk komt.
          ignoreSafeArea({ edges: "all" }),
        ]}
      >
        <Section>
          <List.ForEach
            data={order}
            keyExtractor={(id) => id}
            onMove={
              isRanking
                ? (sources, destination) =>
                    onReorder(applyMove(order, sources, destination))
                : undefined
            }
            onDelete={(indices) => indices.forEach((index) => onRemove(index))}
          >
            {({ item: id, index }) => {
              const athlete = infoOf(id);

              return (
                <HStack spacing={10}>
                  {isRanking ? <Medal position={index + 1} /> : null}
                  {athlete.code ? <Code code={athlete.code} /> : null}
                  <Text
                    modifiers={[
                      font({ textStyle: "body", weight: "semibold" }),
                      lineLimit(1),
                    ]}
                  >
                    {athlete.name}
                  </Text>
                  <Spacer />
                </HStack>
              );
            }}
          </List.ForEach>

          {empty.map((position, index) => (
            <Button key={position} onPress={onPickSlot}>
              <HStack spacing={10}>
                {isRanking ? <Medal position={position} /> : null}
                <Text
                  modifiers={[
                    font({ textStyle: "body", weight: "semibold" }),
                    foregroundStyle(
                      index === 0 ? iosColors.accent : iosColors.tertiaryLabel,
                    ),
                  ]}
                >
                  {isRanking
                    ? `+  Kies plek ${position}`
                    : `+  Kies een ${noun}`}
                </Text>
                <Spacer />
              </HStack>
            </Button>
          ))}
        </Section>
      </List>
    </Host>
  );
}

function Medal({ position }: { position: number }) {
  return (
    <Text
      modifiers={[
        font({ textStyle: "subheadline", weight: "heavy" }),
        monospacedDigit(),
        foregroundStyle("#FFFFFF"),
        frame({ width: 28, height: 28 }),
        background(medalColor(position)),
        clipShape("circle"),
      ]}
    >
      {String(position)}
    </Text>
  );
}

function Code({ code }: { code: string }) {
  return (
    <Text
      modifiers={[
        font({ textStyle: "caption2", weight: "bold" }),
        foregroundStyle(iosColors.secondaryLabel),
        padding({ horizontal: 6, vertical: 3 }),
        background(iosStatusColors.fill),
        clipShape("roundedRectangle", 5),
      ]}
    >
      {code}
    </Text>
  );
}

import {
  Button,
  HStack,
  Image,
  RNHostView,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  buttonStyle,
  contentShape,
  font,
  foregroundStyle,
  frame,
  imageScale,
  lineLimit,
  shapes,
} from "@expo/ui/swift-ui/modifiers";

import { iosColors } from "@/theme/ios-colors";
import type { NavRowProps } from "./nav-row";

const secondary = foregroundStyle(iosColors.secondaryLabel);
const tertiary = foregroundStyle(iosColors.tertiaryLabel);

/**
 * iOS-rij in een Form/List: icoon of emoji links, titel met ondertitel,
 * waarde rechts en een chevron wanneer de rij navigeert. Dit is het
 * standaard Settings-patroon van iOS.
 */
export function NavRow({
  title,
  subtitle,
  icon,
  value,
  leadingText,
  leading,
  onPress,
  highlighted,
  selected,
}: NavRowProps) {
  const row = (
    <HStack spacing={12} modifiers={[contentShape(shapes.rectangle())]}>
      {leading ? (
        <HStack modifiers={[frame({ width: 32, height: 32 })]}>
          <RNHostView matchContents>{leading}</RNHostView>
        </HStack>
      ) : icon ? (
        <Image
          systemName={icon}
          modifiers={[foregroundStyle(iosColors.accent), frame({ width: 28 })]}
        />
      ) : null}
      {leadingText && !leading ? (
        <Text modifiers={[font({ textStyle: "title2" }), frame({ width: 28 })]}>
          {leadingText}
        </Text>
      ) : null}
      <VStack alignment="leading" spacing={2}>
        <Text
          modifiers={[
            font({
              textStyle: "body",
              weight: highlighted ? "semibold" : "regular",
            }),
            foregroundStyle(iosColors.label),
            lineLimit(1),
          ]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            modifiers={[
              font({ textStyle: "subheadline" }),
              secondary,
              lineLimit(2),
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </VStack>
      <Spacer />
      {value ? (
        <Text
          modifiers={[
            font({
              textStyle: "body",
              weight: highlighted ? "semibold" : "regular",
            }),
            highlighted ? foregroundStyle(iosColors.label) : secondary,
          ]}
        >
          {value}
        </Text>
      ) : null}
      {selected === true ? (
        <Image
          systemName="checkmark"
          modifiers={[
            font({ textStyle: "body", weight: "semibold" }),
            foregroundStyle(iosColors.accent),
          ]}
        />
      ) : null}
      {onPress && selected === undefined ? (
        <Image
          systemName="chevron.right"
          modifiers={[
            font({ textStyle: "footnote", weight: "semibold" }),
            imageScale("small"),
            tertiary,
          ]}
        />
      ) : null}
    </HStack>
  );

  if (!onPress) {
    return row;
  }

  return (
    <Button onPress={onPress} modifiers={[buttonStyle("plain")]}>
      {row}
    </Button>
  );
}

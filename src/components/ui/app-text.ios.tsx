import { Text } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  lineLimit,
  multilineTextAlignment,
  type ModifierConfig,
} from "@expo/ui/swift-ui/modifiers";

import { iosColors } from "@/theme/ios-colors";
import type { AppTextProps, AppTextVariant } from "./app-text";

const VARIANT_MODIFIERS: Record<AppTextVariant, ModifierConfig[]> = {
  largeTitle: [font({ textStyle: "largeTitle", weight: "bold" })],
  title: [font({ textStyle: "title2", weight: "bold" })],
  headline: [font({ textStyle: "headline" })],
  body: [font({ textStyle: "body" })],
  secondary: [
    font({ textStyle: "subheadline" }),
    foregroundStyle(iosColors.secondaryLabel),
  ],
  caption: [
    font({ textStyle: "footnote" }),
    foregroundStyle(iosColors.secondaryLabel),
  ],
};

export function AppText({
  variant = "body",
  children,
  singleLine,
  align,
}: AppTextProps) {
  const modifiers = [
    ...VARIANT_MODIFIERS[variant],
    ...(singleLine ? [lineLimit(1)] : []),
    ...(align === "center" ? [multilineTextAlignment("center")] : []),
  ];

  return <Text modifiers={modifiers}>{children}</Text>;
}

import { PlatformColor } from "react-native";

import type { AppColors } from "@/theme/app-colors";

const IOS_COLORS: AppColors = {
  background: PlatformColor("systemGroupedBackground"),
  card: PlatformColor("secondarySystemGroupedBackground"),
  label: PlatformColor("label"),
  secondaryLabel: PlatformColor("secondaryLabel"),
  tertiaryLabel: PlatformColor("tertiaryLabel"),
  separator: PlatformColor("separator"),
  fill: PlatformColor("tertiarySystemFill"),
  accent: PlatformColor("systemBlue"),
  onAccent: "#FFFFFF",
  accentSoft: PlatformColor("quaternarySystemFill"),
  success: PlatformColor("systemGreen"),
  danger: PlatformColor("systemRed"),
  keypad: PlatformColor("systemGray5"),
  key: PlatformColor("secondarySystemGroupedBackground"),
};

/** Semantische UIKit-kleuren; ze volgen dark mode vanzelf. */
export function useAppColors(): AppColors {
  return IOS_COLORS;
}

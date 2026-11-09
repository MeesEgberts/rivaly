import type { ColorValue } from "react-native";

import type { AppColors } from "@/theme/app-colors";

import type { RoundStatus } from "./matchday-rounds";

export function stripChipLabelColor(
  colors: AppColors,
  status: RoundStatus,
  isSelected: boolean,
): ColorValue {
  if (isSelected) {
    return colors.onAccent;
  }

  if (status === "closed") {
    return colors.tertiaryLabel;
  }

  return colors.label;
}

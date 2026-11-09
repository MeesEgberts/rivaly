import type { ColorValue } from "react-native";

import type { AppColors } from "@/theme/app-colors";

export function teamNameColor(
  colors: AppColors,
  isWinner: boolean,
  isLoser: boolean,
): ColorValue {
  if (isWinner) {
    return colors.onAccent;
  }

  if (isLoser) {
    return colors.tertiaryLabel;
  }

  return colors.label;
}

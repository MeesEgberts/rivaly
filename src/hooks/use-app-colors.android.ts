import { useMaterialColors } from "@expo/ui/jetpack-compose";
import { useMemo } from "react";

import type { AppColors } from "@/theme/app-colors";

/** Material 3-palet van het toestel (Material You op Android 12+). */
export function useAppColors(): AppColors {
  const material = useMaterialColors();

  return useMemo(
    () => ({
      background: material.surface,
      card: material.surfaceContainerLow,
      label: material.onSurface,
      secondaryLabel: material.onSurfaceVariant,
      tertiaryLabel: material.outline,
      separator: material.outlineVariant,
      fill: material.surfaceContainerHighest,
      accent: material.primary,
      onAccent: material.onPrimary,
      accentSoft: material.primaryContainer,
      success: material.tertiary,
      danger: material.error,
      keypad: material.surfaceContainer,
      key: material.surfaceContainerHighest,
    }),
    [material],
  );
}

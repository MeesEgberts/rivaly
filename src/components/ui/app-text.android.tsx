import { Text, useMaterialColors } from "@expo/ui/jetpack-compose";

import type { AppTextProps, AppTextVariant } from "./app-text";

type Typography =
  | "displaySmall"
  | "headlineSmall"
  | "titleMedium"
  | "bodyLarge"
  | "bodyMedium"
  | "bodySmall";

const VARIANT_TYPOGRAPHY: Record<AppTextVariant, Typography> = {
  largeTitle: "displaySmall",
  title: "headlineSmall",
  headline: "titleMedium",
  body: "bodyLarge",
  secondary: "bodyMedium",
  caption: "bodySmall",
};

export function AppText({
  variant = "body",
  children,
  singleLine,
  align,
}: AppTextProps) {
  const colors = useMaterialColors();
  const muted = variant === "secondary" || variant === "caption";

  return (
    <Text
      color={muted ? colors.onSurfaceVariant : colors.onSurface}
      maxLines={singleLine ? 1 : undefined}
      overflow={singleLine ? "ellipsis" : undefined}
      style={{
        typography: VARIANT_TYPOGRAPHY[variant],
        textAlign: align === "center" ? "center" : undefined,
      }}
    >
      {children}
    </Text>
  );
}

import { Column, Text, useMaterialColors } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding } from "@expo/ui/jetpack-compose/modifiers";

import type { EmptyStateProps } from "./empty-state";

export function EmptyState({ title, description }: EmptyStateProps) {
  const colors = useMaterialColors();

  return (
    <Column
      horizontalAlignment="center"
      verticalArrangement={{ spacedBy: 8 }}
      modifiers={[fillMaxWidth(), padding(24, 32, 24, 32)]}
    >
      <Text style={{ typography: "titleLarge", textAlign: "center" }}>
        {title}
      </Text>
      <Text
        color={colors.onSurfaceVariant}
        style={{ typography: "bodyMedium", textAlign: "center" }}
      >
        {description}
      </Text>
    </Column>
  );
}

import {
  Column,
  Host,
  Text,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { fillMaxSize, padding } from "@expo/ui/jetpack-compose/modifiers";

import type { BrandHeroProps } from "./brand-hero";

export function BrandHero({ title, subtitle }: BrandHeroProps) {
  const colors = useMaterialColors();

  return (
    <Host style={{ flex: 1 }}>
      <Column
        horizontalAlignment="center"
        verticalArrangement="center"
        modifiers={[fillMaxSize(), padding(32, 0, 32, 0)]}
      >
        <Text
          color={colors.primary}
          style={{ typography: "displayMedium", textAlign: "center" }}
        >
          {title}
        </Text>
        <Text
          color={colors.onSurfaceVariant}
          style={{ typography: "titleMedium", textAlign: "center" }}
        >
          {subtitle}
        </Text>
      </Column>
    </Host>
  );
}

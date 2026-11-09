import { Host, Image, Spacer, Text, VStack } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  multilineTextAlignment,
  padding,
} from "@expo/ui/swift-ui/modifiers";

import { iosColors } from "@/theme/ios-colors";
import type { BrandHeroProps } from "./brand-hero";

export function BrandHero({ title, subtitle }: BrandHeroProps) {
  return (
    <Host style={{ flex: 1 }}>
      <VStack spacing={16} modifiers={[padding({ horizontal: 32 })]}>
        <Spacer />
        <Image
          systemName="trophy.fill"
          size={88}
          modifiers={[foregroundStyle(iosColors.accent)]}
        />
        <Text
          modifiers={[
            font({
              textStyle: "largeTitle",
              weight: "bold",
              design: "rounded",
            }),
          ]}
        >
          {title}
        </Text>
        <Text
          modifiers={[
            font({ textStyle: "title3" }),
            foregroundStyle(iosColors.secondaryLabel),
            multilineTextAlignment("center"),
          ]}
        >
          {subtitle}
        </Text>
        <Spacer />
      </VStack>
    </Host>
  );
}

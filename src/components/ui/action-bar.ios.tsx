import { Host, VStack } from "@expo/ui/swift-ui";
import { padding } from "@expo/ui/swift-ui/modifiers";

import type { ActionBarProps } from "./action-bar";

/** Knoppen gestapeld met 12pt tussenruimte en 16pt marge, zoals iOS-sheets. */
export function ActionBar({ children }: ActionBarProps) {
  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <VStack spacing={12} modifiers={[padding({ horizontal: 16, top: 8 })]}>
        {children}
      </VStack>
    </Host>
  );
}

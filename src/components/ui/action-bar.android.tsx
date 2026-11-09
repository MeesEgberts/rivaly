import { Column, Host } from "@expo/ui/jetpack-compose";
import { fillMaxWidth, padding } from "@expo/ui/jetpack-compose/modifiers";

import type { ActionBarProps } from "./action-bar";

/** Material: knoppen gestapeld met 8dp tussenruimte en 16dp marge. */
export function ActionBar({ children }: ActionBarProps) {
  return (
    <Host matchContents={{ vertical: true }} style={{ width: "100%" }}>
      <Column
        verticalArrangement={{ spacedBy: 8 }}
        modifiers={[fillMaxWidth(), padding(16, 8, 16, 0)]}
      >
        {children}
      </Column>
    </Host>
  );
}

import { ListItem, Text, useMaterialColors } from "@expo/ui/jetpack-compose";
import { clickable, fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";

import type { DestructiveRowProps } from "./destructive-row";

/** Material: een gewone lijstrij in de error-kleur. */
export function DestructiveRow({ title, onPress }: DestructiveRowProps) {
  const colors = useMaterialColors();

  return (
    <ListItem modifiers={[fillMaxWidth(), clickable(onPress)]}>
      <ListItem.HeadlineContent>
        <Text color={colors.error} style={{ typography: "bodyLarge" }}>
          {title}
        </Text>
      </ListItem.HeadlineContent>
    </ListItem>
  );
}

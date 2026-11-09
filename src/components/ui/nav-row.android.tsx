import {
  ListItem,
  RNHostView,
  Text,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { clickable, fillMaxWidth } from "@expo/ui/jetpack-compose/modifiers";

import type { NavRowProps } from "./nav-row";

/**
 * Material 3 ListItem: headline, supporting text, leading emoji en trailing
 * waarde. Material gebruikt geen chevrons; de hele rij is tikbaar.
 */
export function NavRow({
  title,
  subtitle,
  value,
  leadingText,
  leading,
  onPress,
  highlighted,
  selected,
}: NavRowProps) {
  const colors = useMaterialColors();

  return (
    <ListItem
      colors={
        highlighted
          ? {
              containerColor: colors.secondaryContainer,
              contentColor: colors.onSecondaryContainer,
            }
          : undefined
      }
      modifiers={[fillMaxWidth(), ...(onPress ? [clickable(onPress)] : [])]}
    >
      <ListItem.HeadlineContent>
        <Text
          style={{ typography: "bodyLarge" }}
          maxLines={1}
          overflow="ellipsis"
        >
          {title}
        </Text>
      </ListItem.HeadlineContent>
      {subtitle ? (
        <ListItem.SupportingContent>
          <Text
            color={colors.onSurfaceVariant}
            style={{ typography: "bodyMedium" }}
            maxLines={2}
            overflow="ellipsis"
          >
            {subtitle}
          </Text>
        </ListItem.SupportingContent>
      ) : null}
      {leading ? (
        <ListItem.LeadingContent>
          <RNHostView matchContents>{leading}</RNHostView>
        </ListItem.LeadingContent>
      ) : leadingText ? (
        <ListItem.LeadingContent>
          <Text style={{ typography: "headlineSmall" }}>{leadingText}</Text>
        </ListItem.LeadingContent>
      ) : null}
      {selected === true ? (
        <ListItem.TrailingContent>
          <Text color={colors.primary} style={{ typography: "titleMedium" }}>
            ✓
          </Text>
        </ListItem.TrailingContent>
      ) : null}
      {value && selected !== true ? (
        <ListItem.TrailingContent>
          <Text
            color={
              highlighted
                ? colors.onSecondaryContainer
                : colors.onSurfaceVariant
            }
            style={{ typography: "labelLarge" }}
          >
            {value}
          </Text>
        </ListItem.TrailingContent>
      ) : null}
    </ListItem>
  );
}

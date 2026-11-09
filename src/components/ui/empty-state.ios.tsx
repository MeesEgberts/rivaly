import { ContentUnavailableView } from "@expo/ui/swift-ui";

import type { EmptyStateProps } from "./empty-state";

/** De standaard lege-staat van iOS 17+: symbool, titel en toelichting. */
export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <ContentUnavailableView
      title={title}
      description={description}
      systemImage={icon}
    />
  );
}

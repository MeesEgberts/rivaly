import type { SFSymbol } from "sf-symbols-typescript";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon: SFSymbol;
}

/** Platformvarianten in `empty-state.ios.tsx` en `empty-state.android.tsx`. */
export function EmptyState(_props: EmptyStateProps) {
  return null;
}

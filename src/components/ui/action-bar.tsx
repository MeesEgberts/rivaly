import type { ReactNode } from "react";

export interface ActionBarProps {
  children: ReactNode;
}

/** Platformvarianten in `action-bar.ios.tsx` en `action-bar.android.tsx`. */
export function ActionBar({ children }: ActionBarProps) {
  return <>{children}</>;
}

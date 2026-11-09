export type AppTextVariant =
  "largeTitle" | "title" | "headline" | "body" | "secondary" | "caption";

export interface AppTextProps {
  variant?: AppTextVariant;
  children: string;
  /** Alleen de eerste regel tonen en afkappen. */
  singleLine?: boolean;
  align?: "left" | "center";
}

/**
 * Platformvarianten staan in `app-text.ios.tsx` en `app-text.android.tsx`.
 * Dit bestand is het type-contract en de fallback.
 */
export function AppText({ children }: AppTextProps) {
  return <>{children}</>;
}

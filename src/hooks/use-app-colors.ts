import type { AppColors } from "@/theme/app-colors";

/** Platformvarianten in `use-app-colors.ios.ts` en `use-app-colors.android.ts`. */
export function useAppColors(): AppColors {
  throw new Error("useAppColors heeft een iOS- of Android-variant nodig.");
}

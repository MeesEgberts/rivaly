export interface DateTimeRowProps {
  /** Tekst links in de rij, bijv. "Start". */
  label: string;
  /** Gekozen moment in milliseconden. */
  value: number;
  onChange: (value: number) => void;
}

/** Platformvarianten in `date-time-row.ios.tsx` en `date-time-row.android.tsx`. */
export function DateTimeRow(_props: DateTimeRowProps) {
  return null;
}

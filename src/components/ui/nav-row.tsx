import type { SFSymbol } from "sf-symbols-typescript";

export interface NavRowProps {
  title: string;
  subtitle?: string;
  /** SF Symbol links van de titel (alleen iOS; Android laat hem weg). */
  icon?: SFSymbol;
  /** Korte tekst rechts, bijv. "12 pt" of "3e". */
  value?: string;
  /** Emoji of ander kort teken links in plaats van een icoon. */
  leadingText?: string;
  onPress?: () => void;
  /** Markeert de rij, bijv. de eigen regel in een stand. */
  highlighted?: boolean;
  /**
   * Keuzerij: toont een vinkje in plaats van een chevron. `undefined` is
   * geen keuzerij, `false` is een niet-geselecteerde keuze.
   */
  selected?: boolean;
}

/** Platformvarianten in `nav-row.ios.tsx` en `nav-row.android.tsx`. */
export function NavRow(_props: NavRowProps) {
  return null;
}

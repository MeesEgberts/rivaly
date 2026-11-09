import {
  DEFAULT_SPORT_COLOR,
  GROUPED_BACKGROUND,
  SPORT_COLORS,
} from "@/constants/sport-colors";

import { formatDateRange } from "./format";

/** Onder de naam in de kop: "Monument · za 20 mrt" of "Grote ronde · za 3 – zo 25 jul". */
export function eventSubtitle(event: {
  moduleName: string;
  seriesNames: string[];
  startsAt: number;
  endsAt: number;
}): string {
  const kind = event.seriesNames[0] ?? event.moduleName;

  return `${kind} · ${formatDateRange(event.startsAt, event.endsAt)}`;
}

/** Kleur van het sportrondje: de themakleur van het evenement, anders die van de sport. */
export function eventColor(color: string | null, moduleKey: string): string {
  if (color && /^#[0-9a-f]{6}$/i.test(color)) {
    return color;
  }

  return SPORT_COLORS[moduleKey] ?? DEFAULT_SPORT_COLOR;
}

/**
 * Kleurverloop onderaan de foto, dat overloopt in de achtergrond van het
 * scherm, zoals de foto's in Apple Kaarten.
 */
export function photoFade(scheme: "light" | "dark"): string {
  const base = GROUPED_BACKGROUND[scheme];

  return `linear-gradient(to bottom, ${base}0) 45%, ${base}0.6) 75%, ${base}1) 100%)`;
}

/** Lichte schaduw bovenaan de foto, zodat de statusbalk leesbaar blijft. */
export const PHOTO_TOP_SHADE =
  "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 100%)";

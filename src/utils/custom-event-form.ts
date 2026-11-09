import {
  STAGE_PROFILES,
  type StageProfile,
} from "@modules/cycling/stage-profile";
import { getModule } from "@modules/registry";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Standaard starttijd voor een nieuwe wedstrijd: morgen om 12:00. */
export function defaultStartsAt(now: number = Date.now()): number {
  const tomorrow = new Date(now + DAY);
  tomorrow.setHours(12, 0, 0, 0);

  return tomorrow.getTime();
}

/** Keuzes voor het soort parcours, met "Onbekend" vooraan. */
export const PROFILE_OPTIONS: {
  value: StageProfile | "none";
  label: string;
}[] = [
  { value: "none", label: "Nog onbekend" },
  ...(Object.keys(STAGE_PROFILES) as StageProfile[]).map((profile) => ({
    value: profile,
    label: STAGE_PROFILES[profile].label,
  })),
];

export function profileFromOption(value: string): StageProfile | undefined {
  return value === "none" ? undefined : (value as StageProfile);
}

/** De puntentellingen van een sport, als keuzes voor de picker. */
export function presetOptions(moduleKey: string) {
  return getModule(moduleKey).presets.map((preset) => ({
    value: preset.key,
    label: preset.name,
    description: preset.description,
  }));
}

/** "Milaan – Sanremo" uit twee losse velden; leeg als een van beide ontbreekt. */
export function routeFrom(start: string, finish: string): string | undefined {
  const from = start.trim();
  const to = finish.trim();

  return from && to ? `${from} – ${to}` : undefined;
}

/** "289" → 289; onzin of leeg → undefined. */
export function parseDistance(input: string): number | undefined {
  const value = Number(input.replace(",", ".").trim());

  return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined;
}

/** Code uit een teamnaam als de gebruiker er geen invult: "Ajax" → "AJA". */
export function suggestedCode(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 3)
    .toUpperCase();
}

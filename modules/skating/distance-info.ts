import { skatingFormat } from "./categories";

/** Lengte van één ronde: 400 m langebaan, 111,12 m shorttrack. */
export const TRACK_LENGTH: Record<string, number> = {
  speedskating: 400,
  shorttrack: 111.12,
};

/** Een massastart is altijd 16 ronden. */
const MASS_START_LAPS = 16;

const QUARTERS = ["", "¼", "½", "¾"];

/** 1,25 → "1¼", 12,5 → "12½", 9 → "9". */
export function formatLaps(laps: number): string {
  const quarters = Math.round(laps * 4);
  const whole = Math.floor(quarters / 4);
  const rest = QUARTERS[quarters % 4];

  return whole === 0 ? rest : `${whole}${rest}`;
}

/** Aantal ronden van een afstand, of `null` bij een klassement (EK). */
export function lapsOf(
  sport: string,
  details: { distanceM?: number; format?: string },
): number | null {
  const format = skatingFormat(details.format);

  if (format === "massstart") {
    return MASS_START_LAPS;
  }

  if (format === "sprint" || format === "allround" || !details.distanceM) {
    return null;
  }

  return details.distanceM / (TRACK_LENGTH[sport] ?? 400);
}

export interface DistanceKind {
  label: string;
  /** Wie hier kans maakt, zodat je weet wie je kiest. */
  favours: string;
  /** SF Symbol voor de uitleg. */
  icon: string;
}

/** Wat voor afstand het is en voor wie hij gunstig is. */
export function distanceKind(
  sport: string,
  details: { distanceM?: number; format?: string },
): DistanceKind {
  const format = skatingFormat(details.format);
  const meters = details.distanceM ?? 0;

  switch (format) {
    case "massstart":
      return {
        label: "Massastart",
        favours:
          "Iedereen tegelijk, met tussensprints. Tactiek en een sterke eindsprint beslissen.",
        icon: "person.3.sequence.fill",
      };
    case "relay":
      return {
        label: "Aflossing",
        favours:
          "Ploegen wisselen elkaar af; een val of een slechte wissel kost alles.",
        icon: "arrow.triangle.2.circlepath",
      };
    case "sprint":
      return {
        label: "Sprintvierkamp",
        favours:
          "Twee keer 500 en 1000 m. De beste sprinter over twee dagen wint.",
        icon: "bolt.fill",
      };
    case "allround":
      return {
        label: "Allroundvierkamp",
        favours:
          "Vier afstanden van kort tot lang. Kans voor de complete schaatser.",
        icon: "list.number",
      };
    case "distance":
      break;
  }

  if (sport === "shorttrack") {
    return meters <= 500
      ? {
          label: "Sprint",
          favours:
            "De start en de eerste bocht beslissen. Kans voor snelle starters.",
          icon: "bolt.fill",
        }
      : {
          label: "Tactisch",
          favours:
            "Inhalen in de bochten en op het juiste moment naar voren. Kans voor slimme rijders.",
          icon: "arrow.turn.up.right",
        };
  }

  if (meters <= 1000) {
    return {
      label: "Sprint",
      favours: "Pure snelheid en een snelle opening. Kans voor sprinters.",
      icon: "bolt.fill",
    };
  }

  if (meters <= 1500) {
    return {
      label: "Middenafstand",
      favours:
        "De koningsafstand: snelheid én uithouding. Kans voor allrounders.",
      icon: "crown.fill",
    };
  }

  return {
    label: "Lange afstand",
    favours: "Een lange adem en een vlak ritme. Kans voor stayers.",
    icon: "infinity",
  };
}

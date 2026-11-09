import type { SFSymbol } from "sf-symbols-typescript";

import {
  formatDistance,
  SKATING_FORMAT_ICONS,
  skatingFormat,
  isSkatingCategory,
  SKATING_CATEGORIES,
} from "@modules/skating/categories";

import type { EventFixture } from "@/hooks/use-event-data";

import { fixtureCardStatus, type FixtureCardStatus } from "./prediction-cards";

export interface SkatingDistance {
  fixture: EventFixture;
  status: FixtureCardStatus;
  /** "500 m", "Massastart" of "Aflossing". */
  title: string;
  /** "Vrouwen", "Mannen" of "Aflossing gemengd". */
  categoryLabel: string;
  /** SF Symbol van de categorie: man, vrouw of beide. */
  figure: SFSymbol;
  /** SF Symbol van de soort race: stopwatch, finishvlag of aflossing. */
  formatIcon: SFSymbol;
  /** Kort voor in de strip: "500", "MS" of "Afl.". */
  short: string;
}

function categoryOf(fixture: EventFixture) {
  const category = fixture.details?.category;
  return category && isSkatingCategory(category)
    ? SKATING_CATEGORIES[category]
    : null;
}

/** Titel van een afstand: de meters, of het soort race. */
export function distanceTitle(fixture: EventFixture): string {
  const format = fixture.details?.format;
  const meters = fixture.details?.distanceM;

  if (format === "massstart") {
    return "Massastart";
  }

  if (format === "sprint") {
    return "Sprintklassement";
  }

  if (format === "allround") {
    return "Allroundklassement";
  }

  if (format === "relay") {
    return meters ? `Aflossing ${formatDistance(meters)}` : "Aflossing";
  }

  return meters ? formatDistance(meters) : (fixture.label ?? "Afstand");
}

function distanceShort(fixture: EventFixture): string {
  const format = fixture.details?.format;

  if (format === "massstart") {
    return "MS";
  }

  if (format === "relay") {
    return "Afl.";
  }

  if (format === "sprint") {
    return "Spr.";
  }

  if (format === "allround") {
    return "All.";
  }

  return String(fixture.details?.distanceM ?? "?");
}

/** De afstanden van een toernooi, in volgorde van het programma. */
export function toSkatingDistances(
  fixtures: EventFixture[],
  now: number,
): SkatingDistance[] {
  return fixtures.map((fixture) => {
    const category = categoryOf(fixture);

    return {
      fixture,
      status: fixtureCardStatus(fixture, now),
      title: distanceTitle(fixture),
      categoryLabel: category?.label ?? "",
      figure: (category?.figure ?? "figure.stand") as SFSymbol,
      formatIcon: SKATING_FORMAT_ICONS[
        skatingFormat(fixture.details?.format)
      ] as SFSymbol,
      short: distanceShort(fixture),
    };
  });
}

/** De eerste afstand die nog open is; anders de laatste. */
export function defaultDistanceIndex(distances: SkatingDistance[]): number {
  const open = distances.findIndex(
    (distance) => distance.status === "todo" || distance.status === "done",
  );

  return open >= 0 ? open : Math.max(0, distances.length - 1);
}

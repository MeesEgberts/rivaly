import type { SFSymbol } from "sf-symbols-typescript";

import {
  distanceName,
  SKATING_FORMAT_ICONS,
  skatingFormat,
  isSkatingCategory,
  SKATING_CATEGORIES,
} from "@modules/skating/categories";

import {
  distanceKind,
  formatLaps,
  lapsOf,
  type DistanceKind,
} from "@modules/skating/distance-info";

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
  /** "1¼" of "16"; `null` bij een klassement. */
  laps: string | null;
  lapCount: number | null;
  kind: DistanceKind;
}

function categoryOf(fixture: EventFixture) {
  const category = fixture.details?.category;
  return category && isSkatingCategory(category)
    ? SKATING_CATEGORIES[category]
    : null;
}

/** Titel van een afstand: de meters, of het soort race. */
export function distanceTitle(fixture: EventFixture): string {
  return fixture.details
    ? distanceName(fixture.details)
    : (fixture.label ?? "Afstand");
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
  sport: string,
  now: number,
): SkatingDistance[] {
  return fixtures.map((fixture) => {
    const category = categoryOf(fixture);
    const details = fixture.details ?? {};
    const lapCount = lapsOf(sport, details);

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
      laps: lapCount === null ? null : formatLaps(lapCount),
      lapCount,
      kind: distanceKind(sport, details),
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

export interface DistanceDay {
  /** "vr 13 nov" */
  label: string;
  /** De afstanden van die dag, met hun plek in de hele lijst. */
  items: { distance: SkatingDistance; index: number }[];
}

/** Afstanden per wedstrijddag, in volgorde. */
export function groupByDay(distances: SkatingDistance[]): DistanceDay[] {
  const days: DistanceDay[] = [];

  distances.forEach((distance, index) => {
    const label = new Date(distance.fixture.startsAt).toLocaleDateString(
      "nl-NL",
      { weekday: "short", day: "numeric", month: "short" },
    );
    const last = days[days.length - 1];

    if (last?.label === label) {
      last.items.push({ distance, index });
    } else {
      days.push({ label, items: [{ distance, index }] });
    }
  });

  return days;
}

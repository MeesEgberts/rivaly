import { cyclingStageKinds } from "@modules/cycling/module";
import { footballStageKinds } from "@modules/football/module";
import { skatingStageKinds } from "@modules/skating/module";

import type { EventData, EventFixture } from "@/hooks/use-event-data";

export type EventTabKey =
  | "groups"
  | "bracket"
  | "knockout"
  | "matchdays"
  | "bonus"
  | "race"
  | "stages"
  | "classifications"
  | "distances";

export interface EventTab {
  key: EventTabKey;
  label: string;
}

function hasStageKind(stages: EventData["stages"], kind: string): boolean {
  return stages.some((stage) => stage.kind === kind);
}

function hasFixturesInKind(
  stages: EventData["stages"],
  fixtures: EventFixture[],
  kind: string,
): boolean {
  const stageIds = new Set(
    stages.filter((stage) => stage.kind === kind).map((stage) => stage._id),
  );

  return fixtures.some((fixture) => stageIds.has(fixture.stageId));
}

/**
 * Welke tabs een evenement krijgt hangt af van zijn fases: een toernooi
 * toont groepen en schema, een competitie speelrondes, een wielerronde
 * etappes en klassementen.
 */
export function eventTabs(
  stages: EventData["stages"],
  fixtures: EventFixture[],
): EventTab[] {
  const tabs: EventTab[] = [];

  if (hasStageKind(stages, footballStageKinds.group)) {
    tabs.push({ key: "groups", label: "Groepen" });
  }

  if (fixtures.some((fixture) => fixture.payload.type === "bracket")) {
    tabs.push({ key: "bracket", label: "Schema" });
  }

  if (hasFixturesInKind(stages, fixtures, footballStageKinds.knockout)) {
    tabs.push({ key: "knockout", label: "Knock-out" });
  }

  if (hasStageKind(stages, footballStageKinds.matchday)) {
    tabs.push({ key: "matchdays", label: "Speelrondes" });
  }

  // Schaatsen en shorttrack: de afstanden vóór de extra vragen.
  if (hasFixturesInKind(stages, fixtures, skatingStageKinds.distances)) {
    tabs.push({ key: "distances", label: "Afstanden" });
  }

  if (hasFixturesInKind(stages, fixtures, footballStageKinds.bonus)) {
    tabs.push({ key: "bonus", label: "Extra" });
  }

  // Wielrennen: eendagskoers, of etappes plus klassementen bij een ronde.
  if (hasFixturesInKind(stages, fixtures, cyclingStageKinds.race)) {
    tabs.push({ key: "race", label: "Koers" });
  }

  // Klassementen eerst: die vul je vóór de eerste etappe in.
  if (hasFixturesInKind(stages, fixtures, cyclingStageKinds.classification)) {
    tabs.push({ key: "classifications", label: "Klassementen" });
  }

  if (hasFixturesInKind(stages, fixtures, cyclingStageKinds.stages)) {
    tabs.push({ key: "stages", label: "Etappes" });
  }

  return tabs;
}

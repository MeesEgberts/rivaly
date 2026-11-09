import { footballStageKinds } from "@modules/football/module";

import type { EventData, EventFixture } from "@/hooks/use-event-data";

export type EventTabKey =
  "groups" | "bracket" | "knockout" | "matchdays" | "bonus";

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
 * toont groepen en schema, een competitie speelrondes.
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

  if (hasFixturesInKind(stages, fixtures, footballStageKinds.bonus)) {
    tabs.push({ key: "bonus", label: "Extra" });
  }

  return tabs;
}

import { footballStageKinds } from "@modules/football/module";

import { groupQualifiers } from "@/utils/bracket-groups";
import type { EventData, EventFixture } from "@/hooks/use-event-data";
import { toMatchRows, type MatchRowData } from "@/utils/match-rows";
import type { ParticipantMap } from "@/utils/participants";

export interface GroupSection {
  stageId: string;
  name: string;
  matches: MatchRowData[];
  /** Hoeveel teams uit deze groep doorgaan volgens het knock-outschema. */
  qualifiers: number;
}

/** Groepsnaam "Groep A" → sleutel "A", zoals het knock-outschema hem noemt. */
function groupKeyOf(stageName: string): string {
  return stageName.replace(/^Groep\s+/i, "").trim();
}

export function groupSections(
  stages: EventData["stages"],
  fixtures: EventFixture[],
  participants: ParticipantMap,
  now: number,
): GroupSection[] {
  const qualifiers = new Map<string, number>();

  for (const fixture of fixtures) {
    if (fixture.payload.type === "bracket") {
      for (const [group, count] of groupQualifiers(fixture.payload)) {
        qualifiers.set(group, count);
      }
    }
  }

  return stages
    .filter((stage) => stage.kind === footballStageKinds.group)
    .map((stage) => {
      const stageFixtures = fixtures.filter(
        (fixture) => fixture.stageId === stage._id,
      );

      return {
        stageId: stage._id,
        name: stage.name,
        matches: toMatchRows(stageFixtures, participants, now),
        qualifiers: qualifiers.get(groupKeyOf(stage.name)) ?? 0,
      };
    })
    .filter((section) => section.matches.length > 0);
}

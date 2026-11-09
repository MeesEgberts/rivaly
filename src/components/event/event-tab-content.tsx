import type { Id } from "@convex/_generated/dataModel";

import { ClassificationsTab } from "@/components/cycling/classifications-tab";
import { RaceTab } from "@/components/cycling/race-tab";
import { StagesTab } from "@/components/cycling/stages-tab";

import { BracketTab } from "./bracket/bracket-tab";
import type { EventTabKey } from "@/utils/event-tabs";
import { BonusTab } from "./bonus/bonus-tab";
import { GroupStageTab } from "./groups/group-stage-tab";
import { KnockoutMatchesTab } from "./knockout/knockout-matches-tab";
import { MatchdayTab } from "./matchdays/matchday-tab";

interface Props {
  eventId: Id<"events">;
  tab: EventTabKey;
}

export function EventTabContent({ eventId, tab }: Props) {
  switch (tab) {
    case "groups":
      return <GroupStageTab eventId={eventId} />;
    case "bracket":
      return <BracketTab eventId={eventId} />;
    case "knockout":
      return <KnockoutMatchesTab eventId={eventId} />;
    case "matchdays":
      return <MatchdayTab eventId={eventId} />;
    case "bonus":
      return <BonusTab eventId={eventId} />;
    case "race":
      return <RaceTab eventId={eventId} />;
    case "stages":
      return <StagesTab eventId={eventId} />;
    case "classifications":
      return <ClassificationsTab eventId={eventId} />;
  }
}

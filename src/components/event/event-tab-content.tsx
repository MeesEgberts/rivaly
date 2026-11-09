import type { Id } from "@convex/_generated/dataModel";

import { BonusTab } from "./bonus/bonus-tab";
import { BracketTab } from "./bracket/bracket-tab";
import type { EventTabKey } from "@/utils/event-tabs";
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
  }
}

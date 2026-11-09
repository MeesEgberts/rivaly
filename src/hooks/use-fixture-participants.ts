import { useMemo } from "react";

import type { FixtureDetail } from "@/types/fixture-detail";
import { buildParticipantMap } from "@/utils/participants";

export function useFixtureParticipants(fixture: FixtureDetail) {
  return useMemo(
    () => buildParticipantMap(fixture.participants),
    [fixture.participants],
  );
}

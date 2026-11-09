import type { SFSymbol } from "sf-symbols-typescript";

import type { StageProfile } from "@modules/cycling/stage-profile";

export const STAGE_PROFILE_ICON: Record<StageProfile, SFSymbol> = {
  flat: "road.lanes",
  hilly: "chart.line.uptrend.xyaxis",
  mountain: "mountain.2",
  summitFinish: "flag.pattern.checkered",
  timeTrial: "stopwatch",
  teamTimeTrial: "person.3",
  cobbles: "square.grid.3x3",
};

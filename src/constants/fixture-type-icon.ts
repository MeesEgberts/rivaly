import type { SFSymbol } from "sf-symbols-typescript";

import type { FixtureTypeKey } from "@modules/types";

export const FIXTURE_TYPE_ICON: Record<FixtureTypeKey, SFSymbol> = {
  score: "soccerball",
  pick: "checkmark.circle",
  ranking: "list.number",
  numeric: "number",
  bracket: "trophy",
};

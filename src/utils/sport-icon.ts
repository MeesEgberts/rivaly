import type { SFSymbol } from "sf-symbols-typescript";

import { getModule } from "@modules/registry";

/** Het SF Symbol van een sportmodule, bijv. "soccerball" voor voetbal. */
export function moduleIcon(moduleKey: string): SFSymbol {
  return getModule(moduleKey).icon as SFSymbol;
}

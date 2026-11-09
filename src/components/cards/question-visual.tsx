import { JerseyIcon } from "@/components/cycling/jersey-icon";
import { FIXTURE_TYPE_ICON } from "@/constants/fixture-type-icon";
import { TROPHY_COLOR } from "@/constants/result-colors";
import { STAGE_PROFILE_ICON } from "@/constants/stage-profile-icon";
import type { FixtureTypeKey } from "@modules/types";
import type { FixtureDetails } from "@modules/validators";
import type { SFSymbol } from "sf-symbols-typescript";

import { SymbolBadge } from "./symbol-badge";

interface Props {
  type: FixtureTypeKey;
  details: FixtureDetails | null;
  size?: number;
}

/**
 * Het beeld bij een vraag, overal hetzelfde: de trui bij een klassement,
 * het eigen icoon (trofee, bal) of het profiel van een etappe, anders het
 * icoon van het soort vraag.
 */
export function QuestionVisual({ type, details, size = 34 }: Props) {
  if (details?.jersey) {
    return <JerseyIcon jersey={details.jersey} size={size} />;
  }

  const icon: SFSymbol = details?.icon
    ? (details.icon as SFSymbol)
    : details?.profile
      ? STAGE_PROFILE_ICON[details.profile]
      : FIXTURE_TYPE_ICON[type];

  return (
    <SymbolBadge
      name={icon}
      size={size}
      tint={icon.startsWith("trophy") ? TROPHY_COLOR : undefined}
    />
  );
}

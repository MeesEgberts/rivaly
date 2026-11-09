import type { FixturePayload } from "@modules/validators";
import type { FixtureDraft, FixtureFormMode } from "@/utils/fixture-draft";
import type { ParticipantMap } from "@/utils/participants";

import { NumericFields } from "./numeric-fields";
import { PickFields } from "./pick-fields";
import { RankingFields } from "./ranking-fields";
import { ScoreFields } from "./score-fields";

interface Props {
  payload: FixturePayload;
  participants: ParticipantMap;
  draft: FixtureDraft;
  onChange: (draft: FixtureDraft) => void;
  mode: FixtureFormMode;
}

/**
 * Generiek formulier voor de vier onderdeeltypes, in een native Form. Wordt
 * gebruikt door het voorspelscherm én door het beheerscherm voor uitslagen.
 * Hoort binnen een `Screen`.
 */
export function FixtureForm({
  payload,
  participants,
  draft,
  onChange,
  mode,
}: Props) {
  switch (payload.type) {
    case "score":
      return (
        <ScoreFields
          payload={payload}
          participants={participants}
          draft={draft}
          onChange={onChange}
          mode={mode}
        />
      );

    case "pick":
      return (
        <PickFields
          payload={payload}
          draft={draft}
          onChange={onChange}
          mode={mode}
        />
      );

    case "ranking":
      return (
        <RankingFields payload={payload} draft={draft} onChange={onChange} />
      );

    case "numeric":
      return (
        <NumericFields payload={payload} draft={draft} onChange={onChange} />
      );

    case "bracket":
      return null;
  }
}

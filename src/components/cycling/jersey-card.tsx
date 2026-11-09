import { JERSEYS, type Jersey } from "@modules/cycling/stage-profile";
import { PredictionTile } from "@/components/cards/prediction-tile";
import type { EventFixture } from "@/hooks/use-event-data";
import type { ParticipantMap } from "@/utils/participants";
import { questionSize } from "@/utils/prediction-cards";

import { JerseyIcon } from "./jersey-icon";

interface Props {
  fixture: EventFixture;
  jersey: Jersey;
  participants: ParticipantMap;
  isOpen: boolean;
}

/** Klassementsvraag als tegel met de trui in zijn kleur en jouw keuze. */
export function JerseyCard({ fixture, jersey, participants, isOpen }: Props) {
  const info = JERSEYS[jersey];
  const size = questionSize(fixture);

  return (
    <PredictionTile
      fixture={fixture}
      visual={<JerseyIcon jersey={jersey} />}
      title={info.name}
      subtitle={size ? `${info.classification} · ${size}` : info.classification}
      participants={participants}
      isOpen={isOpen}
    />
  );
}

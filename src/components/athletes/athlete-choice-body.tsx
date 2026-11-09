import { router } from "expo-router";
import { useEffect } from "react";

import { useAthleteDraft } from "@/hooks/use-athlete-draft";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import type { FixtureDetail } from "@/types/fixture-detail";
import {
  athleteInfo,
  isAthletePool,
  savedOrder,
  slotCount,
} from "@/utils/athletes";

import { PodiumPicker } from "./podium-picker";

interface Props {
  fixture: FixtureDetail;
  mode: "prediction" | "result";
}

/**
 * Kiezen uit atleten, voor voorspellen én uitslagen: het podium dat je
 * opbouwt. Een plek aantikken opent het keuzescherm met zoeken.
 */
export function AthleteChoiceBody({ fixture, mode }: Props) {
  const draft = useAthleteDraft();
  const participants = useFixtureParticipants(fixture);
  const payload = fixture.payload;
  const { start, isStarted } = draft;

  useEffect(() => {
    if (!isStarted && isAthletePool(payload)) {
      const saved = savedOrder(
        mode === "prediction" ? fixture.myPrediction : fixture.result,
      );
      start(saved, slotCount(payload));
    }
    // Alleen de eerste keer; daarna is de keuze van de gebruiker leidend.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted]);

  if (!isAthletePool(payload) || !isStarted) {
    return null;
  }

  const infoOf = (id: string) =>
    athleteInfo(id, draft.known, participants, payload);
  const isRanking = payload.type === "ranking";
  const prefix = mode === "prediction" ? "Jouw" : "Uitslag:";
  const title = isRanking
    ? payload.size === 3
      ? `${prefix} podium`
      : `${prefix} top ${payload.size}`
    : `${prefix} keuze`;

  return (
    <>
      <PodiumPicker
        title={title}
        slots={draft.slots}
        infoOf={infoOf}
        onOpen={(position) =>
          router.push({
            pathname:
              mode === "prediction"
                ? "/predict/[fixtureId]/choose"
                : "/result/[fixtureId]/choose",
            params: { fixtureId: fixture._id, position: String(position) },
          })
        }
        onSwap={draft.swap}
      />
    </>
  );
}

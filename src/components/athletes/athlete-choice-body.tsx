import { router } from "expo-router";
import { useEffect, useMemo } from "react";

import { useAthleteDraft } from "@/hooks/use-athlete-draft";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import type { FixtureDetail } from "@/types/fixture-detail";
import {
  athleteInfo,
  isAthletePool,
  poolNoun,
  savedOrder,
  selectableFavourites,
  slotCount,
} from "@/utils/athletes";

import { AthleteChoiceList } from "./athlete-choice-list";
import { PodiumPicker } from "./podium-picker";

interface Props {
  fixture: FixtureDetail;
  mode: "prediction" | "result";
}

/**
 * Kiezen uit atleten, voor voorspellen én uitslagen: het podium dat je
 * opbouwt bovenaan, daaronder één lijst met zoeken en favorieten.
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

  const favourites = useMemo(() => {
    if (!isAthletePool(payload)) {
      return [];
    }

    return selectableFavourites(payload, mode).map((option) =>
      athleteInfo(option.id, draft.known, participants, payload),
    );
  }, [payload, mode, draft.known, participants]);

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
        active={draft.active}
        infoOf={infoOf}
        onSelect={draft.select}
        onReplace={(position) =>
          router.push({
            pathname:
              mode === "prediction"
                ? "/predict/[fixtureId]/replace"
                : "/result/[fixtureId]/replace",
            params: { fixtureId: fixture._id, position: String(position) },
          })
        }
        onSwap={draft.swap}
      />
      <AthleteChoiceList
        pool={payload.pool}
        noun={poolNoun(payload.pool)}
        favourites={favourites}
        slots={draft.slots}
        active={draft.active}
        infoOf={infoOf}
        onPlace={draft.place}
      />
    </>
  );
}

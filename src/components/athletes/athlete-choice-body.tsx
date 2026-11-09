import type { Href } from "expo-router";
import { router } from "expo-router";
import { useEffect, useMemo } from "react";

import { Card } from "@/components/cards/card";
import { SectionTitle } from "@/components/cards/section-title";
import { useAthleteDraft } from "@/hooks/use-athlete-draft";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import type { FixtureDetail } from "@/types/fixture-detail";
import {
  athleteInfo,
  athleteNoun,
  isAthletePool,
  isOther,
  savedOrder,
  selectableFavourites,
  slotCount,
} from "@/utils/athletes";

import { AthleteRow } from "./athlete-row";
import { SearchLinkCard } from "./search-link-card";
import { SelectionCard } from "./selection-card";

interface Props {
  fixture: FixtureDetail;
  mode: "prediction" | "result";
  /** Het zoekscherm in dezelfde modal-stack. */
  searchHref: Href;
}

/**
 * Kiezen uit atleten, voor voorspellen én uitslagen: je keuze bovenaan,
 * dan zoeken in alle atleten van de sport en de favorieten om snel te tikken.
 */
export function AthleteChoiceBody({ fixture, mode, searchHref }: Props) {
  const draft = useAthleteDraft();
  const participants = useFixtureParticipants(fixture);
  const payload = fixture.payload;
  const { start, isStarted } = draft;

  const initial = savedOrder(
    mode === "prediction" ? fixture.myPrediction : fixture.result,
  );

  useEffect(() => {
    if (!isStarted && isAthletePool(payload)) {
      start(initial, slotCount(payload));
    }
    // Alleen bij de eerste keer; daarna is de keuze van de gebruiker leidend.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStarted]);

  const favourites = useMemo(
    () => (isAthletePool(payload) ? selectableFavourites(payload, mode) : []),
    [payload, mode],
  );

  if (!isAthletePool(payload)) {
    return null;
  }

  const size = slotCount(payload);
  const noun = athleteNoun(payload.pool.sport);
  const infoOf = (id: string) =>
    athleteInfo(id, draft.known, participants, payload);
  const slots = Array.from({ length: size }, (_, index) =>
    draft.order[index] ? infoOf(draft.order[index]) : null,
  );
  const isFull = size > 1 && draft.order.length >= size;
  const prefix = mode === "prediction" ? "Jouw" : "Uitslag";
  const title = size > 1 ? `${prefix} top ${size}` : `${prefix} keuze`;

  return (
    <>
      <SelectionCard
        title={title}
        slots={slots}
        onRemove={draft.remove}
        onMoveUp={size > 1 ? draft.moveUp : undefined}
      />

      {isFull ? null : (
        <SearchLinkCard
          title={`Zoek in alle ${noun.plural}`}
          onPress={() => router.push(searchHref)}
        />
      )}

      {favourites.length > 0 && !isFull ? (
        <>
          <SectionTitle>Favorieten</SectionTitle>
          <Card isFlush>
            {favourites.map((option, index) => (
              <AthleteRow
                key={option.id}
                athlete={infoOf(option.id)}
                isChosen={draft.order.includes(option.id)}
                onPress={() =>
                  draft.add(
                    infoOf(option.id),
                    mode === "result" && isOther(option.id),
                  )
                }
                isLast={index === favourites.length - 1}
              />
            ))}
          </Card>
        </>
      ) : null}
    </>
  );
}

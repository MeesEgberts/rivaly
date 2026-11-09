import { router } from "expo-router";

import type { EventFixture } from "@/hooks/use-event-data";
import { podiumSlots, rankingOrder } from "@/utils/cycling";
import { type FixtureCardStatus } from "@/utils/prediction-cards";
import type { ParticipantMap } from "@/utils/participants";

import { PodiumCard } from "./podium-card";

interface Props {
  fixture: EventFixture;
  status: FixtureCardStatus;
  participants: ParticipantMap;
}

const ACTION_LABEL: Record<FixtureCardStatus, string | undefined> = {
  todo: "Kies je podium",
  done: "Wijzig je podium",
  locked: undefined,
  finished: undefined,
};

/** Jouw podium voor een etappe of koers, en de echte uitslag zodra die er is. */
export function RankingPodium({ fixture, status, participants }: Props) {
  if (fixture.payload.type !== "ranking") {
    return null;
  }

  const size = fixture.payload.size;
  const myOrder = rankingOrder(fixture.myPrediction);
  const resultOrder = rankingOrder(fixture.result);

  const mySlots = podiumSlots({
    order: myOrder,
    size,
    payload: fixture.payload,
    participants,
    result: fixture.result,
  });

  const openPredict = () => router.push(`/predict/${fixture._id}`);

  return (
    <>
      <PodiumCard
        title={
          myOrder || status === "todo"
            ? "Jouw podium"
            : "Je hebt niets ingevuld"
        }
        slots={mySlots}
        actionLabel={ACTION_LABEL[status]}
        onPress={openPredict}
      />
      {resultOrder ? (
        <PodiumCard
          title="Uitslag"
          slots={podiumSlots({
            order: resultOrder,
            size,
            payload: fixture.payload,
            participants,
            result: null,
          })}
        />
      ) : null}
    </>
  );
}

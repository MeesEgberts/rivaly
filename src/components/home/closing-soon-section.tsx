import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { router } from "expo-router";
import { useMemo } from "react";

import { api } from "@convex/_generated/api";
import { NavRow } from "@/components/ui/nav-row";
import { Section } from "@/components/ui/screen";
import { useNow } from "@/hooks/use-now";
import { formatDateTime } from "@/utils/format";

import { FIXTURE_TYPE_ICON } from "@/constants/fixture-type-icon";

const MAX_ITEMS = 5;

type OpenItem = FunctionReturnType<typeof api.predictions.open>[number];

/** De eerstvolgende onderdelen die je nog niet hebt ingevuld. */
export function ClosingSoonSection() {
  const now = useNow();
  const items = useQuery(api.predictions.open, { now });

  const todo = useMemo(
    () =>
      (items ?? []).filter((item) => !item.hasPrediction).slice(0, MAX_ITEMS),
    [items],
  );

  const openFixture = (item: OpenItem) => {
    // Een schema vul je in op het toernooischerm, de rest in het voorspelscherm.
    if (item.type === "bracket") {
      router.push({
        pathname: "/events/[eventId]",
        params: { eventId: item.eventId, tab: "bracket" },
      });
      return;
    }

    router.push(`/predict/${item.fixtureId}`);
  };

  if (todo.length === 0) {
    return null;
  }

  return (
    <Section title="Sluit binnenkort">
      {todo.map((item) => (
        <NavRow
          key={item.fixtureId}
          icon={FIXTURE_TYPE_ICON[item.type]}
          title={item.label ?? "Onderdeel"}
          subtitle={`${item.eventName} · sluit ${formatDateTime(item.locksAt)}`}
          onPress={() => openFixture(item)}
        />
      ))}
    </Section>
  );
}

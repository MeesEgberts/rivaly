import { useMemo } from "react";
import { Animated, StyleSheet, Text } from "react-native";

import {
  championOf,
  countBracketMatches,
  groupOrderOf,
  resolveBracket,
} from "@modules/fixture-types/bracket-tree";
import { BracketBoard } from "@/components/bracket/bracket-board";
import { GroupOrderList } from "@/components/bracket/group-order-list";
import { BracketSummary } from "@/components/bracket/bracket-summary";
import { defaultGroupOrders, groupQualifiers } from "@/utils/bracket-groups";
import { useBracketDraft } from "@/hooks/use-bracket-draft";
import { useAppColors } from "@/hooks/use-app-colors";
import { useEventScroll } from "@/hooks/use-event-scroll";
import type { EventFixture } from "@/hooks/use-event-data";
import { useNow } from "@/hooks/use-now";
import { isFixtureOpen } from "@/utils/match-rows";
import { participantInfo, type ParticipantMap } from "@/utils/participants";

interface Props {
  fixture: EventFixture;
  fixtures: EventFixture[];
  participants: ParticipantMap;
}

/**
 * Het schema invullen: bovenaan je kampioen en voortgang, dan de bracket
 * om winnaars aan te tikken, en onderaan de groepsvolgorde die bepaalt wie
 * er in de eerste ronde staat.
 */
export function BracketEditor({ fixture, fixtures, participants }: Props) {
  const colors = useAppColors();
  const { header, scrollRef, scrollProps } = useEventScroll();
  const now = useNow();

  const payload = fixture.payload.type === "bracket" ? fixture.payload : null;
  const saved =
    fixture.myPrediction?.type === "bracket" ? fixture.myPrediction : null;
  const actual = fixture.result?.type === "bracket" ? fixture.result : null;
  const isLocked = !isFixtureOpen(fixture, now);

  const defaults = useMemo(
    () => (payload ? defaultGroupOrders(payload, fixtures) : []),
    [payload, fixtures],
  );

  const bracket = useBracketDraft({
    fixtureId: fixture._id,
    payload: payload ?? { type: "bracket", groups: [], rounds: [] },
    saved,
    defaults,
    isLocked,
  });

  const qualifiers = useMemo(
    () => (payload ? groupQualifiers(payload) : new Map<string, number>()),
    [payload],
  );

  const champion = useMemo(() => {
    if (!payload) {
      return null;
    }

    return championOf(resolveBracket(payload, bracket.draft));
  }, [payload, bracket.draft]);

  if (!payload) {
    return null;
  }

  const total = countBracketMatches(payload);
  const championName = participantInfo(participants, champion)?.name ?? null;

  return (
    <Animated.ScrollView
      ref={scrollRef}
      {...scrollProps}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
    >
      {header}
      <BracketSummary
        picked={bracket.draft.winners.length}
        total={total}
        championName={championName}
        locksAt={fixture.locksAt}
        isLocked={isLocked}
        status={bracket.status}
      />

      <Text style={[styles.hint, { color: colors.secondaryLabel }]}>
        {isLocked
          ? "Je schema is gesloten. Groen = dat team haalde die ronde echt."
          : "Tik per wedstrijd het team dat doorgaat. Swipe naar links voor de volgende ronde."}
      </Text>

      <BracketBoard
        payload={payload}
        value={bracket.draft}
        participants={participants}
        actual={actual}
        onPick={isLocked ? undefined : bracket.chooseWinner}
      />

      <Text style={[styles.sectionTitle, { color: colors.label }]}>
        Wie gaan er door?
      </Text>
      <Text style={[styles.hint, { color: colors.secondaryLabel }]}>
        Volgt je voorspelde uitslagen in de groepen. Sleep een team aan ≡ naar
        een andere plek; keuzes die daardoor niet meer kloppen worden gewist.
      </Text>

      {payload.groups.map((group) => (
        <GroupOrderList
          key={group.key}
          name={group.name}
          order={groupOrderOf(bracket.draft, group.key) ?? group.teamIds}
          qualifiers={qualifiers.get(group.key) ?? 0}
          participants={participants}
          onReorder={
            isLocked
              ? undefined
              : (order) => bracket.reorderGroup(group.key, order)
          }
        />
      ))}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 48 },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginHorizontal: 32,
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginHorizontal: 20,
    marginTop: 28,
  },
});

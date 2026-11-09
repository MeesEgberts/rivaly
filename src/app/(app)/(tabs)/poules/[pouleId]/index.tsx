import { useQuery } from "convex/react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet } from "react-native";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Card } from "@/components/cards/card";
import { CardRow } from "@/components/cards/card-row";
import { SectionTitle } from "@/components/cards/section-title";
import { SymbolBadge } from "@/components/cards/symbol-badge";
import { PouleSkeleton } from "@/components/skeleton/poule-skeleton";
import { SkeletonScreen } from "@/components/skeleton/skeleton-screen";
import { InviteCard } from "@/components/poule/invite-card";
import { MembersCard } from "@/components/poule/members-card";
import { PouleHeroCard } from "@/components/poule/poule-hero-card";
import { PouleMenu } from "@/components/poule/poule-menu";
import { ProgramCard } from "@/components/poule/program-card";
import { StandingsCard } from "@/components/poule/standings-card";
import { StandingsPodium } from "@/components/poule/standings-podium";
import { useAppColors } from "@/hooks/use-app-colors";
import { formatInviteCode } from "@/utils/format";
import { sharePouleInvite } from "@/utils/poule-share";
import { pouleTitle } from "@/utils/poules";

/**
 * Eén poule: kop met jouw plek, stand met podium, programma, leden en
 * uitnodigen. Eigenaar en beheerders kunnen wedstrijden toevoegen.
 *
 * Titel en menu staan er vanaf de eerste render, ook tijdens het laden:
 * wat later in de navigatiebalk wordt gezet, springt er na de overgang in.
 */
export default function PouleScreen() {
  const { pouleId, title } = useLocalSearchParams<{
    pouleId: Id<"poules">;
    title?: string;
  }>();
  const colors = useAppColors();
  const poule = useQuery(api.poules.get, { pouleId });
  const standings = useQuery(api.poules.standings, { pouleId });
  const members = useQuery(api.poules.members, { pouleId });

  const isLoading =
    poule === undefined || standings === undefined || members === undefined;

  const header = (
    <>
      <Stack.Screen
        options={{ title: poule ? pouleTitle(poule) : (title ?? "") }}
      />
      <PouleMenu
        pouleId={pouleId}
        pouleName={poule?.name ?? title ?? ""}
        inviteCode={poule ? formatInviteCode(poule.inviteCode) : ""}
        canEdit={poule !== undefined && poule.myRole !== "member"}
        canDelete={
          poule?.myRole === "owner" &&
          members !== undefined &&
          members.length === 1
        }
      />
    </>
  );

  if (isLoading) {
    return (
      <>
        {header}
        <SkeletonScreen>
          <PouleSkeleton />
        </SkeletonScreen>
      </>
    );
  }

  const inviteCode = formatInviteCode(poule.inviteCode);
  const me = standings.find((row) => row.isMe) ?? null;
  const canManage = poule.myRole !== "member";

  return (
    <>
      {header}

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
      >
        <PouleHeroCard poule={poule} me={me} memberCount={members.length} />

        <SectionTitle>Stand</SectionTitle>
        <StandingsPodium rows={standings} />
        <StandingsCard pouleId={pouleId} rows={standings} />

        <SectionTitle>Programma</SectionTitle>
        <ProgramCard events={poule.events} />
        {canManage ? (
          <Card isFlush>
            <CardRow
              leading={<SymbolBadge name="plus" size={36} />}
              title="Wedstrijd toevoegen"
              subtitle="Uit de catalogus, of maak zelf een koers of wedstrijd"
              onPress={() =>
                router.push({
                  pathname: "/add-event",
                  params: { pouleId },
                })
              }
              isLast
            />
          </Card>
        ) : null}

        <SectionTitle>{`Leden (${members.length})`}</SectionTitle>
        <MembersCard pouleId={pouleId} members={members} />

        <InviteCard
          code={inviteCode}
          onShare={() => sharePouleInvite(poule.name, inviteCode)}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 120 },
});

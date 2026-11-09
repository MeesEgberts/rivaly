import { useQuery } from "convex/react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Platform, ScrollView, Share, StyleSheet } from "react-native";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { SectionTitle } from "@/components/cards/section-title";
import { LoadingScreen } from "@/components/loading-screen";
import { InviteCard } from "@/components/poule/invite-card";
import { MembersCard } from "@/components/poule/members-card";
import { PouleHeroCard } from "@/components/poule/poule-hero-card";
import { ProgramCard } from "@/components/poule/program-card";
import { StandingsCard } from "@/components/poule/standings-card";
import { StandingsPodium } from "@/components/poule/standings-podium";
import { useAppColors } from "@/hooks/use-app-colors";
import { formatInviteCode } from "@/utils/format";

/** Eén poule: kop met jouw plek, stand met podium, programma, leden en uitnodigen. */
export default function PouleScreen() {
  const { pouleId } = useLocalSearchParams<{ pouleId: Id<"poules"> }>();
  const colors = useAppColors();
  const poule = useQuery(api.poules.get, { pouleId });
  const standings = useQuery(api.poules.standings, { pouleId });
  const members = useQuery(api.poules.members, { pouleId });

  if (poule === undefined || standings === undefined || members === undefined) {
    return <LoadingScreen />;
  }

  const inviteCode = formatInviteCode(poule.inviteCode);
  const me = standings.find((row) => row.isMe) ?? null;

  const share = () => {
    Share.share({
      message: `Doe mee met mijn poule "${poule.name}" in Rivaly. Code: ${inviteCode}`,
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: [poule.emoji, poule.name].filter(Boolean).join(" "),
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={Platform.OS === "ios" ? "square.and.arrow.up" : undefined}
          accessibilityLabel="Deel uitnodiging"
          onPress={share}
        >
          Delen
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
      >
        <PouleHeroCard poule={poule} me={me} memberCount={members.length} />

        <SectionTitle>Stand</SectionTitle>
        <StandingsPodium rows={standings} />
        <StandingsCard rows={standings} />

        <SectionTitle>Programma</SectionTitle>
        <ProgramCard events={poule.events} />

        <SectionTitle>{`Leden (${members.length})`}</SectionTitle>
        <MembersCard members={members} />

        <InviteCard code={inviteCode} onShare={share} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12, paddingBottom: 120 },
});

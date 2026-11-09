import { useQuery } from "convex/react";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { Platform, Share } from "react-native";

import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { LoadingScreen } from "@/components/loading-screen";
import { NavRow } from "@/components/ui/nav-row";
import { Screen, Section } from "@/components/ui/screen";
import { formatInviteCode } from "@/utils/format";
import { roleLabel } from "@/utils/poule-text";
import { moduleIcon } from "@/utils/sport-icon";

export default function PouleScreen() {
  const { pouleId } = useLocalSearchParams<{ pouleId: Id<"poules"> }>();
  const poule = useQuery(api.poules.get, { pouleId });
  const standings = useQuery(api.poules.standings, { pouleId });
  const members = useQuery(api.poules.members, { pouleId });

  if (poule === undefined || standings === undefined || members === undefined) {
    return <LoadingScreen />;
  }

  const inviteCode = formatInviteCode(poule.inviteCode);

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

      <Screen>
        <Section title="Stand">
          {standings.map((row) => (
            <NavRow
              key={row.userId}
              leadingText={`${row.rank}`}
              title={row.isMe ? `${row.name} (jij)` : row.name}
              subtitle={`${row.exact}× exact · ${row.predicted} gescoord`}
              value={`${row.points} pt`}
              highlighted={row.isMe}
            />
          ))}
        </Section>

        <Section title="Programma">
          {poule.events.map((event) => (
            <NavRow
              key={event._id}
              icon={moduleIcon(event.moduleKey)}
              title={event.name}
              subtitle={`${event.moduleName} · ${event.presetName}`}
              onPress={() => router.push(`/events/${event._id}`)}
            />
          ))}
        </Section>

        <Section title={`Leden (${members.length})`}>
          {members.map((member) => (
            <NavRow
              key={member.userId}
              icon={member.role === "owner" ? "crown" : "person"}
              title={member.isMe ? `${member.name} (jij)` : member.name}
              value={roleLabel(member.role)}
            />
          ))}
        </Section>

        <Section title="Uitnodigen">
          <NavRow
            icon="person.badge.plus"
            title={inviteCode}
            subtitle="Tik om de code te delen"
            onPress={share}
          />
        </Section>
      </Screen>
    </>
  );
}

import { useMutation } from "convex/react";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@convex/_generated/api";
import type { BracketValue } from "@modules/fixture-types/bracket";
import {
  emptyBracketValue,
  groupOrderOf,
  pickWinner,
  setGroupOrder,
} from "@modules/fixture-types/bracket-tree";
import { BracketBoard } from "@/components/bracket/bracket-board";
import { GroupOrderList } from "@/components/bracket/group-order-list";
import { groupQualifiers } from "@/utils/bracket-groups";
import type { FixtureDetail } from "@/types/fixture-detail";
import { ActionBar } from "@/components/ui/action-bar";
import { ActionButton } from "@/components/ui/action-button";
import { useAppColors } from "@/hooks/use-app-colors";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import { showError } from "@/utils/error-message";

interface Props {
  fixture: FixtureDetail;
}

/**
 * Beheer: de echte bracket bijhouden. Een groep telt pas mee als je zijn
 * eindstand bevestigt; winnaars zet je zodra een wedstrijd gespeeld is.
 */
export function BracketResultEditor({ fixture }: Props) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const setResult = useMutation(api.admin.setResult);

  const saved = fixture.result?.type === "bracket" ? fixture.result : null;
  const [value, setValue] = useState<BracketValue>(saved ?? emptyBracketValue);
  const [isSaving, setIsSaving] = useState(false);

  const participants = useFixtureParticipants(fixture);

  if (fixture.payload.type !== "bracket") {
    return null;
  }

  const payload = fixture.payload;
  const qualifiers = groupQualifiers(payload);

  const submit = async (status: "live" | "finished") => {
    setIsSaving(true);

    try {
      await setResult({
        fixtureId: fixture._id,
        result: value,
        status,
      });
      router.back();
    } catch (error) {
      showError("Mislukt", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.hint, { color: colors.secondaryLabel }]}>
          Bevestig per groep de eindstand zodra de groep klaar is, en tik daarna
          per gespeelde wedstrijd de winnaar.
        </Text>

        <BracketBoard
          payload={payload}
          value={value}
          participants={participants}
          actual={null}
          onPick={(matchId, teamId) =>
            setValue(pickWinner(payload, value, matchId, teamId))
          }
        />

        {payload.groups.map((group) => {
          const confirmed = groupOrderOf(value, group.key);
          const order = confirmed ?? group.teamIds;

          return (
            <GroupOrderList
              key={group.key}
              name={
                confirmed
                  ? `${group.name} · definitief`
                  : `${group.name} · nog open`
              }
              order={order}
              qualifiers={qualifiers.get(group.key) ?? 0}
              participants={participants}
              onReorder={(next) =>
                setValue(setGroupOrder(payload, value, group.key, next))
              }
              footerAction={
                confirmed
                  ? undefined
                  : {
                      label: "Eindstand bevestigen",
                      onPress: () =>
                        setValue(
                          setGroupOrder(payload, value, group.key, order),
                        ),
                    }
              }
            />
          );
        })}
      </ScrollView>

      <View style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <ActionBar>
          <ActionButton
            label="Opslaan als tussenstand"
            onPress={() => submit("live")}
            disabled={isSaving}
          />
          <ActionButton
            label="Opslaan als eindstand"
            variant="secondary"
            onPress={() => submit("finished")}
            disabled={isSaving}
          />
        </ActionBar>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 32 },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginHorizontal: 32,
    marginVertical: 16,
  },
});

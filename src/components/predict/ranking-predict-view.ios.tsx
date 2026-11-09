import {
  Button,
  HStack,
  Host,
  Image,
  List,
  Section,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  environment,
  font,
  foregroundStyle,
  listStyle,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import { BracketGroupListRow } from "@/components/bracket/bracket-group-list-row";
import { iosColors, iosStatusColors } from "@/theme/ios-colors";
import { ModalToolbar } from "@/components/ui/modal-toolbar";
import { useAppColors } from "@/hooks/use-app-colors";
import { useNow } from "@/hooks/use-now";
import { applyMove } from "@/utils/apply-move";
import { formatDateTime } from "@/utils/format";
import { tapFeedback } from "@/utils/haptics";
import { isFixtureOpen } from "@/utils/match-rows";

import {
  initialRanking,
  predictableRankingOptions,
  rankingOptionTeam,
} from "@/utils/ranking";
import { PredictHeaderCard } from "./predict-header-card";
import { PredictLockedCard } from "./predict-locked-card";
import { PoulePredictionsCard } from "./poule-predictions-card";
import { describeContext } from "@/utils/fixture-text";
import type { RankingPredictViewProps } from "./ranking-predict-view";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import { useSavePrediction } from "@/hooks/use-save-prediction";

/**
 * iOS: top N als native lijst in bewerkmodus. Sleep aan ≡ voor de volgorde,
 * haal een team weg met de rode min, en voeg toe vanuit de lijst eronder.
 */
export function RankingPredictView({ fixture }: RankingPredictViewProps) {
  const colors = useAppColors();
  const now = useNow();
  const participants = useFixtureParticipants(fixture);
  const { submit, isSaving } = useSavePrediction(fixture._id);

  const [chosen, setChosen] = useState<string[]>(() => initialRanking(fixture));

  if (fixture.payload.type !== "ranking") {
    return null;
  }

  const payload = fixture.payload;
  const isOpen = isFixtureOpen(fixture, now);
  const teamOf = (id: string) => rankingOptionTeam(payload, participants, id);

  const remaining = predictableRankingOptions(payload).filter(
    (option) => !chosen.includes(option.id),
  );
  const isFull = chosen.length >= payload.size;
  // Moet je alle opties ordenen (4 uit 4), dan valt er niets weg te halen.
  const canRemove = payload.options.length > payload.size;

  if (!isOpen) {
    return (
      <>
        <ModalToolbar />
        <ScrollView
          style={{ backgroundColor: colors.background }}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
        >
          <PredictHeaderCard
            fixture={fixture}
            isOpen={false}
            fallbackTitle="Volgorde"
          />
          <PredictLockedCard fixture={fixture} />
          <PoulePredictionsCard fixture={fixture} />
        </ScrollView>
      </>
    );
  }

  const add = (id: string) => {
    if (isFull) {
      return;
    }

    tapFeedback();
    setChosen((current) => [...current, id]);
  };

  const remove = (indices: number[]) => {
    setChosen((current) =>
      current.filter((_, index) => !indices.includes(index)),
    );
  };

  const move = (sourceIndices: number[], destination: number) => {
    setChosen((current) => applyMove(current, sourceIndices, destination));
  };

  const confirm = () => {
    submit({ type: "ranking", order: chosen });
  };

  const footer = isFull
    ? "Sleep aan ≡ om de volgorde te wijzigen."
    : `Kies nog ${payload.size - chosen.length} uit de lijst hieronder.`;

  return (
    <>
      <ModalToolbar
        onConfirm={confirm}
        isConfirmDisabled={!isFull || isSaving}
      />
      <Host style={styles.host}>
        <List
          modifiers={[
            listStyle("insetGrouped"),
            environment("editMode", "active"),
          ]}
        >
          <Section>
            <VStack alignment="leading" spacing={4}>
              <Text modifiers={[font({ textStyle: "title2", weight: "bold" })]}>
                {fixture.label ?? "Volgorde"}
              </Text>
              <Text
                modifiers={[
                  font({ textStyle: "subheadline" }),
                  foregroundStyle(iosColors.secondaryLabel),
                ]}
              >
                {describeContext(fixture)}
              </Text>
              <Text
                modifiers={[
                  font({ textStyle: "footnote" }),
                  foregroundStyle(iosColors.tertiaryLabel),
                ]}
              >
                {`Sluit ${formatDateTime(fixture.locksAt)}`}
              </Text>
            </VStack>
          </Section>

          <Section
            title={`Jouw top ${payload.size}`}
            footer={<Text>{footer}</Text>}
          >
            <List.ForEach
              data={chosen}
              keyExtractor={(id) => id}
              onMove={move}
              onDelete={canRemove ? remove : undefined}
            >
              {({ item: id, index }) => (
                <BracketGroupListRow
                  position={index + 1}
                  team={teamOf(id)}
                  isQualified={false}
                />
              )}
            </List.ForEach>
          </Section>

          {remaining.length > 0 && !isFull ? (
            <Section title="Voeg toe">
              {remaining.map((option) => (
                <Button key={option.id} onPress={() => add(option.id)}>
                  <HStack spacing={12}>
                    <Image
                      systemName="plus.circle.fill"
                      modifiers={[foregroundStyle(iosStatusColors.success)]}
                    />
                    <Text modifiers={[foregroundStyle(iosColors.label)]}>
                      {option.label}
                    </Text>
                  </HStack>
                </Button>
              ))}
            </Section>
          ) : null}
        </List>
      </Host>
    </>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
});

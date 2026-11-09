import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { SFSymbol } from "sf-symbols-typescript";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { EventFixture } from "@/hooks/use-event-data";
import { useAppColors } from "@/hooks/use-app-colors";
import { shortAnswer } from "@/utils/prediction-cards";
import type { ParticipantMap } from "@/utils/participants";

import { AnswerLine } from "./answer-line";

interface Props {
  fixture: EventFixture;
  icon: SFSymbol;
  participants: ParticipantMap;
  isOpen: boolean;
}

/** Extra vraag als brede kaart: icoon, vraag en jouw antwoord rechts. */
export function QuestionCard({ fixture, icon, participants, isOpen }: Props) {
  const colors = useAppColors();
  const answer = shortAnswer(
    fixture.myPrediction,
    fixture.payload,
    participants,
  );

  return (
    <Pressable
      onPress={() => router.push(`/predict/${fixture._id}`)}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.accentSoft }]}>
        <SymbolView name={icon} size={18} tintColor={colors.accent as string} />
      </View>
      <Text style={[styles.title, { color: colors.label }]} numberOfLines={2}>
        {fixture.label ?? "Vraag"}
      </Text>
      <AnswerLine answer={answer} isOpen={isOpen} />
      <SymbolView
        name="chevron.right"
        size={13}
        tintColor={colors.tertiaryLabel as string}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, fontSize: 16, fontWeight: "500" },
});

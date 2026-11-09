import { router } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { EventFixture } from "@/hooks/use-event-data";
import { useAppColors } from "@/hooks/use-app-colors";
import type { ParticipantMap } from "@/utils/participants";
import { shortAnswer } from "@/utils/prediction-cards";

import { AnswerLine } from "./answer-line";

interface Props {
  fixture: EventFixture;
  /** Beeld bovenaan, bijv. een trui of trofee. */
  visual: ReactNode;
  title: string;
  subtitle?: string;
  participants: ParticipantMap;
  isOpen: boolean;
}

/** Vraag als tegel in een raster van twee: beeld, vraag en jouw antwoord onderaan. */
export function PredictionTile({
  fixture,
  visual,
  title,
  subtitle,
  participants,
  isOpen,
}: Props) {
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
      accessibilityLabel={`${title}, ${answer?.text ?? "nog niet gekozen"}`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      {visual}
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.label }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            numberOfLines={1}
            style={[styles.subtitle, { color: colors.secondaryLabel }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {/* Antwoord altijd onderaan, ook als de ene tegel meer tekst heeft. */}
      <View style={styles.footer}>
        <View style={[styles.divider, { backgroundColor: colors.separator }]} />
        <AnswerLine answer={answer} isOpen={isOpen} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    borderRadius: 20,
    padding: 14,
    gap: 10,
  },
  text: { gap: 2 },
  title: { fontSize: 17, fontWeight: "700" },
  subtitle: { fontSize: 12 },
  footer: { flex: 1, justifyContent: "flex-end", gap: 10 },
  divider: { height: StyleSheet.hairlineWidth },
});

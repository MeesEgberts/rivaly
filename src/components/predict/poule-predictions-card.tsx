import { useQuery } from "convex/react";
import { SymbolView } from "expo-symbols";
import { StyleSheet, Text, View } from "react-native";

import { api } from "@convex/_generated/api";
import { Card } from "@/components/cards/card";
import { CardRow } from "@/components/cards/card-row";
import { Chip } from "@/components/cards/chip";
import { SectionTitle } from "@/components/cards/section-title";
import { Avatar } from "@/components/ui/avatar";
import { useAppColors } from "@/hooks/use-app-colors";
import { useFixtureParticipants } from "@/hooks/use-fixture-participants";
import { useNow } from "@/hooks/use-now";
import type { FixtureDetail } from "@/types/fixture-detail";
import { describeValue } from "@/utils/fixture-text";
import { formatMoment } from "@/utils/prediction-cards";

interface Props {
  fixture: FixtureDetail;
}

/**
 * Wat je poulegenoten op dit onderdeel invulden, per poule waar je met dit
 * evenement in zit. Tot de sluiting blijft het verborgen, tenzij de poule
 * "altijd tonen" heeft gekozen.
 */
export function PoulePredictionsCard({ fixture }: Props) {
  const colors = useAppColors();
  const now = useNow();
  const participants = useFixtureParticipants(fixture);
  const poules = useQuery(api.predictions.forFixtureInMyPoules, {
    fixtureId: fixture._id,
    now,
  });

  if (!poules || poules.length === 0) {
    return null;
  }

  return (
    <>
      <SectionTitle>
        {poules.length === 1 ? "Jouw poule" : "Jouw poules"}
      </SectionTitle>
      {poules.map((poule) => (
        <Card key={poule.pouleId} isFlush>
          <View
            style={[styles.header, { borderBottomColor: colors.separator }]}
          >
            <Text style={styles.emoji}>{poule.emoji ?? "🏆"}</Text>
            <Text
              numberOfLines={1}
              style={[styles.title, { color: colors.label }]}
            >
              {poule.name}
            </Text>
          </View>

          {poule.revealed ? (
            poule.predictions.map((member, index) => (
              <CardRow
                key={member.userId}
                leading={
                  <Avatar
                    name={member.name}
                    imageUrl={member.imageUrl}
                    size={32}
                  />
                }
                title={member.isMe ? `${member.name} (jij)` : member.name}
                subtitle={
                  member.payload
                    ? describeValue(
                        member.payload,
                        fixture.payload,
                        participants,
                      )
                    : "Niet ingevuld"
                }
                trailing={
                  member.points !== null ? (
                    <Chip
                      text={`${member.points} pt`}
                      tint={member.points > 0 ? colors.success : undefined}
                    />
                  ) : undefined
                }
                isHighlighted={member.isMe}
                isLast={index === poule.predictions.length - 1}
              />
            ))
          ) : (
            <View style={styles.hidden}>
              <SymbolView
                name="lock.fill"
                size={14}
                tintColor={colors.tertiaryLabel as string}
              />
              <Text
                style={[styles.hiddenText, { color: colors.secondaryLabel }]}
              >
                Zichtbaar na sluiting ({formatMoment(fixture.locksAt)})
              </Text>
            </View>
          )}
        </Card>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  emoji: { fontSize: 20 },
  title: { flex: 1, fontSize: 17, fontWeight: "700" },
  hidden: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  hiddenText: { fontSize: 15 },
});

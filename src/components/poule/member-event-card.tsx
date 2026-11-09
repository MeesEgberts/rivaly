import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Card } from "@/components/cards/card";
import { Chip } from "@/components/cards/chip";
import { EventMark } from "@/components/event/event-mark";
import { useAppColors } from "@/hooks/use-app-colors";
import {
  memberAnswer,
  memberFixtureTitle,
  pointsLabel,
  type MemberEvent,
} from "@/utils/member-predictions";
import { buildParticipantMap } from "@/utils/participants";

interface Props {
  event: MemberEvent;
}

/**
 * Eén evenement van een poulegenoot: per onderdeel wat hij invulde en wat
 * dat opleverde. Nog open onderdelen tonen een slotje tot de sluiting.
 */
export function MemberEventCard({ event }: Props) {
  const colors = useAppColors();
  const participants = useMemo(
    () => buildParticipantMap(event.participants),
    [event.participants],
  );

  return (
    <Card isFlush>
      <View style={[styles.header, { borderBottomColor: colors.separator }]}>
        <EventMark
          logoUrl={event.logoUrl}
          moduleKey={event.moduleKey}
          size={32}
        />
        <Text numberOfLines={1} style={[styles.title, { color: colors.label }]}>
          {event.name}
        </Text>
        <Text style={[styles.total, { color: colors.secondaryLabel }]}>
          {event.points} pt
        </Text>
      </View>

      {event.fixtures.map((fixture, index) => {
        const answer = memberAnswer(fixture, participants);
        const points = pointsLabel(fixture.points);
        const isLast = index === event.fixtures.length - 1;

        return (
          <View
            key={fixture.fixtureId}
            style={[
              styles.row,
              !isLast && {
                borderBottomColor: colors.separator,
                borderBottomWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            <View style={styles.text}>
              <Text
                numberOfLines={1}
                style={[styles.fixture, { color: colors.secondaryLabel }]}
              >
                {memberFixtureTitle(fixture, participants)}
              </Text>
              <View style={styles.answerRow}>
                {answer.isHidden ? (
                  <SymbolView
                    name="lock.fill"
                    size={12}
                    tintColor={colors.tertiaryLabel as string}
                  />
                ) : null}
                <Text
                  numberOfLines={2}
                  style={[
                    styles.answer,
                    {
                      color:
                        answer.isHidden || !fixture.prediction
                          ? colors.tertiaryLabel
                          : colors.label,
                    },
                  ]}
                >
                  {answer.text}
                </Text>
              </View>
            </View>
            {points ? (
              <Chip
                text={points}
                tint={fixture.points ? colors.success : undefined}
              />
            ) : null}
          </View>
        );
      })}
    </Card>
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
  title: { flex: 1, fontSize: 17, fontWeight: "700" },
  total: { fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  text: { flex: 1, gap: 2 },
  fixture: { fontSize: 13 },
  answerRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  answer: { fontSize: 16, fontWeight: "600", flexShrink: 1 },
});

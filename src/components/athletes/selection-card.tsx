import { Pressable, StyleSheet, Text, View } from "react-native";
import { SymbolView } from "expo-symbols";

import { Card } from "@/components/cards/card";
import { TeamBadge } from "@/components/match/team-badge";
import { RankBadge } from "@/components/poule/rank-badge";
import { useAppColors } from "@/hooks/use-app-colors";
import type { AthleteInfo } from "@/types/athlete";

interface Props {
  title: string;
  /** Per plek de gekozen atleet, of `null` voor een lege plek. */
  slots: (AthleteInfo | null)[];
  /** Zonder handlers (gesloten) alleen weergave. */
  onRemove?: (index: number) => void;
  onMoveUp?: (index: number) => void;
}

/** Jouw keuze: één plek of een top N, met weghalen en omhoog schuiven. */
export function SelectionCard({ title, slots, onRemove, onMoveUp }: Props) {
  const colors = useAppColors();
  const isRanking = slots.length > 1;

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: colors.secondaryLabel }]}>
        {title}
      </Text>
      <Card isFlush>
        {slots.map((athlete, index) => (
          <View
            key={index}
            style={[
              styles.row,
              index < slots.length - 1 && {
                borderBottomColor: colors.separator,
                borderBottomWidth: StyleSheet.hairlineWidth,
              },
            ]}
          >
            {isRanking ? <RankBadge rank={index + 1} size={26} /> : null}
            {athlete ? (
              <>
                {athlete.code ? <TeamBadge code={athlete.code} /> : null}
                <Text
                  numberOfLines={1}
                  style={[styles.name, { color: colors.label }]}
                >
                  {athlete.name}
                </Text>
                {onMoveUp && index > 0 ? (
                  <IconButton
                    icon="arrow.up.circle"
                    label={`${athlete.name} een plek omhoog`}
                    color={colors.secondaryLabel as string}
                    onPress={() => onMoveUp(index)}
                  />
                ) : null}
                {onRemove ? (
                  <IconButton
                    icon="minus.circle.fill"
                    label={`${athlete.name} weghalen`}
                    color={colors.danger as string}
                    onPress={() => onRemove(index)}
                  />
                ) : null}
              </>
            ) : (
              <Text style={[styles.empty, { color: colors.tertiaryLabel }]}>
                Nog niet gekozen
              </Text>
            )}
          </View>
        ))}
      </Card>
    </View>
  );
}

interface IconButtonProps {
  icon: "arrow.up.circle" | "minus.circle.fill";
  label: string;
  color: string;
  onPress: () => void;
}

function IconButton({ icon, label, color, onPress }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <SymbolView name={icon} size={22} tintColor={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  title: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginHorizontal: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  name: { flex: 1, fontSize: 16, fontWeight: "600" },
  empty: { flex: 1, fontSize: 16 },
});

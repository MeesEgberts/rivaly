import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { TeamBadge } from "@/components/match/team-badge";
import { useAppColors } from "@/hooks/use-app-colors";
import type { AthleteInfo } from "@/types/athlete";

interface Props {
  athlete: AthleteInfo;
  onRemove?: () => void;
  /** Toont de ≡-greep: je kunt de rij vasthouden en verslepen. */
  isDraggable: boolean;
}

/** Een gekozen atleet op zijn plek: landcode, naam, weghalen en greep. */
export function ChosenAthleteRow({ athlete, onRemove, isDraggable }: Props) {
  const colors = useAppColors();

  return (
    <View style={[styles.row, { backgroundColor: colors.card }]}>
      {athlete.code ? <TeamBadge code={athlete.code} /> : null}
      <Text numberOfLines={1} style={[styles.name, { color: colors.label }]}>
        {athlete.name}
      </Text>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`${athlete.name} weghalen`}
        >
          <SymbolView
            name="minus.circle.fill"
            size={22}
            tintColor={colors.danger as string}
          />
        </Pressable>
      ) : null}
      {isDraggable ? (
        <SymbolView
          name="line.3.horizontal"
          size={18}
          tintColor={colors.tertiaryLabel as string}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingRight: 14,
  },
  name: { flex: 1, fontSize: 16, fontWeight: "600" },
});

import { StyleSheet, Text, View } from "react-native";

import { SymbolBadge } from "@/components/cards/symbol-badge";
import { TROPHY_COLOR } from "@/constants/result-colors";
import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  emoji: string | null;
  size?: number;
}

/** De emoji van een poule in een rondje, of een gouden trofee zonder emoji. */
export function PouleEmoji({ emoji, size = 52 }: Props) {
  const colors = useAppColors();

  if (!emoji) {
    return <SymbolBadge name="trophy.fill" tint={TROPHY_COLOR} size={size} />;
  }

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.fill,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
});

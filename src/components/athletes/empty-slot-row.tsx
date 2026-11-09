import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  /** Plek die je hier kiest, of `null` bij een keuzevraag met één plek. */
  position: number | null;
  /** De eerstvolgende lege plek: blauw gemarkeerd. */
  isNext: boolean;
  noun: string;
  onPress: () => void;
}

/** Lege plek: de eerstvolgende is blauw en opent het zoekscherm. */
export function EmptySlotRow({ position, isNext, noun, onPress }: Props) {
  const colors = useAppColors();
  const tint = isNext ? colors.accent : colors.tertiaryLabel;
  const text = position === null ? `Kies een ${noun}` : `Kies plek ${position}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: isNext ? colors.accent : colors.separator,
            backgroundColor: isNext ? colors.accentSoft : "transparent",
          },
        ]}
      >
        <SymbolView name="plus" size={14} tintColor={tint as string} />
        <Text style={[styles.text, { color: tint }]}>{text}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, justifyContent: "center", paddingRight: 14 },
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 38,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    paddingHorizontal: 12,
  },
  text: { fontSize: 15, fontWeight: "600" },
  pressed: { opacity: 0.6 },
});

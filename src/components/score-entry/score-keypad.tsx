import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppColors } from "@/hooks/use-app-colors";

import { KEYPAD_ROWS } from "@/constants/keypad-rows";
import { ScoreKeypadKey } from "./score-keypad-key";

interface Props {
  /** Welke wedstrijd nu wordt ingevuld, bijv. "Nederland – Duitsland". */
  title: string;
  onDigit: (digit: number) => void;
  onClear: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onDone: () => void;
  onLayoutHeight: (height: number) => void;
}

/**
 * Cijferblok onderin beeld, in de stijl van het systeemtoetsenbord. Na elk
 * cijfer springt de invoer zelf door naar het volgende vak.
 */
export function ScoreKeypad({
  title,
  onDigit,
  onClear,
  onPrevious,
  onNext,
  onDone,
  onLayoutHeight,
}: Props) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.keypad,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
      onLayout={(event) => onLayoutHeight(event.nativeEvent.layout.height)}
    >
      <View style={[styles.toolbar, { borderBottomColor: colors.separator }]}>
        <Pressable
          onPress={onPrevious}
          hitSlop={8}
          accessibilityLabel="Vorig vak"
        >
          <Text style={[styles.toolbarIcon, { color: colors.accent }]}>‹</Text>
        </Pressable>
        <Pressable
          onPress={onNext}
          hitSlop={8}
          accessibilityLabel="Volgend vak"
        >
          <Text style={[styles.toolbarIcon, { color: colors.accent }]}>›</Text>
        </Pressable>
        <Text
          numberOfLines={1}
          style={[styles.toolbarTitle, { color: colors.secondaryLabel }]}
        >
          {title}
        </Text>
        <Pressable onPress={onClear} hitSlop={8} accessibilityLabel="Wissen">
          <Text style={[styles.toolbarIcon, { color: colors.accent }]}>⌫</Text>
        </Pressable>
        <Pressable onPress={onDone} hitSlop={8} accessibilityRole="button">
          <Text style={[styles.toolbarDone, { color: colors.accent }]}>
            Klaar
          </Text>
        </Pressable>
      </View>

      {KEYPAD_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((digit) => (
            <ScoreKeypadKey
              key={digit}
              label={String(digit)}
              accessibilityLabel={String(digit)}
              onPress={() => onDigit(digit)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 6,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolbarIcon: { fontSize: 26, lineHeight: 30, fontWeight: "300" },
  toolbarTitle: { flex: 1, textAlign: "center", fontSize: 13 },
  toolbarDone: { fontSize: 17, fontWeight: "600" },
  row: { flexDirection: "row", gap: 6, marginBottom: 6 },
});

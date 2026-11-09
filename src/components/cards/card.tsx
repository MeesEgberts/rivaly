import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  children: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Zonder binnenmarge, bijv. voor een kaart vol rijen met eigen marge. */
  isFlush?: boolean;
  style?: ViewStyle;
}

/** Afgeronde kaart op de achtergrond; tikbaar als er een `onPress` is. */
export function Card({
  children,
  onPress,
  accessibilityLabel,
  isFlush = false,
  style,
}: Props) {
  const colors = useAppColors();
  const cardStyle = [
    styles.card,
    !isFlush && styles.padded,
    { backgroundColor: colors.card },
    style,
  ];

  if (!onPress) {
    return <View style={cardStyle}>{children}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [cardStyle, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, overflow: "hidden" },
  padded: { padding: 16 },
  pressed: { opacity: 0.8 },
});

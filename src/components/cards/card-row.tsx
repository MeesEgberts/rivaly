import { SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  /** Beeld links: icoon, avatar of plek. */
  leading?: ReactNode;
  title: string;
  subtitle?: string;
  /** Rechts, bijv. punten of een label. */
  trailing?: ReactNode;
  onPress?: () => void;
  isHighlighted?: boolean;
  /** Laatste rij in de kaart: geen scheidingslijn. */
  isLast?: boolean;
}

/** Rij binnen een `Card`, met optioneel een chevron als hij tikbaar is. */
export function CardRow({
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  isHighlighted = false,
  isLast = false,
}: Props) {
  const colors = useAppColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      style={({ pressed }) => [
        styles.row,
        isHighlighted && { backgroundColor: colors.accentSoft },
        pressed && styles.pressed,
      ]}
    >
      {leading}
      <View
        style={[
          styles.body,
          !isLast && {
            borderBottomColor: colors.separator,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}
      >
        <View style={styles.text}>
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              { color: colors.label },
              isHighlighted && styles.bold,
            ]}
          >
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
        {trailing}
        {onPress ? (
          <SymbolView
            name="chevron.right"
            size={13}
            tintColor={colors.tertiaryLabel as string}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 14,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    paddingRight: 14,
  },
  text: { flex: 1, gap: 1 },
  title: { fontSize: 16 },
  bold: { fontWeight: "600" },
  subtitle: { fontSize: 13 },
  pressed: { opacity: 0.7 },
});

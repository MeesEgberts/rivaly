import { StyleSheet, Text, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  code: string;
  size?: "small" | "large";
  /** Op een accentvlak (gekozen winnaar): lichte badge met witte tekst. */
  isOnAccent?: boolean;
}

/** Korte landcode of clubcode in een afgerond vak, zoals op een scorebord. */
export function TeamBadge({ code, size = "small", isOnAccent = false }: Props) {
  const colors = useAppColors();
  const isLarge = size === "large";

  return (
    <View
      style={[
        isLarge ? styles.large : styles.small,
        {
          backgroundColor: isOnAccent ? "rgba(255,255,255,0.22)" : colors.fill,
        },
      ]}
    >
      <Text
        style={[
          isLarge ? styles.largeText : styles.smallText,
          { color: isOnAccent ? colors.onAccent : colors.secondaryLabel },
        ]}
        numberOfLines={1}
      >
        {code}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  small: {
    width: 34,
    height: 22,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  large: {
    width: 64,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  smallText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  largeText: { fontSize: 15, fontWeight: "700", letterSpacing: 0.5 },
});

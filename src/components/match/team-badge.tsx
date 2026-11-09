import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { flagEmoji } from "@modules/nations";
import { useAppColors } from "@/hooks/use-app-colors";
import { fadeInOnce } from "@/utils/image-fade";

interface Props {
  code: string;
  size?: "small" | "large";
  /** Op een accentvlak (gekozen winnaar): lichte badge met witte tekst. */
  isOnAccent?: boolean;
  /** Clubwapen of logo; heeft voorrang op vlag en code. */
  imageUrl?: string | null;
}

/**
 * Een team in een afgerond vak, zoals op een scorebord: het clubwapen als
 * dat er is, anders de vlag (landen) of de code.
 */
export function TeamBadge({
  code,
  size = "small",
  isOnAccent = false,
  imageUrl,
}: Props) {
  const colors = useAppColors();
  const isLarge = size === "large";
  const flag = flagEmoji(code);

  if (imageUrl) {
    return (
      <View style={isLarge ? styles.large : styles.small}>
        <Image
          source={{ uri: imageUrl }}
          style={isLarge ? styles.largeCrest : styles.smallCrest}
          contentFit="contain"
          transition={fadeInOnce(imageUrl, 150)}
          accessibilityIgnoresInvertColors
        />
      </View>
    );
  }

  return (
    <View
      style={[
        isLarge ? styles.large : styles.small,
        {
          backgroundColor: isOnAccent ? "rgba(255,255,255,0.22)" : colors.fill,
        },
      ]}
    >
      {flag ? (
        <Text style={isLarge ? styles.largeFlag : styles.smallFlag}>
          {flag}
        </Text>
      ) : (
        <Text
          style={[
            isLarge ? styles.largeText : styles.smallText,
            { color: isOnAccent ? colors.onAccent : colors.secondaryLabel },
          ]}
          numberOfLines={1}
        >
          {code}
        </Text>
      )}
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
  smallFlag: { fontSize: 15, lineHeight: 20 },
  smallCrest: { width: 24, height: 22 },
  largeCrest: { width: 48, height: 44 },
  largeFlag: { fontSize: 28, lineHeight: 36 },
});

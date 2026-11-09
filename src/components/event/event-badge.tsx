import { Image } from "expo-image";
import { SymbolView } from "expo-symbols";
import { StyleSheet, View } from "react-native";

import { useAppColors } from "@/hooks/use-app-colors";
import { fadeInOnce } from "@/utils/image-fade";
import { eventColor } from "@/utils/event-text";
import { moduleIcon } from "@/utils/sport-icon";

interface Props {
  logoUrl: string | null;
  moduleKey: string;
  color: string | null;
  size?: number;
}

/**
 * Beeldmerk bovenaan een evenement, zoals het logo van een plek in Apple
 * Kaarten: het logo in een afgeronde tegel, of anders een gekleurd rondje
 * met het sporticoon.
 */
export function EventBadge({ logoUrl, moduleKey, color, size = 84 }: Props) {
  const colors = useAppColors();

  if (logoUrl) {
    return (
      <View
        style={[
          styles.tile,
          styles.shadow,
          {
            width: size,
            height: size,
            borderRadius: size * 0.24,
            borderColor: colors.background,
            backgroundColor: "#FFFFFF",
            padding: size * 0.14,
          },
        ]}
      >
        <Image
          source={{ uri: logoUrl }}
          style={styles.fill}
          contentFit="contain"
          transition={fadeInOnce(logoUrl, 150)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.circle,
        styles.shadow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: colors.background,
          backgroundColor: eventColor(color, moduleKey),
        },
      ]}
    >
      <SymbolView
        name={moduleIcon(moduleKey)}
        size={size * 0.46}
        tintColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { overflow: "hidden", borderWidth: 3 },
  circle: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  fill: { flex: 1 },
  shadow: {
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
});

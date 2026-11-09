import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { SymbolBadge } from "@/components/cards/symbol-badge";
import { useAppColors } from "@/hooks/use-app-colors";
import { fadeInOnce } from "@/utils/image-fade";
import { moduleIcon } from "@/utils/sport-icon";

interface Props {
  logoUrl: string | null;
  /** Foto van de wedstrijd, als miniatuur als er geen logo is. */
  imageUrl?: string | null;
  moduleKey: string;
  size?: number;
}

/**
 * Beeldmerk van een evenement: het logo, anders een miniatuur van de foto,
 * anders het sporticoon.
 */
export function EventMark({ logoUrl, imageUrl, moduleKey, size = 44 }: Props) {
  const colors = useAppColors();
  const radius = size * 0.26;

  if (!logoUrl && imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="cover"
        transition={fadeInOnce(imageUrl, 150)}
      />
    );
  }

  if (!logoUrl) {
    return <SymbolBadge name={moduleIcon(moduleKey)} size={size} />;
  }

  // Logo's zijn vaak transparant en niet vierkant: heel laten op een witte
  // tegel met een randje, zoals app-iconen in een lijst.
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: radius,
          padding: size * 0.12,
          borderColor: colors.separator,
        },
      ]}
    >
      <Image
        source={{ uri: logoUrl }}
        style={styles.logo}
        contentFit="contain"
        transition={fadeInOnce(logoUrl, 150)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  logo: { flex: 1 },
});

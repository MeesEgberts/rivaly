import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { flagEmoji } from "@modules/nations";
import { useAppColors } from "@/hooks/use-app-colors";
import { fadeInOnce } from "@/utils/image-fade";
import { initials } from "@/utils/avatar";

interface Props {
  name: string;
  imageUrl: string | null;
  /** Landcode voor de vlag, bijv. "NED". */
  code: string | null;
  size?: number;
}

/**
 * Een atleet in een rondje: de foto met zijn vlag in de hoek, of alleen de
 * vlag als er (nog) geen foto is. Zonder land: initialen.
 */
export function AthleteAvatar({ name, imageUrl, code, size = 40 }: Props) {
  const colors = useAppColors();
  const flag = flagEmoji(code);
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (imageUrl) {
    return (
      <View style={shape}>
        <Image
          source={{ uri: imageUrl }}
          style={[shape, { backgroundColor: colors.fill }]}
          contentFit="cover"
          // Portretten hebben het gezicht meestal bovenin.
          contentPosition="top"
          transition={fadeInOnce(imageUrl, 150)}
        />
        {flag ? (
          <Text style={[styles.cornerFlag, { fontSize: size * 0.34 }]}>
            {flag}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.circle, shape, { backgroundColor: colors.fill }]}>
      {flag ? (
        <Text style={{ fontSize: size * 0.5, lineHeight: size * 0.62 }}>
          {flag}
        </Text>
      ) : (
        <Text
          style={[
            styles.initials,
            { fontSize: size * 0.36, color: colors.secondaryLabel },
          ]}
        >
          {code ?? initials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
  initials: { fontWeight: "700" },
  cornerFlag: { position: "absolute", right: -3, bottom: -3 },
});

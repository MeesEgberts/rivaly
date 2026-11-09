import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { avatarColor, initials } from "@/utils/avatar";

interface Props {
  name: string;
  imageUrl?: string | null;
  size?: number;
}

/** Profielfoto, of initialen op een vaste kleur per naam. */
export function Avatar({ name, imageUrl, size = 36 }: Props) {
  const shape = { width: size, height: size, borderRadius: size / 2 };

  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={shape} transition={150} />;
  }

  return (
    <View
      style={[styles.circle, shape, { backgroundColor: avatarColor(name) }]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
  initials: { color: "#FFFFFF", fontWeight: "700" },
});

import { StyleSheet, Text, View } from "react-native";

import { PODIUM_COLORS } from "@/constants/cycling-colors";
import { useAppColors } from "@/hooks/use-app-colors";

interface Props {
  rank: number;
  size?: number;
}

/** Plek in een rondje: goud, zilver of brons voor de top 3. */
export function RankBadge({ rank, size = 30 }: Props) {
  const colors = useAppColors();
  const medal = PODIUM_COLORS[rank];

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: medal ?? colors.fill,
        },
      ]}
    >
      <Text
        style={[
          styles.rank,
          { fontSize: size * 0.45, color: medal ? "#FFFFFF" : colors.label },
        ]}
      >
        {rank > 0 ? rank : "–"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: "center", justifyContent: "center" },
  rank: { fontWeight: "800", fontVariant: ["tabular-nums"] },
});
